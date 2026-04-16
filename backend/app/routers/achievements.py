from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.database import get_db
from app.models.sql import UserStats, UserStreak, calculate_rank
def calculate_rank_from_chakra(chakra: int) -> dict:
    if chakra >= 1000: return {"badge": "✨"}
    if chakra >= 500: return {"badge": "🔱"}
    if chakra >= 100: return {"badge": "⚔️"}
    return {"badge": "🔰"}
router = APIRouter()

ACHIEVEMENTS = [
    {"id": "first_login", "name": "First Steps", "description": "Log in for the first time", "icon": "🎯", "points": 10, "category": "beginner"},
    {"id": "first_prophecy", "name": "Fortune Seeker", "description": "View your first Daily Prophecy", "icon": "🔮", "points": 15, "category": "beginner"},
    {"id": "first_trivia", "name": "Quiz Rookie", "description": "Play your first trivia game", "icon": "🎮", "points": 10, "category": "beginner"},
    {"id": "first_oracle", "name": "Seeker of Wisdom", "description": "Ask The Oracle a question", "icon": "✨", "points": 15, "category": "beginner"},
    
    {"id": "trivia_10", "name": "Trivia Enthusiast", "description": "Answer 10 trivia questions", "icon": "📚", "points": 25, "category": "trivia"},
    {"id": "trivia_50", "name": "Knowledge Hunter", "description": "Answer 50 trivia questions", "icon": "🧠", "points": 50, "category": "trivia"},
    {"id": "trivia_100", "name": "Quiz Master", "description": "Answer 100 trivia questions", "icon": "👑", "points": 100, "category": "trivia"},
    {"id": "trivia_streak_5", "name": "Hot Streak", "description": "Get 5 correct answers in a row", "icon": "🔥", "points": 30, "category": "trivia"},
    {"id": "trivia_streak_10", "name": "Unstoppable", "description": "Get 10 correct answers in a row", "icon": "⚡", "points": 75, "category": "trivia"},
    {"id": "trivia_perfect", "name": "Perfect Round", "description": "Get 10/10 in a trivia session", "icon": "💯", "points": 50, "category": "trivia"},
    
    {"id": "oracle_10", "name": "Curious Mind", "description": "Ask The Oracle 10 questions", "icon": "💬", "points": 25, "category": "social"},
    {"id": "oracle_50", "name": "Oracle's Friend", "description": "Ask The Oracle 50 questions", "icon": "🌟", "points": 75, "category": "social"},
    
    {"id": "watchlist_5", "name": "List Starter", "description": "Add 5 anime to your watchlist", "icon": "📝", "points": 20, "category": "collector"},
    {"id": "watchlist_20", "name": "Otaku Curator", "description": "Add 20 anime to your watchlist", "icon": "📚", "points": 50, "category": "collector"},
    
    {"id": "streak_3", "name": "Dedicated", "description": "Log in 3 days in a row", "icon": "📅", "points": 25, "category": "dedication"},
    {"id": "streak_7", "name": "Weekly Warrior", "description": "Log in 7 days in a row", "icon": "🗓️", "points": 50, "category": "dedication"},
    {"id": "streak_30", "name": "Monthly Master", "description": "Log in 30 days in a row", "icon": "🏆", "points": 150, "category": "dedication"},
    
    {"id": "night_owl", "name": "Night Owl", "description": "Use the app after midnight", "icon": "🦉", "points": 15, "category": "special"},
    {"id": "early_bird", "name": "Early Bird", "description": "Use the app before 6 AM", "icon": "🌅", "points": 15, "category": "special"},
]

class UnlockRequest(BaseModel):
    user_id: str
    achievement_id: str

@router.get("/list")
def get_all_achievements():
    return {"achievements": ACHIEVEMENTS}

@router.get("/user/{user_id}")
def get_user_achievements(user_id: str, db: Session = Depends(get_db)):
    user_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    unlocked_ids = []
    if user_stats and user_stats.achievements:
        unlocked_ids = [a.strip() for a in user_stats.achievements.split(",") if a.strip()]
    
    total_points = sum(
        a["points"] for a in ACHIEVEMENTS if a["id"] in unlocked_ids
    )
    
    achievements_with_status = []
    for ach in ACHIEVEMENTS:
        achievements_with_status.append({
            **ach,
            "unlocked": ach["id"] in unlocked_ids
        })
    
    return {
        "unlocked": unlocked_ids,
        "total_points": total_points,
        "unlocked_count": len(unlocked_ids),
        "total_count": len(ACHIEVEMENTS),
        "achievements": achievements_with_status
    }

@router.post("/unlock")
def unlock_achievement(request: UnlockRequest, db: Session = Depends(get_db)):
    achievement = next((a for a in ACHIEVEMENTS if a["id"] == request.achievement_id), None)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    user_stats = db.query(UserStats).filter(UserStats.user_id == request.user_id).first()
    if not user_stats:
        user_stats = UserStats(user_id=request.user_id)
        db.add(user_stats)
    
    current_achievements = []
    if user_stats.achievements:
        current_achievements = [a.strip() for a in user_stats.achievements.split(",") if a.strip()]
    
    if request.achievement_id in current_achievements:
        return {"success": True, "already_unlocked": True, "achievement": achievement}
    
    current_achievements.append(request.achievement_id)
    user_stats.achievements = ",".join(current_achievements)
    
    user_stats.chakra = (user_stats.chakra or 0) + achievement["points"]
    
    db.commit()
    db.refresh(user_stats)
    
    return {
        "success": True,
        "already_unlocked": False,
        "achievement": achievement,
        "chakra_earned": achievement["points"],
        "total_chakra": user_stats.chakra
    }

@router.post("/check-sync")
def check_and_sync_achievements(request: UnlockRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        return {"unlocked_new": []}
        
    streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
    
    current_ids = []
    if stats.achievements:
        current_ids = [a.strip() for a in stats.achievements.split(",") if a.strip()]
        
    newly_unlocked = []

    if stats.total_correct:
        if stats.total_correct >= 10 and "trivia_10" not in current_ids:
            newly_unlocked.append("trivia_10")
        if stats.total_correct >= 50 and "trivia_50" not in current_ids:
            newly_unlocked.append("trivia_50") 
        if stats.total_correct >= 100 and "trivia_100" not in current_ids:
            newly_unlocked.append("trivia_100")

    if streak:
        if streak.longest_streak >= 3 and "streak_3" not in current_ids:
            newly_unlocked.append("streak_3")
        if streak.longest_streak >= 7 and "streak_7" not in current_ids:
            newly_unlocked.append("streak_7")
        if streak.longest_streak >= 30 and "streak_30" not in current_ids:
            newly_unlocked.append("streak_30")

    if newly_unlocked:
        for ach_id in newly_unlocked:
            achievement = next((a for a in ACHIEVEMENTS if a["id"] == ach_id), None)
            if achievement:
                stats.chakra = (stats.chakra or 0) + achievement["points"]
                current_ids.append(ach_id)
                
        stats.achievements = ",".join(current_ids)
        db.commit()
        db.refresh(stats)
        
    return {
        "unlocked_new": newly_unlocked,
        "total_unlocked": len(current_ids)
    }

@router.get("/leaderboard")
def get_achievements_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    users = db.query(UserStats).filter(
        UserStats.achievements != None,
        UserStats.achievements != ""
    ).all()
    
    leaderboard = []
    for user in users:
        unlocked_ids = [a.strip() for a in user.achievements.split(",") if a.strip()]
        total_points = sum(
            a["points"] for a in ACHIEVEMENTS if a["id"] in unlocked_ids
        )
        
        if len(unlocked_ids) > 0:
            leaderboard.append({
                "user_id": user.user_id,
                "display_name": user.display_name or "Ninja",
                "unlocked_count": len(unlocked_ids),
                "total_points": total_points,
                "rank_badge": calculate_rank_from_chakra(user.chakra or 0)["badge"]
            })
    
    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)
    
    return {"leaderboard": leaderboard[:limit]}

