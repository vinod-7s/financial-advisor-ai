from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil
import os

from backend.database import engine, SessionLocal
from backend.models import Base, ChatHistory
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.agent import generate_report
from backend.rag.vector_store import ingest_pdf
from backend.database import engine
from backend.models import Base
from backend.models import Base, ChatHistory
Base.metadata.create_all(bind=engine)
from backend.services.stock_service import get_stock_info
from backend.services.compare_service import compare_stocks
from backend.services.chart_service import get_chart_data
from backend.services.news_service import get_financial_news
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Configurations & Variables ---
# Ensure these variables and functions exist in your actual code
UPLOAD_DIR = Path("./uploaded_pdfs")
UPLOAD_DIR.mkdir(exist_ok=True)

chat_history: List[Dict[str, str]] = []


# Dummy placeholder functions (Replace with your actual implementations)
def ask_pdf(query: str) -> Any:
    return {"answer": "Sample PDF answer", "sources": ["doc1.pdf"]}


def ask_agent(prompt: str) -> str:
    return "Sample AI response"


def hybrid_research(question: str, symbol: Optional[str]) -> Dict[str, Any]:
    return {"result": f"Researching {question} for {symbol}"}


# --- Pydantic Models ---
class ChatRequest(BaseModel):
    question: str


class ResearchRequest(BaseModel):
    question: str
    symbol: Optional[str] = None


# --- Endpoints ---
from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str

class ResearchRequest(BaseModel):
    question: str
    symbol: str | None = None

class ReportRequest(BaseModel):
    symbol: str

from backend.agent import (
    route_question,
    ask_agent,
    ask_pdf
)
@app.post("/chat")
def chat(req: ChatRequest):

    db = SessionLocal()

    # Save user message
    db.add(
        ChatHistory(
            role="user",
            content=req.question
        )
    )
    db.commit()

    route = route_question(req.question)

    if route == "pdf":

        result = ask_pdf(req.question)

        response = result["answer"]
        sources = result["sources"]

    elif route == "finance":

        response = ask_agent(req.question)

        sources = []

    else:

        response = ask_agent(req.question)

        sources = []

    # Save assistant response
    db.add(
        ChatHistory(
            role="assistant",
            content=response
        )
    )

    db.commit()
    db.close()

    return {
        "response": response,
        "sources": sources
    }

@app.post("/research")
def research(req: ResearchRequest):
    return hybrid_research(req.question, req.symbol)


@app.get("/pdfs")
def list_pdfs():
    files = [f.name for f in UPLOAD_DIR.glob("*.pdf")]
    return {"files": files}


@app.delete("/pdfs/{filename}")
def delete_pdf(filename: str):
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    file_path.unlink()
    return {"message": f"{filename} deleted"}

from backend.agent import generate_report

@app.post("/generate-report")
def create_report(req: ReportRequest):

    report = generate_report(
        req.symbol
    )

    return {
        "report": report
   }
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await ingest_pdf(str(file_path))

    return {
        "message": result
    }
@app.get("/stock/{symbol}")
def stock(symbol: str):

    return get_stock_info(symbol)

@app.get("/compare/{symbol1}/{symbol2}")
def compare(symbol1: str, symbol2: str):

    return compare_stocks(symbol1, symbol2)

@app.get("/chart/{symbol}")
def chart(symbol: str):

    return get_chart_data(symbol)

@app.get("/news")
def news():

    return get_financial_news()

@app.get("/news")
def news():
    return {
        "status": "ok",
        "data": [
            {
                "title": "Test News",
                "summary": "Backend working"
            }
        ]
    }
@app.get("/history")
def get_history():

    db = SessionLocal()

    messages = db.query(ChatHistory).all()

    db.close()

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content
        }
        for m in messages
    ]

@app.delete("/history")
def clear_history():

    db = SessionLocal()

    db.query(ChatHistory).delete()

    db.commit()

    db.close()

    return {
        "message": "History cleared"
    }
@app.get("/history")
def get_history():
    db = SessionLocal()

    chats = db.query(ChatHistory).all()

    return [
        {
            "id": c.id,
            "role": c.role,
            "content": c.content
        }
        for c in chats
    ]


@app.delete("/history")
def clear_history():
    db = SessionLocal()

    db.query(ChatHistory).delete()
    db.commit()

    return {"message": "History cleared"}