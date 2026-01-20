
from fastapi import APIRouter, Request, Response
from typing import Dict, Any, Optional
import logging
import time

logger = logging.getLogger(__name__)

class APIRouter_v1(APIRouter):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.version = "v1"

class APIRouter_v2(APIRouter):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.version = "v2"

def api_response(
    data: Any = None,
    message: str = "Success",
    status: str = "ok",
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    response = {
        "status": status,
        "message": message,
        "data": data,
        "meta": {
            "timestamp": int(time.time()),
            "version": "1.0.0",
            **(meta or {})
        }
    }
    return response

def paginated_response(
    items: list,
    total: int,
    page: int = 1,
    limit: int = 25,
    message: str = "Success"
) -> Dict[str, Any]:
    total_pages = (total + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1
    
    return api_response(
        data=items,
        message=message,
        meta={
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev
            }
        }
    )

def error_response(
    message: str,
    code: str = "ERROR",
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    return {
        "status": "error",
        "message": message,
        "error": {
            "code": code,
            **(details or {})
        },
        "meta": {
            "timestamp": int(time.time())
        }
    }

class RequestContext:
    
    def __init__(self, request: Request):
        self.request = request
        self.start_time = time.time()
        self.request_id = getattr(request.state, 'request_id', None)
    
    @property
    def duration_ms(self) -> float:
        return (time.time() - self.start_time) * 1000
    
    @property
    def client_ip(self) -> str:
        forwarded = self.request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if self.request.client:
            return self.request.client.host
        return "unknown"
    
    @property
    def user_agent(self) -> str:
        return self.request.headers.get("User-Agent", "unknown")

API_TAGS_METADATA = [
    {
        "name": "Health",
        "description": "Health check and status endpoints"
    },
    {
        "name": "Auth",
        "description": "Authentication and JWT token management"
    },
    {
        "name": "Users",
        "description": "User profile and settings management"
    },
    {
        "name": "Anime",
        "description": "Anime data, trending, and search"
    },
    {
        "name": "Characters",
        "description": "Anime character information"
    },
    {
        "name": "Manga",
        "description": "Manga data and reading"
    },
    {
        "name": "Trivia",
        "description": "Anime trivia games"
    },
    {
        "name": "Arcade",
        "description": "Gaming and matchmaking"
    },
    {
        "name": "Clans",
        "description": "Clan management and social features"
    },
    {
        "name": "Chat",
        "description": "Real-time chat and WebSocket connections"
    },
    {
        "name": "AI",
        "description": "AI Oracle and intelligent features"
    },
    {
        "name": "Achievements",
        "description": "Gamification and achievement system"
    }
]

class ErrorCodes:
    
    AUTH_REQUIRED = "AUTH_REQUIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    
    FORBIDDEN = "FORBIDDEN"
    ADMIN_REQUIRED = "ADMIN_REQUIRED"
    
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    JIKAN_ERROR = "JIKAN_ERROR"
