
import time
import logging
import uuid
from typing import Callable, Optional
from functools import wraps

from fastapi import Request, Response, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import settings
from app.services.security import jwt_service, rate_limiter

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name=settings.api_key_header, auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[str]:
    if credentials is None:
        return None
    
    token = credentials.credentials
    user_id = jwt_service.get_user_id_from_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user_id

async def require_auth(
    user_id: Optional[str] = Depends(get_current_user)
) -> str:
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user_id

async def optional_auth(
    user_id: Optional[str] = Depends(get_current_user)
) -> Optional[str]:
    return user_id

class RateLimitMiddleware(BaseHTTPMiddleware):
    
    def __init__(self, app, exclude_paths: list = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/openapi.json"]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if any(request.url.path.startswith(p) for p in self.exclude_paths):
            return await call_next(request)
        
        client_ip = request.headers.get(
            "X-Forwarded-For", 
            request.client.host if request.client else "unknown"
        ).split(",")[0].strip()
        
        allowed, info = rate_limiter.is_allowed(client_ip)
        
        if not allowed:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "retry_after": info["reset"] - int(time.time())
                },
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(info["reset"]),
                    "Retry-After": str(info["reset"] - int(time.time()))
                }
            )
        
        response = await call_next(request)
        
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset"])
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:8]
        
        request.state.request_id = request_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            duration_ms = (time.time() - start_time) * 1000
            
            logger.info(
                f"[{request_id}] {request.method} {request.url.path} "
                f"→ {response.status_code} ({duration_ms:.1f}ms)"
            )
            
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[{request_id}] {request.method} {request.url.path} "
                f"→ ERROR ({duration_ms:.1f}ms): {str(e)}"
            )
            raise

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        if "server" in response.headers:
            del response.headers["server"]
        
        return response

def require_admin(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(*args, user_id: str, **kwargs):
        return await func(*args, user_id=user_id, **kwargs)
    return wrapper

def rate_limit(max_requests: int, window_seconds: int):
    def decorator(func: Callable) -> Callable:
        endpoint_limiter = {} 
        
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.headers.get(
                "X-Forwarded-For", 
                request.client.host if request.client else "unknown"
            ).split(",")[0].strip()
            
            key = f"{func.__name__}:{client_ip}"
            now = time.time()
            
            if key not in endpoint_limiter:
                endpoint_limiter[key] = []
            
            endpoint_limiter[key] = [
                ts for ts in endpoint_limiter[key] 
                if ts > now - window_seconds
            ]
            
            if len(endpoint_limiter[key]) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: {max_requests} requests per {window_seconds}s"
                )
            
            endpoint_limiter[key].append(now)
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"

def mask_sensitive_data(data: dict, keys: list = None) -> dict:
    sensitive_keys = keys or ["password", "token", "secret", "api_key", "authorization"]
    masked = data.copy()
    
    for key in masked:
        if any(s in key.lower() for s in sensitive_keys):
            masked[key] = "***MASKED***"
    
    return masked
