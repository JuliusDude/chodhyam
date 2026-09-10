import pytest
import fitz

def generate_dummy_pdf(text: str = "Dummy text") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    return doc.write()

def test_PDF_01_upload_valid_pdf(client, auth_session):
    session_id = auth_session["session_id"]
    response = client.post(
        "/api/documents/upload",
        data={"session_id": session_id},
        files=[("files", ("test1.pdf", generate_dummy_pdf(), "application/pdf"))]
    )
    assert response.status_code == 200
    data = response.json()
    assert "uploaded_documents" in data
    assert len(data["uploaded_documents"]) == 1
    assert data["uploaded_documents"][0]["filename"] == "test1.pdf"

def test_PDF_02_upload_multiple_pdfs(client, auth_session):
    session_id = auth_session["session_id"]
    response = client.post(
        "/api/documents/upload",
        data={"session_id": session_id},
        files=[
            ("files", ("test1.pdf", generate_dummy_pdf("1"), "application/pdf")),
            ("files", ("test2.pdf", generate_dummy_pdf("2"), "application/pdf"))
        ]
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["uploaded_documents"]) == 2

def test_PDF_03_upload_unsupported_file_type(client, auth_session):
    session_id = auth_session["session_id"]
    response = client.post(
        "/api/documents/upload",
        data={"session_id": session_id},
        files=[("files", ("test.txt", b"text content", "text/plain"))]
    )
    # Should reject text files based on PRD (only PDF supported currently)
    assert response.status_code == 400, "PDF-03 Failed: Should reject unsupported file types"

def test_PDF_06_exceed_file_size_limit(client, auth_session):
    session_id = auth_session["session_id"]
    # Create a dummy file larger than 10MB
    large_content = b"a" * (11 * 1024 * 1024)
    response = client.post(
        "/api/documents/upload",
        data={"session_id": session_id},
        files=[("files", ("test_large.pdf", large_content, "application/pdf"))]
    )
    assert response.status_code == 400, "PDF-06 Failed: Should reject files > 10MB"
    assert "exceeds 10MB limit" in response.json()["detail"]

def test_RAG_01_extract_text(client, auth_session):
    import fitz
    
    # Create a simple valid PDF in memory
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Hello world from PyMuPDF!")
    pdf_bytes = doc.write()
    
    session_id = auth_session["session_id"]
    response = client.post(
        "/api/documents/upload",
        data={"session_id": session_id},
        files=[("files", ("real_test.pdf", pdf_bytes, "application/pdf"))]
    )
    
    assert response.status_code == 200, "RAG-01 Failed: Could not process valid PDF"
    data = response.json()
    assert data["uploaded_documents"][0]["chunks_created"] > 0
