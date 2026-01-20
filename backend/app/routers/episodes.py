from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid
from pathlib import Path

from app.database import get_db
from app.models.sql import Episode
from pydantic import BaseModel

router = APIRouter()

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
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{anime_id}_{episode_number}_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
        
    relative_url = f"/static/videos/{filename}"
    
    db_episode = Episode(
        anime_id=anime_id,
        anime_title=anime_title,
        episode_number=episode_number,
        title=title,
        video_url=relative_url,
        quality=quality
    )
    db.add(db_episode)
    db.commit()
    db.refresh(db_episode)
    
    return db_episode

@router.get("/{anime_id}", response_model=List[EpisodeResponse])
def get_episodes(anime_id: int, db: Session = Depends(get_db)):
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
    return db.query(Episode).order_by(Episode.id.desc()).limit(limit).all()

@router.delete("/{episode_id}")
def delete_episode(episode_id: int, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    db.delete(episode)
    db.commit()
    return {"success": True, "message": "Episode deleted"}
