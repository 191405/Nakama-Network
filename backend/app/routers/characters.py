
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.services.jikan import jikan_client
from app.services.gemini import gemini_service

router = APIRouter()

class CharacterItem(BaseModel):
    id: int
    name: str
    nameKanji: Optional[str] = None
    image: Optional[str] = None
    favorites: Optional[int] = None

class CharacterDetail(CharacterItem):
    about: Optional[str] = None
    anime: Optional[List[dict]] = None
    trait: Optional[str] = None
    quote: Optional[str] = None
    funFact: Optional[str] = None

class PaginationInfo(BaseModel):
    page: int
    hasNextPage: bool
    totalPages: int

class CharacterListResponse(BaseModel):
    characters: List[CharacterItem]
    pagination: PaginationInfo

@router.get("/top", response_model=CharacterListResponse)
async def get_top_characters(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50)
):
    result = await jikan_client.get_top_characters(limit=limit, page=page)
    
    if not result:
        raise HTTPException(status_code=503, detail="Character service temporarily unavailable")
    
    return result

@router.get("/search", response_model=CharacterListResponse)
async def search_characters(
    q: str = Query(..., min_length=3),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=50)
):
    result = await jikan_client.search_characters(query=q, page=page, limit=limit)
    
    if not result:
        return {
            "characters": [], 
            "pagination": {
                "page": page, 
                "hasNextPage": False, 
                "totalPages": 0
            }
        }
    
    return result

@router.get("/random", response_model=CharacterDetail)
async def get_random_character():
    result = await jikan_client.get_random_character()
    
    if not result:
        raise HTTPException(status_code=503, detail="Could not fetch random character")
    
    char_name = result.get("name", "Unknown")
    anime_name = result.get("anime", [{}])[0].get("title", "Unknown Anime") if result.get("anime") else "Unknown Anime"
    
    ai_info = await gemini_service.get_character_info(char_name, anime_name)
    
    return {
        **result,
        "trait": ai_info.get("trait"),
        "quote": ai_info.get("quote"),
        "funFact": ai_info.get("funFact"),
    }

@router.get("/daily", response_model=CharacterDetail)
async def get_daily_character():
    from datetime import date
    
    today_ordinal = date.today().toordinal()
    page = (today_ordinal % 5) + 1 
    index = (today_ordinal % 25)
    
    top_chars = await jikan_client.get_top_characters(page=page, limit=25)
    
    if not top_chars or not top_chars.get("characters"):
        raise HTTPException(status_code=503, detail="Could not fetch daily character")
        
    try:
        character_summary = top_chars["characters"][index]
        character_id = character_summary["id"]
        
        result = await jikan_client.get_character_details(character_id)
        if not result:
            result = character_summary

        char_name = result.get("name", "Unknown")
        anime_name = result.get("anime", [{}])[0].get("title", "Unknown Anime") if result.get("anime") else "Unknown Anime"
        
        ai_info = await gemini_service.get_character_info(char_name, anime_name)
        
        return {
            **result,
            "trait": ai_info.get("trait"),
            "quote": ai_info.get("quote"),
            "funFact": ai_info.get("funFact"),
        }
    except (IndexError, KeyError) as e:
        return await get_random_character()

@router.get("/{character_id}", response_model=CharacterDetail)
async def get_character_details(character_id: int):
    result = await jikan_client.get_character_details(character_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Character not found")
    
    return result
