import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_session(client):
    response = client.post("/api/auth/login")
    assert response.status_code == 200
    return response.json()
