from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import uuid

# These would ideally be injected via dependency injection in FastAPI
from app.adapters.storage.local_storage_adapter import LocalStorageAdapter
from app.adapters.vector.mock_vector_adapter import MockVectorAdapter

router = APIRouter()

storage_service = LocalStorageAdapter()
vector_service = MockVectorAdapter()

@router.post("/upload")
async def upload_documents(
    session_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    results = []
    
    for file in files:
        doc_id = str(uuid.uuid4())
        content = await file.read()
        
        # 1. Store the original document (Ephemeral Storage)
        storage_key = await storage_service.upload_document(
            session_id=session_id,
            document_id=doc_id,
            file_content=content,
            filename=file.filename
        )
        
        # 2. Process the document (Extract text, chunk, embed)
        # For this prototype, we're simulating chunk extraction
        mock_chunks = [
            {"chunk_id": f"{doc_id}_1", "text": "Mock chunk 1 from " + file.filename},
            {"chunk_id": f"{doc_id}_2", "text": "Mock chunk 2 from " + file.filename}
        ]
        
        # 3. Store in Vector DB
        await vector_service.add_chunks(session_id=session_id, document_id=doc_id, chunks=mock_chunks)
        
        results.append({
            "document_id": doc_id,
            "filename": file.filename,
            "status": "processed",
            "chunks_created": len(mock_chunks)
        })
        
    return {"uploaded_documents": results}

@router.delete("/session/{session_id}")
async def cleanup_session(session_id: str):
    await storage_service.delete_session_documents(session_id)
    await vector_service.delete_session_vectors(session_id)
    return {"message": f"Session {session_id} cleaned up successfully."}
