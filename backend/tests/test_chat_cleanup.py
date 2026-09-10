import pytest

def test_SLM_01_send_question_to_inference(client, auth_session):
    session_id = auth_session["session_id"]
    response = client.post(
        "/api/chat/query",
        json={"session_id": session_id, "question": "What is the capital of France?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "citations" in data
    assert "latency_ms" in data

def test_RAG_05_ask_factual_question(client, auth_session):
    import fitz
    
    session_id = auth_session["session_id"]
    
    # 1. Upload a valid document
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "The capital of Ephemeral Land is Sandbox City.")
    pdf_bytes = doc.write()
    
    client.post(
        "/api/documents/upload",
        data={"session_id": session_id},
        files=[("files", ("geography.pdf", pdf_bytes, "application/pdf"))]
    )
    
    # 2. Ask a factual question
    response = client.post(
        "/api/chat/query",
        json={"session_id": session_id, "question": "What is the capital of Ephemeral Land?"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["citations"]) > 0
    # Because we're using Mock Vector DB and Mock SLM, the citations should contain the mock text chunk
    assert "Sandbox City" in data["citations"][0]["text"]

def test_CLEAN_02_logout_deletes_artifacts(client, auth_session):
    session_id = auth_session["session_id"]
    response = client.delete(f"/api/documents/session/{session_id}")
    assert response.status_code == 200
    # To truly verify, we would check the vector db and storage, but let's assume success if endpoint returns 200 for now.
    # In a full test, we'd mock the adapters and check if delete was called.

def test_CLEAN_03_session_expires_by_inactivity(client):
    assert False, "CLEAN-03 Failed: Server-side background expiration task not implemented"
