from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
from pathlib import Path
import logging

from app.database import get_db
from app.models.sql import Episode
from app.config import settings
from pydantic import BaseModel

# Try to import SFTP service (may not be initialized)
try:
    from app.services.sftp_service import get_sftp_service
    SFTP_AVAILABLE = True
except:
    SFTP_AVAILABLE = False

router = APIRouter()
logger = logging.getLogger(__name__)

# Local fallback directory
UPLOAD_DIR = "static/videos"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


class EpisodeResponse(BaseModel):
    id: int
    anime_id: int
    anime_title: str
    episode_number: int
    title: str | None
    video_url: str
    quality: str
    
    class Config:
        from_attributes = True


def get_storage_mode() -> str:
    """Determine which storage mode to use."""
    if settings.sftp_host and settings.sftp_username:
        return "sftp"
    elif settings.b2_endpoint_url and settings.b2_access_key:
        return "b2"
    else:
        return "local"


@router.post("/upload", response_model=EpisodeResponse)
async def upload_episode(
    anime_id: int = Form(...),
    anime_title: str = Form(...),
    episode_number: int = Form(...),
    title: str = Form(None),
    quality: str = Form("1080p"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an episode video.
    Uses SFTP (IONOS) if configured, otherwise falls back to local storage.
    """
    storage_mode = get_storage_mode()
    file_ext = os.path.splitext(file.filename)[1] or ".mp4"
    
    try:
        if storage_mode == "sftp":
            # Read file content
            file_content = await file.read()
            
            # Upload to IONOS via SFTP
            sftp_service = get_sftp_service()
            video_url = sftp_service.upload_video(
                file_data=file_content,
                anime_id=anime_id,
                episode_number=episode_number,
                quality=quality,
                extension=file_ext.lstrip('.')
            )
            logger.info(f"Uploaded to SFTP: {video_url}")
            
        elif storage_mode == "b2":
            # Use B2/S3 storage (to be implemented)
            raise HTTPException(status_code=501, detail="B2 upload not yet implemented")
            
        else:
            # Local storage fallback
            filename = f"{anime_id}_{episode_number}_{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            video_url = f"/static/videos/{filename}"
            logger.info(f"Saved locally: {video_url}")
    
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    # Save to database
    db_episode = Episode(
        anime_id=anime_id,
        anime_title=anime_title,
        episode_number=episode_number,
        title=title,
        video_url=video_url,
        quality=quality
    )
    db.add(db_episode)
    db.commit()
    db.refresh(db_episode)
    
    return db_episode


@router.get("/{anime_id}", response_model=List[EpisodeResponse])
def get_episodes(anime_id: int, db: Session = Depends(get_db)):
    """Get all episodes for an anime."""
    return db.query(Episode).filter(Episode.anime_id == anime_id).all()


class EpisodeSave(BaseModel):
    anime_id: int
    anime_title: str
    episode_number: int
    title: str | None = None
    video_url: str
    quality: str = "1080p"
    uploader_id: str | None = None


@router.post("/save", response_model=EpisodeResponse)
def save_episode(episode: EpisodeSave, db: Session = Depends(get_db)):
    """Save episode metadata (video URL already exists)."""
    db_episode = Episode(
        anime_id=episode.anime_id,
        anime_title=episode.anime_title,
        episode_number=episode.episode_number,
        title=episode.title,
        video_url=episode.video_url,
        quality=episode.quality
    )
    db.add(db_episode)
    db.commit()
    db.refresh(db_episode)
    return db_episode


@router.get("/all", response_model=List[EpisodeResponse])
def get_all_episodes(limit: int = 50, db: Session = Depends(get_db)):
    """Get all episodes, sorted by newest first."""
    return db.query(Episode).order_by(Episode.id.desc()).limit(limit).all()


@router.delete("/{episode_id}")
def delete_episode(episode_id: int, db: Session = Depends(get_db)):
    """Delete an episode."""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    # TODO: Also delete from storage (SFTP/B2/local)
    
    db.delete(episode)
    db.commit()
    return {"success": True, "message": "Episode deleted"}


@router.get("/storage/status")
def get_storage_status():
    """Check current storage configuration."""
    mode = get_storage_mode()
    return {
        "storage_mode": mode,
        "sftp_configured": bool(settings.sftp_host),
        "b2_configured": bool(settings.b2_endpoint_url),
        "sftp_host": settings.sftp_host or None,
        "public_url": settings.sftp_public_url or settings.cdn_base_url or "local"
    }
