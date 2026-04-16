
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os

class Settings(BaseSettings):
    
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    app_url: str = "https://nk-network-project.web.app"
    
    jwt_secret_key: str = "nk_dev_secret_key_change_in_production_2026"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60 * 24
    jwt_refresh_expiry_days: int = 7
    
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    
    api_key_header: str = "X-API-Key"
    
    jikan_base_url: str = "https://api.jikan.moe/v4"
    jikan_rate_limit: float = 0.35
    
    gemini_api_key: str = ""
    
    redis_url: str = "redis://localhost:6379"
    use_redis: bool = True
    
    cors_origins: str = "http://localhost:8081,http://localhost:19006,http://localhost:5173"
    cors_allow_all: bool = True
    
    cache_ttl_trending: int = 3600
    cache_ttl_seasonal: int = 21600
    cache_ttl_search: int = 900
    cache_ttl_details: int = 86400
    cache_ttl_characters: int = 86400

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_email: str = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        return not self.debug
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
