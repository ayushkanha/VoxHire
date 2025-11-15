import uuid
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import run_agent_turn
from tools import save_qa_tool


app = FastAPI()

# Allow CORS from any origin for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str
    message: str
    domain: str | None = None



class SaveRequest(BaseModel):
    question: str
    answer: str
    session_id: str | None = None


@app.get("/api/start")
def start_session():
    session_id = str(uuid.uuid4())
    return {"session_id": session_id}


@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    try:
        print ("Received chat request:", request)
        agent_response = run_agent_turn(
    message=request.message,
    session_id=request.session_id,
    domain=request.domain
)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"question": agent_response}


@app.post("/api/save")
def save_endpoint(request: SaveRequest):
    """Save a question/answer pair to the interview log via tools.save_qa_tool.

    This endpoint is provided so the frontend can explicitly persist QA pairs.
    """
    try:
        # Call the tool function directly. It returns a string message.
        result = save_qa_tool(request.question, request.answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "detail": result}


if __name__ == "__main__":
    # Allow running with: python main.py
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
