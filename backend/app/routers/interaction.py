from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.sql import UserStats, Achievement, UserAchievement
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class XPUpdate(BaseModel):
    user_id: str
    amount: int
    action: str

class StatsResponse(BaseModel):
    user_id: str
    xp: int
    level: int
    rank: str
    rank_color: str
    next_level_xp: int

RANKS = {
    1: ("Academy Student", "#94a3b8"),
    5: ("Genin", "#22c55e"),
    15: ("Chunin", "#3b82f6"),
    30: ("Jonin", "#a855f7"),
    50: ("Anbu", "#ef4444"),
    100: ("Kage", "#f59e0b")
}

def calculate_rank(level: int):
    current_rank = "Academy Student"
    current_color = "#94a3b8"
    for lvl, (rank, color) in sorted(RANKS.items()):
        if level >= lvl:
            current_rank = rank
            current_color = color
    return current_rank, current_color

def calculate_level_progress(xp: int):
    level = 1 + (xp // 500)
    current_level_xp = (level - 1) * 500
    next_level_xp_total = level * 500
    progress = xp - current_level_xp
    needed = 500
    return level, needed - progress

@router.post("/xp", response_model=StatsResponse)
def add_xp(update: XPUpdate, db: Session = Depends(get_db)):
    stats = db.query(UserStats).filter(UserStats.user_id == update.user_id).first()
    if not stats:
        stats = UserStats(user_id=update.user_id, xp=0, level=1)
        db.add(stats)
    
    stats.xp += update.amount
    
    new_level, _ = calculate_level_progress(stats.xp)
    stats.level = new_level
    stats.rank_title, stats.rank_color = calculate_rank(new_level)
    
    db.commit()
    db.refresh(stats)
    
    return {
        "user_id": stats.user_id,
        "xp": stats.xp,
        "level": stats.level,
        "rank": stats.rank_title,
        "rank_color": stats.rank_color,
        "next_level_xp": 500 - (stats.xp % 500)
    }

@router.get("/stats/{user_id}", response_model=StatsResponse)
def get_stats(user_id: str, db: Session = Depends(get_db)):
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        return {
            "user_id": user_id,
            "xp": 0,
            "level": 1,
            "rank": "Academy Student",
            "rank_color": "#94a3b8",
            "next_level_xp": 500
        }
    
    return {
        "user_id": stats.user_id,
        "xp": stats.xp,
        "level": stats.level,
        "rank": stats.rank_title,
        "rank_color": stats.rank_color,
        "next_level_xp": 500 - (stats.xp % 500)
    }

@router.post("/achievements/seed")
def seed_achievements(db: Session = Depends(get_db)):
    if db.query(Achievement).first():
        return {"message": "Already seeded"}
    
    achievements = [
        Achievement(slug="first_watch", name="First Step", description="Watch your first episode", xp_value=100, icon="play-circle", rarity="common"),
        Achievement(slug="binge_master", name="Binge Master", description="Watch 5 episodes", xp_value=500, icon="fast-forward", rarity="rare"),
        Achievement(slug="collector", name="Collector", description="Upload an episode", xp_value=1000, icon="upload", rarity="epic"),
        Achievement(slug="legend", name="Living Legend", description="Reach Level 10", xp_value=5000, icon="crown", rarity="legendary"),
    ]
    db.add_all(achievements)
    db.commit()
    return {"message": "Seeded achievements"}

@router.get("/leaderboard")
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(UserStats).order_by(UserStats.xp.desc()).limit(limit).all()
    return [
        {
            "user_id": u.user_id,
            "display_name": u.display_name or f"User_{u.user_id[:6]}",
            "xp": u.xp,
            "level": u.level,
            "rank": u.rank_title,
            "rank_color": u.rank_color
        }
        for u in users
    ]

@router.get("/active-players")
def get_active_players(db: Session = Depends(get_db)):
    count = db.query(UserStats).filter(UserStats.xp > 0).count()
    return {"count": count}

class ProfileUpdate(BaseModel):
    chakra: Optional[int] = None
    achievements: Optional[List[str]] = None
    rank: Optional[str] = None
    xp: Optional[int] = None

@router.put("/update/{user_id}")
def update_user_profile(user_id: str, updates: ProfileUpdate, db: Session = Depends(get_db)):
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
    
    if updates.chakra is not None:
        stats.chakra = updates.chakra
    if updates.achievements is not None:
        stats.achievements = ",".join(updates.achievements) if updates.achievements else ""
    if updates.rank is not None:
        stats.rank_title = updates.rank
    if updates.xp is not None:
        stats.xp = updates.xp
        stats.level = 1 + (updates.xp // 500)
    
    db.commit()
    db.refresh(stats)
    
    return {
        "success": True,
        "user_id": user_id,
        "chakra": stats.chakra,
        "achievements": stats.achievements,
        "rank": stats.rank_title
    }
