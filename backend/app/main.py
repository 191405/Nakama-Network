
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import anime, characters, ai, episodes, chat, interaction, reviews, clans, users, feedback, auth, trivia, achievements, manga, encoder, arcade
from app.services.cache import cache_service
from app.database import engine, Base
from app.middleware import (
    RateLimitMiddleware, 
    RequestLoggingMiddleware, 
    SecurityHeadersMiddleware
)

logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Nakama Network API...")
    await cache_service.connect()
    logger.info(f"📡 Running on {settings.host}:{settings.port}")
    logger.info(f"🔒 Production mode: {settings.is_production}")
    
    yield
    
    logger.info("👋 Shutting down Nakama Network API...")
    await cache_service.disconnect()

app = FastAPI(
    title="Nakama Network API",
    description="Backend API for the Nakama Network anime community platform",
    version="2.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    RateLimitMiddleware,
    exclude_paths=["/health", "/docs", "/openapi.json", "/redoc"]
)

if settings.cors_allow_all and settings.debug:
    logger.warning("⚠️ CORS allowing all origins (development mode)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-API-Key", "X-Request-ID"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "X-Request-ID"],
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.error(f"[{request_id}] Unhandled error: {str(exc)}", exc_info=True)
    
    if settings.is_production:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "request_id": request_id
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "error": str(exc),
                "type": type(exc).__name__,
                "request_id": request_id
            }
        )

API_PREFIX = ""

app.include_router(anime.router, prefix=f"{API_PREFIX}/anime", tags=["Anime"])
app.include_router(characters.router, prefix=f"{API_PREFIX}/characters", tags=["Characters"])
app.include_router(ai.router, prefix=f"{API_PREFIX}/ai", tags=["AI"])
app.include_router(episodes.router, prefix=f"{API_PREFIX}/episodes", tags=["Episodes"])
app.include_router(chat.router, prefix=API_PREFIX, tags=["Chat"])
app.include_router(interaction.router, prefix=f"{API_PREFIX}/interaction", tags=["Interaction"])
app.include_router(reviews.router, prefix=f"{API_PREFIX}/reviews", tags=["Reviews"])
app.include_router(clans.router, prefix=f"{API_PREFIX}/clans", tags=["Clans"])
app.include_router(users.router, prefix=f"{API_PREFIX}/users", tags=["Users"])
app.include_router(feedback.router, prefix=API_PREFIX, tags=["Feedback"])
app.include_router(trivia.router, prefix=f"{API_PREFIX}/trivia", tags=["Trivia"])
app.include_router(achievements.router, prefix=f"{API_PREFIX}/achievements", tags=["Achievements"])
app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["Auth"])
app.include_router(manga.router, prefix=f"{API_PREFIX}/manga", tags=["Manga"])
app.include_router(encoder.router, prefix=f"{API_PREFIX}/encoder", tags=["Encoder"])
app.include_router(arcade.router, prefix=f"{API_PREFIX}/arcade", tags=["Arcade"])

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": "Nakama Network API",
        "version": "2.0.0"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    cache_status = await cache_service.is_connected()
    
    return {
        "status": "healthy" if cache_status else "degraded",
        "version": "2.0.0",
        "environment": "development" if settings.debug else "production",
        "services": {
            "api": True,
            "cache": cache_status,
            "jikan": True,
            "gemini": bool(settings.gemini_api_key),
            "smtp": bool(settings.smtp_password)
        },
        "security": {
            "jwt_configured": bool(settings.jwt_secret_key),
            "rate_limiting": True,
            "cors_restricted": not settings.cors_allow_all
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info" if not settings.debug else "debug"
    )
