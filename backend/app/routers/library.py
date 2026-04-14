from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.database import get_db
from app.models import sql
from app.services.jikan import jikan_client
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/idx/{mal_id}")
async def import_anime_to_library(mal_id: int, db: Session = Depends(get_db)):
    """
    Import anime metadata from Jikan (MAL) into local database.
    This creates a robust local copy so uploads can be attached.
    """
    # 1. Check if already exists locally
    local_anime = db.query(sql.Anime).filter(sql.Anime.mal_id == mal_id).first()
    if local_anime:
        return {"status": "exists", "anime": {
            "title": local_anime.title,
            "mal_id": local_anime.mal_id
        }}

    # 2. Fetch from Jikan (External API)
    try:
        jikan_data = await jikan_client.get_anime_details(mal_id)
        if not jikan_data:
            raise HTTPException(status_code=404, detail="Anime not found on Jikan/MAL")
    except Exception as e:
        logger.error(f"Failed to fetch from Jikan: {e}")
        raise HTTPException(status_code=503, detail="External Anime API unavailable")

    # 3. Save to Local Database
    # Process genres into comma-separated string
    genres_str = ",".join(jikan_data.get("genres", []))
    
    new_anime = sql.Anime(
        mal_id=mal_id,
        title=jikan_data.get("title"),
        image_url=jikan_data.get("image"),
        synopsis=jikan_data.get("synopsis"),
        score=jikan_data.get("score"),
        genres=genres_str,
        year=jikan_data.get("year"),
        created_at=datetime.utcnow()
    )
    
    db.add(new_anime)
    try:
        db.commit()
        db.refresh(new_anime)
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save anime locally")

    return {"status": "created", "anime": {
        "title": new_anime.title,
        "mal_id": new_anime.mal_id
    }}

@router.get("/anime")
async def list_local_anime(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Get list of ALL anime available locally in the robust library.
    This is the fallback/primary source when 'Discover' mode is set to Local/Reliable.
    """
    anime_list = db.query(sql.Anime).order_by(sql.Anime.created_at.desc()).offset(skip).limit(limit).all()
    return {"anime": anime_list}
