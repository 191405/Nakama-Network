
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os

class Settings(BaseSettings):
    
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
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

    # Backblaze B2 / S3-Compatible Storage
    # Set these in .env file
    b2_endpoint_url: str = ""  # e.g., https://s3.us-west-000.backblazeb2.com
    b2_access_key: str = ""    # Application Key ID
    b2_secret_key: str = ""    # Application Key Secret  
    b2_bucket_name: str = "nk-network-videos"
    
    # Bunny CDN (connected to B2)
    # After linking B2 to Bunny, use your Bunny Pull Zone URL
    cdn_base_url: str = ""     # e.g., https://nk-network.b-cdn.net

    # IONOS SFTP Storage (FREE alternative to cloud storage)
    # Set these in .env file
    sftp_host: str = ""        # e.g., access960253636.webspace-data.io
    sftp_port: int = 22
    sftp_username: str = ""    # SFTP username
    sftp_password: str = ""    # SFTP password
    sftp_base_path: str = "/videos"  # Remote directory for videos
    sftp_public_url: str = ""  # e.g., https://platkelvconcept.net

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "nakamanetworkonline@gmail.com"
    smtp_password: str = "tjamrvzasbuedbnj"
    smtp_email: str = "nakamanetworkonline@gmail.com"
    
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
