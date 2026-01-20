
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.services.jikan import jikan_client

router = APIRouter()

class AnimeItem(BaseModel):
    id: int
    title: str
    titleJapanese: Optional[str] = None
    image: Optional[str] = None
    thumbnail: Optional[str] = None
    synopsis: Optional[str] = None
    score: Optional[float] = None
    episodes: Optional[int] = None
    status: Optional[str] = None
    genres: List[str] = []
    year: Optional[int] = None
    rating: Optional[str] = None

class PaginationInfo(BaseModel):
    page: int
    hasNextPage: bool
    totalPages: int

class AnimeListResponse(BaseModel):
    anime: List[AnimeItem]
    pagination: PaginationInfo

GENRES = {
    "action": 1,
    "adventure": 2,
    "comedy": 4,
    "drama": 8,
    "fantasy": 10,
    "horror": 14,
    "romance": 22,
    "sci-fi": 24,
    "slice-of-life": 36,
    "sports": 30,
    "supernatural": 37,
    "suspense": 41,
}

@router.get("/trending", response_model=AnimeListResponse)
async def get_trending(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(25, ge=1, le=50, description="Items per page"),
    filter: str = Query("airing", description="Filter: airing, upcoming, bypopularity, favorite")
):
    result = await jikan_client.get_trending(limit=limit, page=page, filter=filter)
    
    if not result:
        raise HTTPException(status_code=503, detail="Anime service temporarily unavailable")
    
    return result

@router.get("/seasonal", response_model=AnimeListResponse)
async def get_seasonal(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50)
):
    result = await jikan_client.get_seasonal(limit=limit, page=page)
    
    if not result:
        raise HTTPException(status_code=503, detail="Anime service temporarily unavailable")
    
    return result

@router.get("/popular", response_model=AnimeListResponse)
async def get_popular(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50)
):
    result = await jikan_client.get_popular(limit=limit, page=page)
    
    if not result:
        raise HTTPException(status_code=503, detail="Anime service temporarily unavailable")
    
    return result

@router.get("/search", response_model=AnimeListResponse)
async def search_anime(
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50),
    genre: Optional[str] = Query(None, description="Genre filter (e.g., action, romance)")
):
    genre_id = GENRES.get(genre.lower()) if genre else None
    
    if q is None:
        q = ""

    if not genre_id and q.lower() in GENRES:
        genre_id = GENRES[q.lower()]
        
        return await jikan_client.search(
            query="", 
            limit=limit, 
            page=page,
            genres=str(genre_id)
        )

    result = await jikan_client.search(
        query=q, 
        limit=limit, 
        page=page,
        genres=str(genre_id) if genre_id else None
    )
    
    if not result:
        raise HTTPException(status_code=503, detail="Search service temporarily unavailable")
    
    return result

@router.get("/genre/{genre_name}", response_model=AnimeListResponse)
async def get_by_genre(
    genre_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50)
):
    genre_id = GENRES.get(genre_name.lower())
    
    if not genre_id:
        raise HTTPException(
            status_code=400, 
            detail=f"Unknown genre: {genre_name}. Available: {', '.join(GENRES.keys())}"
        )
    
    result = await jikan_client.get_by_genre(genre_id=genre_id, limit=limit, page=page)
    
    if not result:
        raise HTTPException(status_code=503, detail="Genre service temporarily unavailable")
    
    return result

@router.get("/genres")
async def list_genres():
    return {
        "genres": [
            {"id": v, "name": k.replace("-", " ").title()} 
            for k, v in GENRES.items()
        ]
    }

@router.get("/{anime_id}")
async def get_anime_details(anime_id: int):
    result = await jikan_client.get_anime_details(anime_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Anime not found")
    
    return result

@router.get("/{anime_id}/characters")
async def get_anime_characters(anime_id: int):
    result = await jikan_client.get_anime_characters(anime_id)
    
    return {"characters": result}

@router.get("/users/{username}/animelist")
async def get_user_animelist(username: str, status: Optional[str] = None):
    result = await jikan_client.get_user_animelist(username, status)
    return {"anime": result}

@router.get("/schedules")
async def get_schedules(day: Optional[str] = None):
    result = await jikan_client.get_schedules(day)
    return {"anime": result}

@router.get("/top/anime", response_model=AnimeListResponse)
async def get_top_anime(
    type: Optional[str] = None,
    filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50)
):
    
    result = await jikan_client.get_trending(limit=limit, page=page, filter=filter or "bypopularity")
    return result
