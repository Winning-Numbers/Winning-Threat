import asyncio
import json
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import httpx
from typing import Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
import random
import uuid
import time
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

@app.get("/")
def read_root():
    return {"message": "CORS is open to all origins!"}

ML_URL = "http://localhost:5000/predict"   # ML service
FLAG_URL = "https://95.217.75.14:8443/api/flag"  # extern service (listener could also call directly)
API_KEY = "076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419"
flag_headers = {"X-API-Key": API_KEY}

# In-memory storage (poți înlocui cu PostgreSQL)
QUEUE: asyncio.Queue = asyncio.Queue()

class Transaction(BaseModel):
    class Config:
        extra = "allow"

async def call_ml(transaction: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(ML_URL, json=transaction)
        resp.raise_for_status()
        return resp.json()

async def send_flag_to_external(trans_num: str, flag_value: int) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        payload = {"trans_num": trans_num, "flag_value": flag_value}
        resp = await client.post(FLAG_URL, headers=flag_headers, json=payload)
        # nu arunca dacă 4xx/5xx — doar returnează
        try:
            return resp.json()
        except ValueError:
            return {"success": False, "reason": f"non-json response ({resp.status_code})"}

async def process_and_broadcast(transaction: Dict[str, Any]):
    """Apelează ML, trimite flag extern, pune rezultatul în istoric și queue pentru SSE."""
    trans_num = transaction.get("trans_num")
    try:
        ml_resp = await call_ml(transaction)
    except Exception as e:
        ml_resp = {"fraud": False, "score": 0.0, "error": str(e)}

    fraud_bool = bool(ml_resp.get("fraud"))
    score = float(ml_resp.get("score", 0.0))
    # Poți aplica reguli adiționale aici dacă vrei

    # Trimite flag extern (opțional - async, dar îl așteptăm aici)
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
    
@app.get("/test_cors")
def test_cors():
    return {"ok": True}

@app.post("/ingest")
async def ingest(transaction: Transaction, background_tasks: BackgroundTasks):
    tx = transaction.dict()
    # procesare background pentru performanță - răspunzi rapid frontend-ului sau listenerului
    background_tasks.add_task(process_and_broadcast, tx)
    return {"accepted": True, "trans_num": tx.get("trans_num")}

@app.get("/events")
async def get_events(limit: int = 100):
    return EVENTS_HISTORY[-limit:]

@app.get("/hello")
def say_hello():
    return {"message": "Hello, world"}

@app.get("/realtime")
async def realtime(request: Request):
    """
    SSE endpoint — returnează evenimentele pe măsură ce apar.
    Reconnect este automat de partea client.
    """
    async def event_generator():
        # apoi așteaptă evenimente noi
        while True:
            # dacă clientul s-a deconectat => stop
            if await request.is_disconnected():
                break
            try:
                event = await asyncio.wait_for(QUEUE.get(), timeout=15.0)
                yield {"event": "update", "data": json.dumps(event)}
            except asyncio.TimeoutError:
                # keepalive ping pentru a menține conexiunea
                yield {"event": "ping", "data": json.dumps({"ts": asyncio.get_event_loop().time()})}

    return EventSourceResponse(event_generator())

@app.get("/simulate_stream")
async def simulate_stream():
    return EventSourceResponse(
        event_generator(),
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )
