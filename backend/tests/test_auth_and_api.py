"""
Auth Router Tests

Tests the authentication API endpoints:
token creation, refresh, verify, logout, and me.
"""
import pytest


class TestAuthToken:
    """Test token creation endpoint."""

    def test_create_token(self, client):
        response = client.post("/auth/token?user_id=user_123&email=test@nk.net")
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    def test_create_token_without_email(self, client):
        response = client.post("/auth/token?user_id=user_456")
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data


class TestAuthRefresh:
    """Test token refresh endpoint."""

    def test_refresh_valid_token(self, client, refresh_token):
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": "totally.invalid.token"}
        )
        assert response.status_code == 401

    def test_refresh_with_access_token_fails(self, client, jwt_token):
        """Using an access token for refresh should fail (wrong type)."""
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": jwt_token}
        )
        assert response.status_code == 401


class TestAuthVerify:
    """Test token verification endpoint."""

    def test_verify_valid_token(self, client, jwt_token):
        response = client.post(
            "/auth/verify",
            headers={"Authorization": f"Bearer {jwt_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["authenticated"] is True

    def test_verify_no_token(self, client):
        response = client.post("/auth/verify")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert data["authenticated"] is False


class TestAuthMe:
    """Test the /me endpoint."""

    def test_me_authenticated(self, client, jwt_token):
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {jwt_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user_123"

    def test_me_unauthenticated(self, client):
        response = client.get("/auth/me")
        assert response.status_code in (401, 403)


class TestAuthLogout:
    """Test the logout endpoint."""

    def test_logout_authenticated(self, client, jwt_token):
        response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {jwt_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Logged out successfully"

    def test_logout_unauthenticated(self, client):
        response = client.post("/auth/logout")
        assert response.status_code in (401, 403)


class TestAnimeEndpoints:
    """Smoke tests for anime API endpoints."""

    def test_list_genres(self, client):
        response = client.get("/anime/genres")
        assert response.status_code == 200
        data = response.json()
        assert "genres" in data
        assert len(data["genres"]) > 0

    def test_genre_has_id_and_name(self, client):
        response = client.get("/anime/genres")
        genre = response.json()["genres"][0]
        assert "id" in genre
        assert "name" in genre

    def test_invalid_genre_returns_400(self, client):
        response = client.get("/anime/genre/nonexistent_genre")
        assert response.status_code == 400


class TestConfigSanity:
    """Test configuration module."""

    def test_settings_loads(self):
        from app.config import settings
        assert settings is not None
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000

    def test_cors_origins_list(self):
        from app.config import settings
        origins = settings.cors_origins_list
        assert isinstance(origins, list)
        assert len(origins) > 0

    def test_is_production_false_in_debug(self):
        from app.config import settings
        assert settings.debug is True
        assert settings.is_production is False
