
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from datetime import datetime

from app.repositories.base import BaseRepository
from app.models.sql import UserStats, UserStreak, UserSettings

class UserStatsCreate(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    xp: int = 0
    level: int = 1
    chakra: int = 0

class UserStatsUpdate(BaseModel):
    display_name: Optional[str] = None
    xp: Optional[int] = None
    level: Optional[int] = None
    chakra: Optional[int] = None
    rank_title: Optional[str] = None
    rank_color: Optional[str] = None

class UserStatsRepository(BaseRepository[UserStats, UserStatsCreate, UserStatsUpdate]):
    
    def __init__(self):
        super().__init__(UserStats)
    
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[UserStats]:
        return db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    def get_or_create(self, db: Session, user_id: str) -> UserStats:
        stats = self.get_by_user_id(db, user_id)
        if not stats:
            stats = UserStats(user_id=user_id, chakra=0, xp=0, level=1)
            db.add(stats)
            db.commit()
            db.refresh(stats)
        return stats
    
    def add_chakra(self, db: Session, user_id: str, amount: int) -> UserStats:
        stats = self.get_or_create(db, user_id)
        stats.chakra = (stats.chakra or 0) + amount
        db.commit()
        db.refresh(stats)
        return stats
    
    def add_xp(self, db: Session, user_id: str, amount: int) -> UserStats:
        stats = self.get_or_create(db, user_id)
        stats.xp = (stats.xp or 0) + amount
        
        new_level = (stats.xp // 1000) + 1
        if new_level > stats.level:
            stats.level = new_level
        
        db.commit()
        db.refresh(stats)
        return stats
    
    def get_leaderboard(
        self, 
        db: Session, 
        *, 
        order_by: str = "chakra",
        limit: int = 50
    ) -> List[UserStats]:
        order_field = getattr(UserStats, order_by, UserStats.chakra)
        return db.query(UserStats).order_by(desc(order_field)).limit(limit).all()
    
    def get_top_players(self, db: Session, *, limit: int = 10) -> List[UserStats]:
        return self.get_leaderboard(db, order_by="chakra", limit=limit)
    
    def update_rank(
        self, 
        db: Session, 
        user_id: str, 
        rank_title: str, 
        rank_color: str
    ) -> Optional[UserStats]:
        stats = self.get_by_user_id(db, user_id)
        if stats:
            stats.rank_title = rank_title
            stats.rank_color = rank_color
            db.commit()
            db.refresh(stats)
        return stats

class UserStreakRepository:
    
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[UserStreak]:
        return db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
    
    def get_or_create(self, db: Session, user_id: str) -> UserStreak:
        streak = self.get_by_user_id(db, user_id)
        if not streak:
            streak = UserStreak(user_id=user_id)
            db.add(streak)
            db.commit()
            db.refresh(streak)
        return streak
    
    def check_in(self, db: Session, user_id: str) -> dict:
        from datetime import date
        
        streak = self.get_or_create(db, user_id)
        today = date.today().isoformat()
        
        streak_bonus = 0
        streak_updated = False
        
        if streak.last_active_date != today:
            if streak.last_active_date:
                last_date = date.fromisoformat(streak.last_active_date)
                diff = (date.today() - last_date).days
                
                if diff == 1:
                    streak.current_streak += 1
                    streak_updated = True
                    
                    if streak.current_streak == 7:
                        streak_bonus = 100
                    elif streak.current_streak == 30:
                        streak_bonus = 500
                    elif streak.current_streak == 100:
                        streak_bonus = 2000
                        
                elif diff > 1:
                    streak.current_streak = 1
            else:
                streak.current_streak = 1
            
            streak.last_active_date = today
            streak.total_days_active += 1
            
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            
            streak.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(streak)
        
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "streak_bonus": streak_bonus,
            "streak_updated": streak_updated
        }

user_stats_repo = UserStatsRepository()
user_streak_repo = UserStreakRepository()
