import json
import threading
import requests
import urllib3
import random
from fastapi import FastAPI
from sseclient import SSEClient
from ML.src.predict import predict, load_model
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, init_db
from .models import Transaction as TransactionModel


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# API config
API_KEY = "076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419"
STREAM_URL = "https://95.217.75.14:8443/stream"
FLAG_URL = "https://95.217.75.14:8443/api/flag"
ML_URL = "http://localhost:8001/predict"
headers = {"X-API-Key": API_KEY}

# Variabilă globală pentru ultima tranzacție
latest_transaction = None
lock = threading.Lock()

# Load model once at startup
ml_model = None

app = FastAPI(title="Fraud Detection API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite orice origine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ Database initialized")

# Rulează ascultătorul de stream într-un thread separat    
def flag_transaction(trans_num, flag_value):
    """
    Flag a transaction as fraud (1) or legitimate (0)

    Args:
        trans_num: Transaction number from the stream
        flag_value: 0 for legitimate, 1 for fraud

    Returns:
        Response from the flag endpoint or None on error
    """
    try:
        payload = {
            "trans_num": trans_num,
            "flag_value": flag_value
        }
        response = requests.post(FLAG_URL, headers=headers, json=payload, verify=False, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print(f"Error: Timeout while flagging transaction {trans_num}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error flagging transaction {trans_num}: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing response for transaction {trans_num}: {e}")
        return None


def get_ml_prediction(transaction):
        global ml_model
        
        # Load model only once (cached after first load)
        if ml_model is None:
            try:
                ml_model = load_model("ML/model.pkl")
            except FileNotFoundError:
                print("⚠️ WARNING: Model file not found. Using fallback prediction (always fraud).")
                print("📋 To fix: Train model locally and upload ML/model.pkl to Railway")
                ml_model = "FALLBACK"  # Marker for fallback mode
        
        # Fallback: if no model, predict fraud (95% of transactions are fraud anyway)
        if ml_model == "FALLBACK":
            print("FALLBACK")
            return 1  # Always predict fraud when model missing
        
        prediction = predict(transaction, ml_model)
        
        if (prediction == 1):
            prediction = 0
        elif (prediction == 0):
            prediction = 1
            
        return prediction

def stream_listener():
    global latest_transaction
    try:
        print("Connecting to stream...")
        response = requests.get(STREAM_URL, headers=headers, stream=True, verify=False)
        response.raise_for_status()
        client = SSEClient(response)
        print("Connected to stream. Waiting for transactions...")

        for event in client.events():
            if event.data:
                transaction = json.loads(event.data)
                with lock:
                    latest_transaction = transaction
                print(f"✅ Received transaction: {transaction.get('trans_num')}")

                # 🔮 Obține predicția ML automat
                prediction = get_ml_prediction(transaction)
                print(f"🤖 ML prediction for {transaction.get('trans_num')}: {prediction}")

                print(f"🏴 Flagging {transaction['trans_num']} as {prediction}")
                flag_transaction(transaction["trans_num"], prediction)
                
                # Save to database
                try:
                    db = SessionLocal()
                    db_transaction = TransactionModel(
                        trans_num=transaction.get("trans_num"),
                        amt=transaction.get("amt"),
                        city_pop=transaction.get("city_pop"),
                        merchant=transaction.get("merchant"),
                        category=transaction.get("category"),
                        lat=transaction.get("lat"),
                        long=transaction.get("long"),
                        merch_lat=transaction.get("merch_lat"),
                        merch_long=transaction.get("merch_long"),
                        first=transaction.get("first"),
                        last=transaction.get("last"),
                        gender=transaction.get("gender"),
                        dob=transaction.get("dob"),
                        job=transaction.get("job"),
                        trans_date=transaction.get("trans_date"),
                        trans_time=transaction.get("trans_time"),
                        unix_time=transaction.get("unix_time"),
                        prediction=prediction,
                        raw_data=transaction
                    )
                    db.add(db_transaction)
                    db.commit()
                    db.close()
                    print(f"💾 Saved transaction {transaction['trans_num']} to database")
                except Exception as e:
                    print(f"❌ Error saving to database: {e}")

    except Exception as e:
        print(f"❌ Stream listener error: {e}")
        
threading.Thread(target=stream_listener, daemon=True).start()

# ===========================
#        ENDPOINTURI
# ===========================

@app.get("/last_transaction")
def get_last_transaction():
    with lock:
        if latest_transaction is None:
            return {"success": False, "message": "No transactions received yet."}
        
        prediction = get_ml_prediction(latest_transaction)  # 🔮 apel API ML
        return {
            "success": True,
            "transaction": latest_transaction,
            "ml_prediction": prediction
        }

@app.get("/")
def root():
    return {"message": "Fraud Detection API is running!"}

@app.get("/transactions")
def get_transactions(limit: int = 100, fraud_only: bool = False):
    """Get list of transactions from database."""
    db = SessionLocal()
    query = db.query(TransactionModel)
    
    if fraud_only:
        query = query.filter(TransactionModel.prediction == 1)
    
    transactions = query.order_by(TransactionModel.created_at.desc()).limit(limit).all()
    db.close()
    
    return {
        "success": True,
        "count": len(transactions),
        "transactions": [
            {
                "trans_num": t.trans_num,
                "amt": t.amt,
                "merchant": t.merchant,
                "category": t.category,
                "prediction": t.prediction,
                "trans_date": t.trans_date,
                "trans_time": t.trans_time,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in transactions
        ]
    }

@app.get("/transactions/{trans_num}")
def get_transaction(trans_num: str):
    """Get a specific transaction by trans_num."""
    db = SessionLocal()
    transaction = db.query(TransactionModel).filter(TransactionModel.trans_num == trans_num).first()
    db.close()
    
    if not transaction:
        return {"success": False, "message": "Transaction not found"}
    
    return {
        "success": True,
        "transaction": {
            "trans_num": transaction.trans_num,
            "amt": transaction.amt,
            "merchant": transaction.merchant,
            "category": transaction.category,
            "prediction": transaction.prediction,
            "raw_data": transaction.raw_data,
            "created_at": transaction.created_at.isoformat() if transaction.created_at else None
        }
    }

@app.get("/stats")
def get_stats():
    """Get fraud detection statistics."""
    db = SessionLocal()
    
    total = db.query(TransactionModel).count()
    fraud_count = db.query(TransactionModel).filter(TransactionModel.prediction == 1).count()
    legitimate_count = total - fraud_count
    
    db.close()
    
    return {
        "success": True,
        "stats": {
            "total_transactions": total,
            "fraud_detected": fraud_count,
            "legitimate": legitimate_count,
            "fraud_rate": round((fraud_count / total * 100), 2) if total > 0 else 0
        }
    }

@app.get("/time_period_inputs")
def get_time_period_inputs(minutes: int = 5):
    """Get transactions from the last X minutes with predictions.
    
    Args:
        minutes: Time period in minutes (default: 5)
    
    Returns:
        List of transactions with predictions from the specified time period
    """
    from datetime import datetime, timedelta, timezone
    
    db = SessionLocal()
    
    # Calculate the cutoff time
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    
    # Query transactions from the last X minutes
    transactions = db.query(TransactionModel).filter(
        TransactionModel.created_at >= cutoff_time
    ).order_by(TransactionModel.created_at.desc()).all()
    
    db.close()
    
    if not transactions:
        return {
            "success": False,
            "message": f"No transactions found in the last {minutes} minutes"
        }
    
    # Format like /last_transaction endpoint
    return {
        "success": True,
        "time_period_minutes": minutes,
        "count": len(transactions),
        "transactions": [
            {
                "transaction": t.raw_data,
                "ml_prediction": t.prediction
            }
            for t in transactions
        ]
    }
    
