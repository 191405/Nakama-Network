"""
Security Services Tests

Tests JWT token creation/verification, password hashing,
API key generation, rate limiting, and request signing.
"""
import pytest
import time


class TestJWTService:
    """Test JWT token operations."""

    def test_create_access_token(self):
        from app.services.security import jwt_service
        token = jwt_service.create_access_token(user_id="user_42")
        assert isinstance(token, str)
        assert len(token) > 20

    def test_access_token_contains_user_id(self):
        from app.services.security import jwt_service
        token = jwt_service.create_access_token(user_id="user_42")
        payload = jwt_service.verify_token(token)
        assert payload is not None
        assert payload["sub"] == "user_42"
        assert payload["type"] == "access"

    def test_access_token_with_extra_claims(self):
        from app.services.security import jwt_service
        token = jwt_service.create_access_token(
            user_id="user_42",
            extra_claims={"email": "test@nk.network"}
        )
        payload = jwt_service.verify_token(token)
        assert payload["email"] == "test@nk.network"

    def test_create_refresh_token(self):
        from app.services.security import jwt_service
        token = jwt_service.create_refresh_token(user_id="user_42")
        payload = jwt_service.verify_token(token)
        assert payload["type"] == "refresh"
        assert payload["sub"] == "user_42"

    def test_invalid_token_returns_none(self):
        from app.services.security import jwt_service
        result = jwt_service.verify_token("garbage.token.value")
        assert result is None

    def test_get_user_id_from_token(self):
        from app.services.security import jwt_service
        token = jwt_service.create_access_token(user_id="user_99")
        user_id = jwt_service.get_user_id_from_token(token)
        assert user_id == "user_99"

    def test_get_user_id_from_invalid_token(self):
        from app.services.security import jwt_service
        user_id = jwt_service.get_user_id_from_token("bad_token")
        assert user_id is None

    def test_each_token_has_unique_jti(self):
        from app.services.security import jwt_service
        t1 = jwt_service.create_access_token(user_id="u1")
        t2 = jwt_service.create_access_token(user_id="u1")
        p1 = jwt_service.verify_token(t1)
        p2 = jwt_service.verify_token(t2)
        assert p1["jti"] != p2["jti"]


class TestPasswordService:
    """Test password hashing and verification."""

    def test_hash_password(self):
        from app.services.security import password_service
        hashed = password_service.hash_password("MySecureP@ss123")
        assert isinstance(hashed, str)
        assert hashed != "MySecureP@ss123"
        assert hashed.startswith("$2")  # bcrypt prefix

    def test_verify_correct_password(self):
        from app.services.security import password_service
        hashed = password_service.hash_password("CorrectPassword")
        assert password_service.verify_password("CorrectPassword", hashed) is True

    def test_verify_wrong_password(self):
        from app.services.security import password_service
        hashed = password_service.hash_password("CorrectPassword")
        assert password_service.verify_password("WrongPassword", hashed) is False

    def test_verify_invalid_hash_returns_false(self):
        from app.services.security import password_service
        result = password_service.verify_password("test", "not_a_valid_hash")
        assert result is False

    def test_same_password_produces_different_hashes(self):
        from app.services.security import password_service
        h1 = password_service.hash_password("SamePassword")
        h2 = password_service.hash_password("SamePassword")
        assert h1 != h2  # Different salts


class TestAPIKeyService:
    """Test API key generation and validation."""

    def test_generate_api_key(self):
        from app.services.security import api_key_service
        key = api_key_service.generate_api_key()
        assert key.startswith("nk_")
        assert len(key) > 10

    def test_hash_api_key(self):
        from app.services.security import api_key_service
        key = api_key_service.generate_api_key()
        hashed = api_key_service.hash_api_key(key)
        assert isinstance(hashed, str)
        assert len(hashed) == 64  # SHA-256 hex

    def test_validate_format_valid(self):
        from app.services.security import api_key_service
        key = api_key_service.generate_api_key()
        assert api_key_service.validate_format(key) is True

    def test_validate_format_invalid(self):
        from app.services.security import api_key_service
        assert api_key_service.validate_format("invalid_key") is False
        assert api_key_service.validate_format("nk_") is False
        assert api_key_service.validate_format("") is False


class TestRateLimiter:
    """Test rate limiting logic."""

    def test_allows_requests_under_limit(self):
        from app.services.security import RateLimiter
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        allowed, info = limiter.is_allowed("client_1")
        assert allowed is True
        assert info["remaining"] >= 0

    def test_blocks_requests_over_limit(self):
        from app.services.security import RateLimiter
        limiter = RateLimiter(max_requests=3, window_seconds=60)

        for i in range(3):
            allowed, _ = limiter.is_allowed("client_flood")

        allowed, info = limiter.is_allowed("client_flood")
        assert allowed is False
        assert info["remaining"] == 0

    def test_different_clients_have_separate_limits(self):
        from app.services.security import RateLimiter
        limiter = RateLimiter(max_requests=2, window_seconds=60)

        limiter.is_allowed("client_a")
        limiter.is_allowed("client_a")
        _, info_a = limiter.is_allowed("client_a")

        allowed_b, info_b = limiter.is_allowed("client_b")
        assert allowed_b is True

    def test_reset_clears_client(self):
        from app.services.security import RateLimiter
        limiter = RateLimiter(max_requests=1, window_seconds=60)

        limiter.is_allowed("client_x")
        allowed, _ = limiter.is_allowed("client_x")
        assert allowed is False

        limiter.reset("client_x")
        allowed, _ = limiter.is_allowed("client_x")
        assert allowed is True

    def test_rate_limit_info_structure(self):
        from app.services.security import RateLimiter
        limiter = RateLimiter(max_requests=10, window_seconds=30)
        _, info = limiter.is_allowed("info_test")
        assert "limit" in info
        assert "remaining" in info
        assert "reset" in info
        assert "window" in info
        assert info["limit"] == 10
        assert info["window"] == 30


class TestRequestSigner:
    """Test HMAC request signing."""

    def test_sign_produces_sha256_prefix(self):
        from app.services.security import RequestSigner
        sig = RequestSigner.sign("hello world", "my_secret")
        assert sig.startswith("sha256=")

    def test_verify_correct_signature(self):
        from app.services.security import RequestSigner
        payload = '{"data": "test"}'
        secret = "signing_secret"
        sig = RequestSigner.sign(payload, secret)
        assert RequestSigner.verify(payload, sig, secret) is True

    def test_verify_wrong_signature(self):
        from app.services.security import RequestSigner
        assert RequestSigner.verify("data", "sha256=wrong", "secret") is False

    def test_verify_wrong_secret(self):
        from app.services.security import RequestSigner
        sig = RequestSigner.sign("data", "correct_secret")
        assert RequestSigner.verify("data", sig, "wrong_secret") is False
