from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from database import get_db
from models import Base
from main import app

# Use a separate test database or in-memory sqlite
TEST_DATABASE_URL = "sqlite:///./test_roadmap.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("./test_roadmap.db"):
            os.remove("./test_roadmap.db")

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

def test_create_node(client):
    response = client.post(
        "/api/nodes",
        json={"title": "Test Initiative", "type": "initiative", "description": "A test description"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Initiative"
    assert data["type"] == "initiative"
    assert "id" in data

def test_get_nodes(client):
    response = client.get("/api/nodes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_create_child_node(client):
    # Get parent ID
    parent_response = client.get("/api/nodes")
    parent_id = parent_response.json()[0]["id"]

    response = client.post(
        "/api/nodes",
        json={"title": "Test Epic", "type": "epic", "description": "Epic description", "parent_id": parent_id}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["parent_id"] == parent_id

def test_get_tree(client):
    response = client.get("/api/tree")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # Check hierarchy
    assert len(data[0]["children"]) >= 1
    assert data[0]["children"][0]["type"] == "epic"
