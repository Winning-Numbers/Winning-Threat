
import json
import requests
from sseclient import SSEClient

# === CONFIG ===
API_KEY = "076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419"
STREAM_URL = "https://95.217.75.14:8443/stream"
BACKEND_INGEST_URL = "http://127.0.0.1:8000/ingest"  # Endpointul FastAPI-ului tău local

headers = {
    "X-API-Key": API_KEY
}

# === MAIN ===
print("🚀 Connecting to external transaction stream...")
response = requests.get(STREAM_URL, headers=headers, stream=True)
client = SSEClient(response)

# === PROCESS LOOP ===
for event in client.events():
    if not event.data:
        continue

    try:
        transaction = json.loads(event.data)
    except json.JSONDecodeError:
        print("⚠️  Received invalid JSON, skipping...")
        continue

    trans_num = transaction.get("trans_num", "UNKNOWN")
        
    try:
        # Trimitem întreaga tranzacție (toate câmpurile) către FastAPI
        r = requests.post(BACKEND_INGEST_URL, json=transaction, timeout=10)

    except requests.RequestException as e:
        print(f"⚠️  Network error while sending to backend: {e}")

    print("-" * 100)