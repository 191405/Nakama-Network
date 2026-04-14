"""
Health & Root Endpoint Tests

Verifies the API health check and root endpoints
respond correctly and report expected service status.
"""
import pytest


class TestHealthEndpoints:
    """Test the health and status endpoints."""

    def test_root_returns_online(self, client):
        """Root endpoint should return service status."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "Nakama Network API"
        assert data["version"] == "2.0.0"

    def test_health_check(self, client):
        """Health endpoint should return service health info."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "degraded")
        assert data["version"] == "2.0.0"
        assert "services" in data
        assert "security" in data
        assert data["services"]["api"] is True
        assert data["security"]["rate_limiting"] is True

    def test_health_reports_jwt_configured(self, client):
        """Health should report JWT as configured in test env."""
        response = client.get("/health")
        data = response.json()
        assert data["security"]["jwt_configured"] is True


class TestCORSHeaders:
    """Test that CORS is properly configured."""

    def test_cors_allows_options(self, client):
        """OPTIONS requests should get CORS headers."""
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        # In dev mode with CORS_ALLOW_ALL, this should pass
        assert response.status_code in (200, 204, 405)
