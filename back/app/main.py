import json
import threading
import requests
import urllib3
from fastapi import FastAPI
from sseclient import SSEClient

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# API config
API_KEY = "076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419"
STREAM_URL = "https://95.217.75.14:8443/stream"
FLAG_URL = "https://95.217.75.14:8443/api/flag"
headers = {"X-API-Key": API_KEY}

# Variabilă globală pentru ultima tranzacție
latest_transaction = None
lock = threading.Lock()

app = FastAPI(title="Fraud Detection API", version="1.0")

# Funcția care ascultă stream-ul
def stream_listener():
    global latest_transaction
    try:
        print("Connecting to stream...")
        response = requests.get(STREAM_URL, headers=headers, stream=True, verify=False)
        response.raise_for_status()
        client = SSEClient(response)
        print("Connected to stream... Waiting for transactions.")

        for event in client.events():
            if event.data:
                transaction = json.loads(event.data)
                with lock:
                    latest_transaction = transaction
                print(f"✅ Received transaction: {transaction.get('trans_num')}")

    except Exception as e:
        print(f"❌ Stream listener error: {e}")

# Rulează ascultătorul de stream într-un thread separat
threading.Thread(target=stream_listener, daemon=True).start()


# ===========================
#        ENDPOINTURI
# ===========================

@app.get("/last_transaction")
def get_last_transaction():
    """
    Returnează ultima tranzacție primită din stream.
    """
    with lock:
        if latest_transaction is None:
            return {"success": False, "message": "No transactions received yet."}
        return {"success": True, "transaction": latest_transaction}


@app.get("/")
def root():
    return {"message": "Fraud Detection API is running!"}