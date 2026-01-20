
import json
import asyncio
import logging
from typing import Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class InMemoryCache:
    
    def __init__(self):
        self._cache: dict = {}
        self._expiry: dict = {}
    
    async def get(self, key: str) -> Optional[str]:
        if key in self._cache:
            if key in self._expiry and datetime.now().timestamp() > self._expiry[key]:
                del self._cache[key]
                del self._expiry[key]
                return None
            return self._cache[key]
        return None
    
    async def set(self, key: str, value: str, ttl: int = 3600) -> bool:
        self._cache[key] = value
        self._expiry[key] = datetime.now().timestamp() + ttl
        return True
    
    async def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            if key in self._expiry:
                del self._expiry[key]
            return True
        return False
    
    async def exists(self, key: str) -> bool:
        return await self.get(key) is not None

class CacheService:
    
    def __init__(self):
        self._redis = None
        self._memory_cache = InMemoryCache()
        self._connected = False
        self._use_redis = False
    
    async def connect(self):
        from app.config import settings
        
        if settings.use_redis:
            try:
                import redis.asyncio as redis
                self._redis = redis.from_url(
                    settings.redis_url,
                    encoding="utf-8",
                    decode_responses=True
                )
                await self._redis.ping()
                self._use_redis = True
                self._connected = True
                logger.info("✅ Connected to Redis cache")
            except Exception as e:
                logger.warning(f"⚠️ Redis unavailable, using in-memory cache: {e}")
                self._use_redis = False
                self._connected = True
        else:
            self._connected = True
            logger.info("📦 Using in-memory cache (Redis disabled)")
    
    async def disconnect(self):
        if self._redis:
            await self._redis.close()
            self._redis = None
        self._connected = False
    
    async def is_connected(self) -> bool:
        return self._connected
    
    async def get(self, key: str) -> Optional[Any]:
        try:
            if self._use_redis and self._redis:
                value = await self._redis.get(key)
            else:
                value = await self._memory_cache.get(key)
            
            if value:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            if self._use_redis and self._redis:
                await self._redis.setex(key, ttl, value)
            else:
                await self._memory_cache.set(key, value, ttl)
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        try:
            if self._use_redis and self._redis:
                await self._redis.delete(key)
            else:
                await self._memory_cache.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def get_or_set(
        self, 
        key: str, 
        factory, 
        ttl: int = 3600
    ) -> Optional[Any]:
        cached = await self.get(key)
        if cached is not None:
            logger.debug(f"Cache HIT: {key}")
            return cached
        
        logger.debug(f"Cache MISS: {key}")
        value = await factory()
        
        if value is not None:
            await self.set(key, value, ttl)
        
        return value

cache_service = CacheService()
