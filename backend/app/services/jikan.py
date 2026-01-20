
import asyncio
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import httpx

from app.config import settings
from app.services.cache import cache_service

logger = logging.getLogger(__name__)

class JikanClient:
    
    def __init__(self):
        self._base_url = settings.jikan_base_url
        self._last_request = 0
        self._min_delay = settings.jikan_rate_limit
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                headers={"User-Agent": "NakamaNetwork/1.0"}
            )
        return self._client
    
    async def _rate_limit(self):
        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_request
        if elapsed < self._min_delay:
            await asyncio.sleep(self._min_delay - elapsed)
        self._last_request = asyncio.get_event_loop().time()
    
    async def _request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        client = await self._get_client()
        url = f"{self._base_url}{endpoint}"
        
        max_retries = 3
        base_delay = 1.0
        
        for attempt in range(max_retries + 1):
            await self._rate_limit()
            try:
                response = await client.get(url, params=params)
                
                if response.status_code == 429:
                    if attempt < max_retries:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Jikan 429 Rate Limit. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Jikan Rate Limit Exceeded after retries")
                        return None
                
                if response.status_code >= 500:
                    if attempt < max_retries:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Jikan Server Error {response.status_code}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                        
                response.raise_for_status()
                return response.json()
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Jikan API error: {e.response.status_code} - {url}")
                return None
            except Exception as e:
                logger.error(f"Jikan request failed: {e}")
                if attempt < max_retries:
                     await asyncio.sleep(base_delay)
                     continue
                return None
        return None

    def _transform_anime(self, anime: Dict) -> Dict:
        return {
            "id": anime.get("mal_id"),
            "title": anime.get("title") or anime.get("title_english"),
            "titleJapanese": anime.get("title_japanese"),
            "image": anime.get("images", {}).get("jpg", {}).get("large_image_url"),
            "thumbnail": anime.get("images", {}).get("jpg", {}).get("small_image_url"),
            "synopsis": anime.get("synopsis"),
            "score": anime.get("score"),
            "scoredBy": anime.get("scored_by"),
            "rank": anime.get("rank"),
            "popularity": anime.get("popularity"),
            "episodes": anime.get("episodes"),
            "status": anime.get("status"),
            "airing": anime.get("airing"),
            "duration": anime.get("duration"),
            "rating": anime.get("rating"),
            "genres": [g.get("name") for g in anime.get("genres", [])],
            "themes": [t.get("name") for t in anime.get("themes", [])],
            "studios": [s.get("name") for s in anime.get("studios", [])],
            "year": anime.get("year") or (anime.get("aired", {}).get("prop", {}).get("from", {}).get("year")),
            "season": anime.get("season"),
            "source": anime.get("source"),
            "trailer": anime.get("trailer", {}).get("youtube_id"),
            "url": anime.get("url"),
        }
    
    def _transform_character(self, char: Dict) -> Dict:
        return {
            "id": char.get("mal_id"),
            "name": char.get("name"),
            "nameKanji": char.get("name_kanji"),
            "image": char.get("images", {}).get("jpg", {}).get("image_url"),
            "about": char.get("about"),
            "favorites": char.get("favorites"),
            "url": char.get("url"),
        }

    async def get_trending(
        self, 
        limit: int = 25, 
        page: int = 1,
        filter: str = "airing"
    ) -> Dict:
        cache_key = f"anime:trending:{filter}:{page}:{limit}"
        
        async def fetch():
            data = await self._request("/top/anime", {
                "filter": filter,
                "limit": limit,
                "page": page
            })
            if data and "data" in data:
                return {
                    "anime": [self._transform_anime(a) for a in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_trending
        )
    
    async def get_seasonal(
        self, 
        limit: int = 25, 
        page: int = 1
    ) -> Dict:
        cache_key = f"anime:seasonal:{page}:{limit}"
        
        async def fetch():
            data = await self._request("/seasons/now", {
                "limit": limit,
                "page": page
            })
            if data and "data" in data:
                return {
                    "anime": [self._transform_anime(a) for a in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_seasonal
        )
    
    async def get_popular(
        self, 
        limit: int = 25, 
        page: int = 1
    ) -> Dict:
        cache_key = f"anime:popular:{page}:{limit}"
        
        async def fetch():
            data = await self._request("/top/anime", {
                "filter": "bypopularity",
                "limit": limit,
                "page": page
            })
            if data and "data" in data:
                return {
                    "anime": [self._transform_anime(a) for a in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_trending
        )
    
    async def search(
        self, 
        query: str, 
        limit: int = 25, 
        page: int = 1,
        genres: str = None
    ) -> Dict:
        cache_key = f"anime:search:{query}:{genres}:{page}:{limit}"
        
        async def fetch():
            params = {
                "q": query,
                "limit": limit,
                "page": page,
                "sfw": "true"
            }
            if genres:
                params["genres"] = genres
            
            data = await self._request("/anime", params)
            if data and "data" in data:
                return {
                    "anime": [self._transform_anime(a) for a in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_search
        )
    
    async def get_by_genre(
        self, 
        genre_id: int, 
        limit: int = 25, 
        page: int = 1
    ) -> Dict:
        cache_key = f"anime:genre:{genre_id}:{page}:{limit}"
        
        async def fetch():
            data = await self._request("/anime", {
                "genres": str(genre_id),
                "limit": limit,
                "page": page,
                "order_by": "score",
                "sort": "desc"
            })
            if data and "data" in data:
                return {
                    "anime": [self._transform_anime(a) for a in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_trending
        )
    
    async def get_anime_details(self, anime_id: int) -> Optional[Dict]:
        cache_key = f"anime:details:{anime_id}"
        
        async def fetch():
            data = await self._request(f"/anime/{anime_id}/full")
            if data and "data" in data:
                return self._transform_anime(data["data"])
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_details
        )
    
    async def get_anime_characters(self, anime_id: int) -> List[Dict]:
        cache_key = f"anime:characters:{anime_id}"
        
        async def fetch():
            data = await self._request(f"/anime/{anime_id}/characters")
            if data and "data" in data:
                return [
                    {
                        **self._transform_character(item.get("character", {})),
                        "role": item.get("role"),
                    }
                    for item in data["data"]
                ]
            return []
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_characters
        )

    async def get_top_characters(self, limit: int = 25, page: int = 1) -> Dict:
        cache_key = f"characters:top:{page}:{limit}"
        
        async def fetch():
            data = await self._request("/top/characters", {
                "limit": limit,
                "page": page
            })
            if data and "data" in data:
                return {
                    "characters": [self._transform_character(c) for c in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_characters
        )
    
    async def search_characters(
        self, 
        query: str, 
        limit: int = 25, 
        page: int = 1
    ) -> Dict:
        cache_key = f"characters:search:{query}:{page}:{limit}"
        
        async def fetch():
            data = await self._request("/characters", {
                "q": query,
                "limit": limit,
                "page": page
            })
            if data and "data" in data:
                return {
                    "characters": [self._transform_character(c) for c in data["data"]],
                    "pagination": {
                        "page": page,
                        "hasNextPage": data.get("pagination", {}).get("has_next_page", False),
                        "totalPages": data.get("pagination", {}).get("last_visible_page", 1)
                    }
                }
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_search
        )
    
    async def get_character_details(self, character_id: int) -> Optional[Dict]:
        cache_key = f"characters:details:{character_id}"
        
        async def fetch():
            data = await self._request(f"/characters/{character_id}/full")
            if data and "data" in data:
                char = data["data"]
                result = self._transform_character(char)
                result["anime"] = [
                    {
                        "id": a.get("anime", {}).get("mal_id"),
                        "title": a.get("anime", {}).get("title"),
                        "role": a.get("role")
                    }
                    for a in char.get("anime", [])
                ]
                return result
            return None
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_characters
        )
    
    async def get_random_character(self) -> Optional[Dict]:
        import random
        
        top = await self.get_top_characters(limit=100)
        if top and top.get("characters"):
            char = random.choice(top["characters"])
            return await self.get_character_details(char["id"])
        return None
    
    async def get_user_animelist(self, username: str, status: str = None) -> List[Dict]:
        cache_key = f"user:{username}:animelist:{status}"
        
        async def fetch():
            params = {}
            if status:
                params["status"] = status
                
            data = await self._request(f"/users/{username}/animelist", params)
            if data and "data" in data:
                return [self._transform_anime(a.get("anime")) for a in data["data"]]
            return []
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_user_list
        )

    async def get_schedules(self, day: str = None) -> Dict:
        cache_key = f"schedules:{day}" if day else "schedules:all"
        
        async def fetch():
            endpoint = f"/schedules/{day}" if day else "/schedules"
            data = await self._request(endpoint)
            if data and "data" in data:
                return [self._transform_anime(a) for a in data["data"]]
            return []
        
        return await cache_service.get_or_set(
            cache_key, 
            fetch, 
            settings.cache_ttl_schedules
        )

jikan_client = JikanClient()
