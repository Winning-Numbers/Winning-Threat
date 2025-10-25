import json
import threading
import requests
import urllib3
import random
from fastapi import FastAPI
from sseclient import SSEClient
from fastapi.middleware.cors import CORSMiddleware


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

app = FastAPI(title="Fraud Detection API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite orice origine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        # response = requests.post(ML_URL, json=transaction, timeout=5)
        # response.raise_for_status()
        # data = response.json()

        prediction = random.choice([0, 1])

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

                flag_transaction(transaction["trans_num"], prediction)

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