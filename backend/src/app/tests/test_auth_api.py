"""Tests for authentication API endpoints."""
import pytest
from datetime import timedelta, datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models.user import User


@pytest.fixture(scope="function")
def test_db():
    """Create a test database."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with database override."""
    from app.main import app

    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(test_db):
    """Create a test user."""
    user = User(email="test@example.com", password="TestPass123")
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


def test_login_success_returns_tokens(client, test_user):
    """Test: POST /api/auth/login - 正常ログイン（トークン返却）."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )

    assert response.status_code == 200
    data = response.json()

    # Verify token response structure
    assert "access_token" in data
    assert "refresh_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"

    # Verify tokens are not empty
    assert len(data["access_token"]) > 0
    assert len(data["refresh_token"]) > 0


def test_login_failure_returns_401(client, test_user):
    """Test: POST /api/auth/login - 認証失敗（401返却）."""
    # Test with wrong password
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401
    data = response.json()
    assert "detail" in data

    # Test with non-existent user
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "SomePassword123"
        }
    )

    assert response.status_code == 401
    data = response.json()
    assert "detail" in data


def test_refresh_token_success(client, test_user):
    """Test: POST /api/auth/refresh - 正常トークン更新."""
    # First login to get refresh token
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )

    assert login_response.status_code == 200
    refresh_token = login_response.json()["refresh_token"]

    # Use refresh token to get new access token
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )

    assert response.status_code == 200
    data = response.json()

    # Verify new access token is returned
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 0


def test_refresh_token_invalid_returns_401(client):
    """Test: POST /api/auth/refresh - 無効トークン（401返却）."""
    # Test with invalid token
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": "invalid.token.here"}
    )

    assert response.status_code == 401
    data = response.json()
    assert "detail" in data

    # Test with empty token
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": ""}
    )

    assert response.status_code == 401


def test_get_current_user_authenticated(client, test_user):
    """Test: GET /api/auth/me - 認証済みユーザー情報取得."""
    # First login to get access token
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )

    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    # Get current user info with valid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    data = response.json()

    # Verify user info structure
    assert "id" in data
    assert "email" in data
    assert data["email"] == "test@example.com"

    # Verify password is not exposed
    assert "password" not in data
    assert "hashed_password" not in data


def test_get_current_user_unauthenticated_returns_401(client):
    """Test: GET /api/auth/me - 未認証（401返却）."""
    # Test without authorization header
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    data = response.json()
    assert "detail" in data

    # Test with invalid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"}
    )

    assert response.status_code == 401

    # Test with malformed authorization header
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "InvalidFormat"}
    )

    assert response.status_code == 401
