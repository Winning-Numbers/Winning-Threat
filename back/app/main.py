import asyncio
import json
import random
import uuid
import time
import httpx
import requests
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from sseclient import SSEClient

# ============================================================
# 🔧 CONFIG
# ============================================================
API_KEY = "076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419"
STREAM_URL = "https://95.217.75.14:8443/stream"
FLAG_URL = "https://95.217.75.14:8443/api/flag"
ML_URL = "http://localhost:5000/predict"

flag_headers = {"X-API-Key": API_KEY}

# ============================================================
# 🚀 FASTAPI APP
# ============================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend + Listener rulează!"}

QUEUE: asyncio.Queue = asyncio.Queue()
EVENTS_HISTORY: list[Dict[str, Any]] = [] 

# ===== Model =====
class Transaction(BaseModel):
    class Config:
        extra = "allow"

# ============================================================
# 🤖 HELPERI ML + FLAG
# ============================================================
async def call_ml(transaction: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(ML_URL, json=transaction)
        resp.raise_for_status()
        return resp.json()

async def send_flag_to_external(trans_num: str, flag_value: int) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        payload = {"trans_num": trans_num, "flag_value": flag_value}
        resp = await client.post(FLAG_URL, headers=flag_headers, json=payload)
        try:
            return resp.json()
        except ValueError:
            return {"success": False, "reason": f"non-json response ({resp.status_code})"}

# ============================================================
# ⚙️ PROCESARE TRANZACȚII
# ============================================================
async def process_and_broadcast(transaction: Dict[str, Any]):
    trans_num = transaction.get("trans_num")
    try:
        ml_resp = await call_ml(transaction)
    except Exception as e:
        ml_resp = {"fraud": False, "score": 0.0, "error": str(e)}

    fraud_bool = bool(ml_resp.get("fraud"))
    score = float(ml_resp.get("score", 0.0))

    try:
        flag_result = await send_flag_to_external(trans_num, int(fraud_bool))
    except Exception as e:
        flag_result = {"success": False, "reason": str(e)}

    event = {
        "trans_num": trans_num,
        "transaction": transaction,
        "fraud": fraud_bool,
        "score": score,
        "flag_result": flag_result,
    }

    await QUEUE.put(event)
    EVENTS_HISTORY.append(event)
    if len(EVENTS_HISTORY) > 1000:
        EVENTS_HISTORY.pop(0)

# ============================================================
# 🌐 ENDPOINTS
# ============================================================
@app.post("/ingest")
async def ingest(transaction: Transaction, background_tasks: BackgroundTasks):
    tx = transaction.dict()
    background_tasks.add_task(process_and_broadcast, tx)
    return {"accepted": True, "trans_num": tx.get("trans_num")}

@app.get("/history")
async def get_history(limit: int = 20):
    return EVENTS_HISTORY[-limit:]

@app.get("/latest")
async def get_latest_transaction():
    if not EVENTS_HISTORY:
        return {"message": "Nu există tranzacții încă."}
    return EVENTS_HISTORY[-1]

@app.get("/realtime")
async def realtime(request: Request):
    """Stream live către frontend (SSE)"""
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            try:
                event = await asyncio.wait_for(QUEUE.get(), timeout=15.0)
                yield {"event": "update", "data": json.dumps(event)}
            except asyncio.TimeoutError:
                yield {"event": "ping", "data": json.dumps({"ts": time.time()})}
    return EventSourceResponse(event_generator())

@app.get("/hello")
def say_hello():
    return {"message": "Hello, world"}

# ============================================================
# 📡 BACKGROUND LISTENER (rulează în paralel)
# ============================================================
async def stream_listener_task():
    """Ascultă streamul extern și trimite tranzacțiile către /ingest"""
    await asyncio.sleep(5)  # mic delay până pornește serverul
    print("🚀 Starting external stream listener...")

    headers = {"X-API-Key": API_KEY}
    while True:
        try:
            response = requests.get(STREAM_URL, headers=headers, stream=True, verify=False)
            client = SSEClient(response)

            for event in client.events():
                if not event.data:
                    continue
                try:
                    transaction = json.loads(event.data)
                except json.JSONDecodeError:
                    print("⚠️  Received invalid JSON, skipping...")
                    continue

                trans_num = transaction.get("trans_num", "UNKNOWN")
                print(f"\n💳 New transaction received: {trans_num}")

                # Trimite către propriul backend
                try:
                    backend_url = "http://127.0.0.1:8000/ingest"
                    r = requests.post(backend_url, json=transaction, timeout=10)
                    print(f"✅ Sent to backend ({r.status_code})")
                except Exception as e:
                    print(f"⚠️  Error sending to backend: {e}")

                print("-" * 100)

        except Exception as e:
            print(f"💥 Listener crashed: {e}")
            await asyncio.sleep(10)  # reîncearcă după 10 secunde

# ============================================================
# 🏁 PORNIRE AUTOMATĂ PE RAILWAY
# ============================================================
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(stream_listener_task())
