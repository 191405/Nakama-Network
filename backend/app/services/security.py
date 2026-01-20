
import jwt
import bcrypt
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps

from app.config import settings

logger = logging.getLogger(__name__)

class JWTService:
    
    def __init__(self):
        self.secret_key = settings.jwt_secret_key or self._generate_dev_secret()
        self.algorithm = settings.jwt_algorithm
        self.expiry_minutes = settings.jwt_expiry_minutes
        self.refresh_expiry_days = settings.jwt_refresh_expiry_days
        
        if not settings.jwt_secret_key and settings.is_production:
            logger.critical("⚠️ JWT_SECRET_KEY not set in production! Using generated key.")
    
    def _generate_dev_secret(self) -> str:
        return secrets.token_hex(32)
    
    def create_access_token(
        self, 
        user_id: str, 
        extra_claims: Optional[Dict[str, Any]] = None
    ) -> str:
        now = datetime.utcnow()
        expires = now + timedelta(minutes=self.expiry_minutes)
        
        payload = {
            "sub": user_id,
            "iat": now,
            "exp": expires,
            "type": "access",
            "jti": secrets.token_hex(16),
        }
        
        if extra_claims:
            payload.update(extra_claims)
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        now = datetime.utcnow()
        expires = now + timedelta(days=self.refresh_expiry_days)
        
        payload = {
            "sub": user_id,
            "iat": now,
            "exp": expires,
            "type": "refresh",
            "jti": secrets.token_hex(16),
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            logger.debug("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.debug(f"Invalid token: {e}")
            return None
    
    def get_user_id_from_token(self, token: str) -> Optional[str]:
        payload = self.verify_token(token)
        return payload.get("sub") if payload else None

class PasswordService:
    
    WORK_FACTOR = 12
    
    @classmethod
    def hash_password(cls, password: str) -> str:
        salt = bcrypt.gensalt(rounds=cls.WORK_FACTOR)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @classmethod
    def verify_password(cls, password: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(
                password.encode('utf-8'), 
                hashed.encode('utf-8')
            )
        except Exception:
            return False

class APIKeyService:
    
    PREFIX = "nk_"
    
    @classmethod
    def generate_api_key(cls) -> str:
        key = secrets.token_urlsafe(32)
        return f"{cls.PREFIX}{key}"
    
    @classmethod
    def hash_api_key(cls, api_key: str) -> str:
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @classmethod
    def validate_format(cls, api_key: str) -> bool:
        return api_key.startswith(cls.PREFIX) and len(api_key) > 10

class RateLimiter:
    
    def __init__(
        self, 
        max_requests: int = None, 
        window_seconds: int = None
    ):
        self.max_requests = max_requests or settings.rate_limit_requests
        self.window_seconds = window_seconds or settings.rate_limit_window_seconds
        self._requests: Dict[str, list] = {}
    
    def is_allowed(self, client_id: str) -> tuple[bool, Dict[str, Any]]:
        now = datetime.utcnow().timestamp()
        window_start = now - self.window_seconds
        
        if client_id not in self._requests:
            self._requests[client_id] = []
        
        self._requests[client_id] = [
            ts for ts in self._requests[client_id] 
            if ts > window_start
        ]
        
        current_count = len(self._requests[client_id])
        remaining = max(0, self.max_requests - current_count)
        
        info = {
            "limit": self.max_requests,
            "remaining": remaining,
            "reset": int(window_start + self.window_seconds),
            "window": self.window_seconds
        }
        
        if current_count >= self.max_requests:
            return False, info
        
        self._requests[client_id].append(now)
        info["remaining"] = remaining - 1
        
        return True, info
    
    def reset(self, client_id: str):
        if client_id in self._requests:
            del self._requests[client_id]

class RequestSigner:
    
    @staticmethod
    def sign(payload: str, secret: str) -> str:
        import hmac
        signature = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"
    
    @staticmethod
    def verify(payload: str, signature: str, secret: str) -> bool:
        expected = RequestSigner.sign(payload, secret)
        import hmac
        return hmac.compare_digest(expected, signature)

jwt_service = JWTService()
password_service = PasswordService()
api_key_service = APIKeyService()
rate_limiter = RateLimiter()
