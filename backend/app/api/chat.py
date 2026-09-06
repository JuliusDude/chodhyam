from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.adapters.inference.mock_slm_adapter import MockSLMAdapter
from app.adapters.vector.mock_vector_adapter import MockVectorAdapter

router = APIRouter()

# Instantiate adapters (Dependency injection is preferred for production)
inference_service = MockSLMAdapter()
vector_service = MockVectorAdapter()

class ChatRequest(BaseModel):
    session_id: str
    question: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[dict]
    latency_ms: int

@router.post("/query", response_model=ChatResponse)
async def query_chat(request: ChatRequest):
    # 1. Retrieve relevant context from vector store for this session
    relevant_chunks = await vector_service.search(
        session_id=request.session_id,
        query=request.question,
        top_k=3
    )
    
    if not relevant_chunks:
        # In this mock, we'll fake some context if none found so the SLM has something
        context = "No relevant context found in documents."
        citations = []
    else:
        context = "\n".join([c.get("text", "") for c in relevant_chunks])
        citations = relevant_chunks

    # 2. Call SLM Inference
    inference_result = await inference_service.generate_answer(
        question=request.question,
        context=context,
        session_id=request.session_id
    )
    
    return ChatResponse(
        answer=inference_result["answer"],
        citations=citations,
        latency_ms=inference_result["latency_ms"]
    )
