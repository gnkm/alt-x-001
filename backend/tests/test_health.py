"""Tests for health check endpoint."""

import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client.

    Returns:
        TestClient: FastAPI test client

    """
    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    """Test health check endpoint returns ok status.

    Args:
        client: FastAPI test client

    """
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
