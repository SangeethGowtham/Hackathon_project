from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import uvicorn

load_dotenv()

from agents.scam_agent import analyze_scam_transcript
from agents.voice_agent import analyze_voice_audio
from agents.currency_agent import verify_currency_image
from agents.network_agent import get_fraud_network
from agents.geospatial_agent import get_crime_hotspots
from agents.citizen_agent import chat_with_citizen
from agents.master_agent import generate_threat_fusion_report

app = FastAPI(title="CYBER SHIELD API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Models ────────────────────────────────────────────────────────────

class TranscriptRequest(BaseModel):
    transcript: str
    language: Optional[str] = "English"

class ChatRequest(BaseModel):
    message: str
    session_id: str
    language: Optional[str] = "English"

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "Cyber Shield Backend is running", "multilingual": True}

@app.post("/api/agents/scam")
async def scam_detection(req: TranscriptRequest):
    result = await analyze_scam_transcript(req.transcript, language=req.language)
    return result

@app.post("/api/agents/voice")
async def voice_intelligence(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No audio file uploaded")
    result = await analyze_voice_audio(file)
    return result

@app.post("/api/agents/currency")
async def currency_verification(
    file: UploadFile = File(...),
    language: Optional[str] = Query(default="English"),
):
    if not file:
        raise HTTPException(status_code=400, detail="No image file uploaded")
    # language may also come in as a form field; try to read it gracefully
    result = await verify_currency_image(file, language=language)
    return result

@app.get("/api/agents/network")
async def fraud_network(language: Optional[str] = Query(default="English")):
    result = await get_fraud_network(language=language)
    return result

@app.get("/api/agents/geospatial")
async def geospatial_intelligence(language: Optional[str] = Query(default="English")):
    result = await get_crime_hotspots(language=language)
    return result

@app.post("/api/agents/citizen")
async def citizen_shield(req: ChatRequest):
    result = await chat_with_citizen(req.message, req.session_id, language=req.language)
    return result

@app.get("/api/agents/fusion")
async def threat_fusion(language: Optional[str] = Query(default="English")):
    result = await generate_threat_fusion_report(language=language)
    return result

# ─── Mock Multi-channel Webhooks ──────────────────────────────────────────────

@app.post("/api/webhook/whatsapp")
async def whatsapp_webhook(payload: dict):
    lang = payload.get("language", "English")
    return {
        "status": "success",
        "message": f"WhatsApp message routed to Cyber Shield for processing in {lang}.",
    }

@app.post("/api/webhook/ivr")
async def ivr_webhook(payload: dict):
    lang = payload.get("language", "English")
    return {
        "status": "success",
        "message": f"Voice call converted to text and routed to Cyber Shield in {lang}.",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
