from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging

from app.database import get_db
from app.models.sql import TriviaStats, UserStats

router = APIRouter()
logger = logging.getLogger(__name__)

class TriviaSubmission(BaseModel):
    user_id: str
    is_correct: bool
    difficulty: str = "medium"
    streak_count: int = 0

def get_or_create_trivia_stats(db: Session, user_id: str):
    stats = db.query(TriviaStats).filter(TriviaStats.user_id == user_id).first()
    if not stats:
        stats = TriviaStats(user_id=user_id)
        db.add(stats)
        db.flush() # Use flush instead of commit to allow caller to control transaction
        db.refresh(stats)
    return stats

TRIVIA_ACHIEVEMENTS = [
    {"id": "first_trivia", "threshold": 1, "field": "total_played"},
    {"id": "trivia_10", "threshold": 10, "field": "total_played"},
    {"id": "trivia_50", "threshold": 50, "field": "total_played"},
    {"id": "trivia_100", "threshold": 100, "field": "total_played"},
    {"id": "trivia_streak_5", "threshold": 5, "field": "best_streak"},
    {"id": "trivia_streak_10", "threshold": 10, "field": "best_streak"},
]

TRIVIA_LEVELS = [
    {"id": "normal", "name": "Normal", "min_accuracy": 0, "questions": 30, "chakra_multiplier": 1.0},
    {"id": "advanced", "name": "Advanced", "min_accuracy": 50, "questions": 30, "chakra_multiplier": 1.5},
    {"id": "hard", "name": "Hard", "min_accuracy": 60, "questions": 30, "chakra_multiplier": 2.0},
    {"id": "pro", "name": "Pro", "min_accuracy": 70, "questions": 30, "chakra_multiplier": 2.5},
    {"id": "extreme", "name": "Extreme", "min_accuracy": 80, "questions": 30, "chakra_multiplier": 3.0},
    {"id": "impossible", "name": "Impossible", "min_accuracy": 90, "questions": 30, "chakra_multiplier": 4.0},
    {"id": "scrolls_of_gold", "name": "Scrolls of Gold", "min_accuracy": 95, "questions": 30, "chakra_multiplier": 5.0},
]

def get_unlocked_levels(accuracy: float) -> list:
    return [level for level in TRIVIA_LEVELS if accuracy >= level["min_accuracy"]]

def get_level_by_id(level_id: str) -> dict:
    for level in TRIVIA_LEVELS:
        if level["id"] == level_id:
            return level
    return TRIVIA_LEVELS[0]

def check_trivia_achievements(stats: TriviaStats, current_achievements: list) -> list:
    unlocked = []
    for ach in TRIVIA_ACHIEVEMENTS:
        if ach["id"] not in current_achievements:
            value = getattr(stats, ach["field"], 0)
            if value >= ach["threshold"]:
                unlocked.append(ach["id"])
    return unlocked

@router.post("/submit")
async def submit_trivia_answer(submission: TriviaSubmission, db: Session = Depends(get_db)):
    # Pydantic automatically validates the body against TriviaSubmission schema
    # If invalid, FastAPI raises 422 automatically. We don't need manual try/except for parsing here.
    logger.info(f"Received trivia submission for user: {submission.user_id}")
    
    stats = get_or_create_trivia_stats(db, submission.user_id)
    
    stats.total_played = (stats.total_played or 0) + 1
    if submission.is_correct:
        stats.total_correct = (stats.total_correct or 0) + 1
    
    stats.current_streak = submission.streak_count if submission.is_correct else 0
    if stats.current_streak > (stats.best_streak or 0):
        stats.best_streak = stats.current_streak
    
    chakra_reward = 0
    if submission.is_correct:
        base_reward = {"easy": 10, "medium": 15, "hard": 25}.get(submission.difficulty, 15)
        streak_bonus = min(stats.current_streak * 2, 20)
        chakra_reward = base_reward + streak_bonus
    
    stats.chakra_earned = (stats.chakra_earned or 0) + chakra_reward
    stats.last_played = datetime.utcnow()
    
    user_stats = db.query(UserStats).filter(UserStats.user_id == submission.user_id).first()
    current_achievements = []
    total_chakra = chakra_reward
    
    if user_stats:
        current_achievements = user_stats.achievements.split(",") if user_stats.achievements else []
        user_stats.chakra = (user_stats.chakra or 0) + chakra_reward
        total_chakra = user_stats.chakra
    
    unlocked_achievements = check_trivia_achievements(stats, current_achievements)
    
    if unlocked_achievements and user_stats:
        all_achievements = current_achievements + unlocked_achievements
        user_stats.achievements = ",".join(all_achievements)
    
    db.commit()
    db.refresh(stats)
    
    return {
        "success": True,
        "stats": {
            "total_played": stats.total_played,
            "total_correct": stats.total_correct,
            "current_streak": stats.current_streak,
            "best_streak": stats.best_streak,
            "chakra_earned": stats.chakra_earned
        },
        "chakra_earned": chakra_reward,
        "total_chakra": total_chakra,
        "unlocked_achievements": unlocked_achievements
    }

@router.get("/stats/{user_id}")
def get_trivia_stats(user_id: str, db: Session = Depends(get_db)):
    stats = get_or_create_trivia_stats(db, user_id)
    
    return {
        "stats": {
            "user_id": user_id,
            "total_played": stats.total_played or 0,
            "total_correct": stats.total_correct or 0,
            "current_streak": stats.current_streak or 0,
            "best_streak": stats.best_streak or 0,
            "chakra_earned": stats.chakra_earned or 0,
            "last_played": stats.last_played.isoformat() if stats.last_played else None
        }
    }

@router.get("/leaderboard")
def get_trivia_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    stats = db.query(TriviaStats).filter(
        TriviaStats.total_played > 0
    ).order_by(
        TriviaStats.total_correct.desc()
    ).limit(limit).all()
    
    leaderboard = []
    for s in stats:
        user_stats = db.query(UserStats).filter(UserStats.user_id == s.user_id).first()
        display_name = user_stats.display_name if user_stats and user_stats.display_name else "Ninja"
        
        leaderboard.append({
            "user_id": s.user_id,
            "display_name": display_name,
            "total_correct": s.total_correct or 0,
            "best_streak": s.best_streak or 0
        })
    
    return {"leaderboard": leaderboard}

@router.get("/levels/{user_id}")
def get_user_levels(user_id: str, db: Session = Depends(get_db)):
    stats = get_or_create_trivia_stats(db, user_id)
    
    total_played = stats.total_played or 0
    total_correct = stats.total_correct or 0
    accuracy = (total_correct / total_played * 100) if total_played > 0 else 0
    
    unlocked = get_unlocked_levels(accuracy)
    
    return {
        "accuracy": round(accuracy, 1),
        "total_played": total_played,
        "total_correct": total_correct,
        "levels": TRIVIA_LEVELS,
        "unlocked_levels": [l["id"] for l in unlocked],
        "current_highest": unlocked[-1]["id"] if unlocked else "normal"
    }

@router.get("/levels")
def get_all_levels():
    return {"levels": TRIVIA_LEVELS}
