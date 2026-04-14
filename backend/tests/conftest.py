"""
Backend Test Configuration

Sets up the FastAPI TestClient and overrides
for database and external service dependencies.
"""
import pytest
import sys
import os

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Set test environment variables BEFORE any imports
os.environ["DEBUG"] = "true"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_only"
os.environ["GEMINI_API_KEY"] = ""
os.environ["USE_REDIS"] = "false"
os.environ["SMTP_PASSWORD"] = ""
os.environ["CORS_ALLOW_ALL"] = "true"


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)


@pytest.fixture
def jwt_token():
    """Generate a valid JWT token for authenticated requests."""
    from app.services.security import jwt_service
    return jwt_service.create_access_token(user_id="test_user_123")


@pytest.fixture
def refresh_token():
    """Generate a valid refresh token."""
    from app.services.security import jwt_service
    return jwt_service.create_refresh_token(user_id="test_user_123")
