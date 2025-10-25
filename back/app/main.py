import asyncio
import json
import random
import uuid
import time
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, BackgroundTasks
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import httpx
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ===== CORS config =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "CORS is open to all origins!"}

# ===== Constante =====
ML_URL = "http://localhost:5000/predict"
FLAG_URL = "https://95.217.75.14:8443/api/flag"
API_KEY = "076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419"
flag_headers = {"X-API-Key": API_KEY}

# ===== Stocare in memorie =====
QUEUE: asyncio.Queue = asyncio.Queue()
EVENTS_HISTORY: list[Dict[str, Any]] = [] 

# ===== Model =====
class Transaction(BaseModel):
    class Config:
        extra = "allow"

# ===== Helperi =====
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

async def process_and_broadcast(transaction: Dict[str, Any]):
    """Apelează ML, trimite flag extern, adaugă în istoric și trimite prin SSE."""
    trans_num = transaction.get("trans_num")
    try:
        ml_resp = await call_ml(transaction)
    except Exception as e:
        ml_resp = {"fraud": False, "score": 0.0, "error": str(e)}

    fraud_bool = bool(ml_resp.get("fraud"))
    score = float(ml_resp.get("score", 0.0))

    # Trimite flag extern
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

    # pune în coadă pentru SSE
    await QUEUE.put(event)

    # adaugă în istoric (max 1000)
    EVENTS_HISTORY.append(event)
    if len(EVENTS_HISTORY) > 1000:
        EVENTS_HISTORY.pop(0)

# ===== Endpoints =====

@app.post("/ingest")
async def ingest(transaction: Transaction, background_tasks: BackgroundTasks):
    tx = transaction.dict()
    background_tasks.add_task(process_and_broadcast, tx)
    return {"accepted": True, "trans_num": tx.get("trans_num")}

@app.get("/history")
async def get_history(limit: int = 20):
    """
    Returnează ultimele tranzacții procesate (fără SSE).
    Poți seta ?limit=50 pentru mai multe.
    """
    return EVENTS_HISTORY[-limit:]

@app.get("/latest")
async def get_latest_transaction():
    """Returnează ultima tranzacție procesată."""
    if not EVENTS_HISTORY:
        return {"message": "Nu există tranzacții încă."}
    return EVENTS_HISTORY[-1]

@app.get("/realtime")
async def realtime(request: Request):
    """SSE endpoint — trimite evenimentele în timp real."""
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

@app.get("/simulate_stream")
async def simulate_stream(request: Request, interval: float = 5.0, count: Optional[int] = 0):
    """Generează tranzacții random pentru test."""
    merchants = ["ShopA", "ShopB", "PizzaPlace", "MegaStore"]
    async def generator():
        sent = 0
        while True:
            if await request.is_disconnected():
                break
            if count and sent >= count:
                break
            trans_num = str(uuid.uuid4())[:8]
            transaction = {
                "trans_num": trans_num,
                "amount": round(random.uniform(1.0, 2000.0), 2),
                "merchant": random.choice(merchants),
                "card_id": "CARD-" + str(random.randint(1000, 9999)),
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            score = round(random.random(), 4)
            fraud_bool = score > 0.85
            flag_result = {"simulated": True, "reported": fraud_bool}
            event = {
                "trans_num": trans_num,
                "transaction": transaction,
                "fraud": fraud_bool,
                "score": score,
                "flag_result": flag_result,
            }
            # pune și în istoric
            EVENTS_HISTORY.append(event)
            if len(EVENTS_HISTORY) > 1000:
                EVENTS_HISTORY.pop(0)
            yield {"event": "update", "data": json.dumps(event)}
            sent += 1
            await asyncio.sleep(interval)
    return EventSourceResponse(generator())

@app.get("/hello")
def say_hello():
    return {"message": "Hello, world"}
