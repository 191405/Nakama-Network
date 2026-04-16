from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import logging
import os
import uuid

from app.database import get_db
from app.models.sql import User, UserSettings, UserStreak, UserStats, calculate_rank
from app.middleware import require_auth
from app.api_gateway import api_response, error_response

logger = logging.getLogger(__name__)

router = APIRouter()

class AvatarSelection(BaseModel):
    avatar_url: str

@router.put("/me/avatar/selection")
async def select_anime_avatar(
    selection: AvatarSelection,
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Set an anime character as the user's avatar."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return error_response(message="User not found", code="NOT_FOUND")
    
    user.avatar_url = selection.avatar_url
    db.commit()
    
    return api_response(
        message="Avatar updated from anime selection",
        data={"avatar_url": user.avatar_url}
    )

@router.post("/me/avatar/upload")
async def upload_custom_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Upload a custom image as the user's avatar."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return error_response(message="User not found", code="NOT_FOUND")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        return error_response(message="File must be an image", code="INVALID_FILE")
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = f"uploads/avatars/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        logger.error(f"Failed to save avatar: {e}")
        return error_response(message="Failed to save image", code="UPLOAD_ERROR")
    
    # Update user
    avatar_url = f"/uploads/avatars/{filename}"
    user.avatar_url = avatar_url
    db.commit()
    
    return api_response(
        message="Avatar uploaded successfully",
        data={"avatar_url": avatar_url}
    )

class SettingsBase(BaseModel):
    dark_mode: Optional[int] = None
    accent_color: Optional[str] = None
    
    auto_play_videos: Optional[int] = None
    data_saver: Optional[int] = None
    sound_effects: Optional[int] = None
    
    push_notifications: Optional[int] = None
    episode_alerts: Optional[int] = None
    clan_messages: Optional[int] = None
    daily_prophecy: Optional[int] = None
    weekly_digest: Optional[int] = None
    
    online_status: Optional[int] = None
    public_profile: Optional[int] = None
    activity_sharing: Optional[int] = None

class NotificationSettings(BaseModel):
    push_notifications: Optional[int] = None
    episode_alerts: Optional[int] = None
    clan_messages: Optional[int] = None
    daily_prophecy: Optional[int] = None
    weekly_digest: Optional[int] = None

class PrivacySettings(BaseModel):
    online_status: Optional[int] = None
    public_profile: Optional[int] = None
    activity_sharing: Optional[int] = None

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=30)
    bio: Optional[str] = Field(None, max_length=300)
    avatar_url: Optional[str] = None
    location: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=100)

class ChakraUpdate(BaseModel):
    action: str
    amount: Optional[int] = None

def get_or_create_settings(db: Session, user_id: str) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def get_or_create_streak(db: Session, user_id: str) -> UserStreak:
    streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
    if not streak:
        streak = UserStreak(user_id=user_id)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak

def format_settings_response(settings: UserSettings) -> dict:
    return {
        "user_id": settings.user_id,
        "appearance": {
            "darkMode": bool(settings.dark_mode),
            "accentColor": settings.accent_color or "purple"
        },
        "preferences": {
            "autoPlayVideos": bool(settings.auto_play_videos),
            "dataSaver": bool(settings.data_saver),
            "soundEffects": bool(settings.sound_effects)
        },
        "notifications": {
            "push": bool(settings.push_notifications),
            "episodeAlerts": bool(settings.episode_alerts),
            "clanMessages": bool(settings.clan_messages),
            "dailyProphecy": bool(settings.daily_prophecy),
            "weeklyDigest": bool(settings.weekly_digest)
        },
        "privacy": {
            "onlineStatus": bool(settings.online_status),
            "publicProfile": bool(settings.public_profile),
            "activitySharing": bool(settings.activity_sharing)
        }
    }

@router.get("/{user_id}/settings")
def get_user_settings(user_id: str, db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user_id)
    return api_response(data=format_settings_response(settings))

@router.put("/{user_id}/settings")
def update_user_settings(user_id: str, updates: SettingsBase, db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user_id)
    
    update_data = updates.dict(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        if hasattr(settings, field):
            setattr(settings, field, value)
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    return api_response(message="Settings updated", data=format_settings_response(settings))

@router.put("/{user_id}/notifications")
def update_notification_settings(user_id: str, updates: NotificationSettings, db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user_id)
    
    if updates.push_notifications is not None:
        settings.push_notifications = updates.push_notifications
    if updates.episode_alerts is not None:
        settings.episode_alerts = updates.episode_alerts
    if updates.clan_messages is not None:
        settings.clan_messages = updates.clan_messages
    if updates.daily_prophecy is not None:
        settings.daily_prophecy = updates.daily_prophecy
    if updates.weekly_digest is not None:
        settings.weekly_digest = updates.weekly_digest
    
    db.commit()
    db.refresh(settings)
    
    return api_response(
        message="Notification settings updated",
        data={
            "notifications": {
                "push": bool(settings.push_notifications),
                "episodeAlerts": bool(settings.episode_alerts),
                "clanMessages": bool(settings.clan_messages),
                "dailyProphecy": bool(settings.daily_prophecy),
                "weeklyDigest": bool(settings.weekly_digest)
            }
        }
    )

@router.put("/{user_id}/privacy")
def update_privacy_settings(user_id: str, updates: PrivacySettings, db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user_id)
    
    if updates.online_status is not None:
        settings.online_status = updates.online_status
    if updates.public_profile is not None:
        settings.public_profile = updates.public_profile
    if updates.activity_sharing is not None:
        settings.activity_sharing = updates.activity_sharing
    
    db.commit()
    db.refresh(settings)
    
    return api_response(
        message="Privacy settings updated",
        data={
            "privacy": {
                "onlineStatus": bool(settings.online_status),
                "publicProfile": bool(settings.public_profile),
                "activitySharing": bool(settings.activity_sharing)
            }
        }
    )

@router.put("/{user_id}/profile")
def update_user_profile(user_id: str, profile: ProfileUpdate, db: Session = Depends(get_db)):
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
    
    if profile.display_name is not None:
        stats.display_name = profile.display_name

    db.commit()
    db.refresh(stats)
    
    return api_response(
        message="Profile updated",
        data={
            "user_id": user_id,
            "display_name": stats.display_name
        }
    )

CHAKRA_REWARDS = {
    "daily_login": 50,
    "watch_episode": 20,
    "read_chapter": 10,
    "post_comment": 15,
    "trivia_win": 25,
    "full_engagement_bonus": 100
}

def calculate_ninja_level(chakra: int) -> dict:
    current_level = "Academy Student"
    next_level = "Genin"
    next_threshold = 500
    badge = "🎓"
    
    if chakra >= 250000:
        current_level = "Legendary Shinobi"
        next_level = "MAX"
        next_threshold = None
        badge = "✨"
    elif chakra >= 100000:
        current_level = "Kage"
        next_level = "Legendary Shinobi"
        next_threshold = 250000
        badge = "👺"
    elif chakra >= 50000:
        current_level = "Sannin"
        next_level = "Kage"
        next_threshold = 100000
        badge = "🐍"
    elif chakra >= 25000:
        current_level = "Anbu Captain"
        next_level = "Sannin"
        next_threshold = 50000
        badge = "🎭"
    elif chakra >= 15000:
        current_level = "Anbu"
        next_level = "Anbu Captain"
        next_threshold = 25000
        badge = "⚔️"
    elif chakra >= 8000:
        current_level = "Jonin"
        next_level = "Anbu"
        next_threshold = 15000
        badge = "🥷"
    elif chakra >= 4000:
        current_level = "Tokubetsu Jonin"
        next_level = "Jonin"
        next_threshold = 8000
        badge = "📜"
    elif chakra >= 2000:
        current_level = "Chunin"
        next_level = "Tokubetsu Jonin"
        next_threshold = 4000
        badge = "🌪️"
    elif chakra >= 500:
        current_level = "Genin"
        next_level = "Chunin"
        next_threshold = 2000
        badge = "🌀"
        
    return {
        "title": current_level,
        "next": next_level,
        "current_chakra": chakra,
        "required_chakra": next_threshold,
        "progress": (chakra / next_threshold * 100) if next_threshold else 100,
        "badge": badge
    }

def calculate_net_rank(streak_days: int) -> dict:
    current_rank = "Net Wanderer"
    next_rank = "Net Citizen"
    next_threshold = 3
    color = "#94a3b8"
    
    if streak_days >= 730:
        current_rank = "Net God"
        next_rank = "MAX"
        next_threshold = None
        color = "#fbbf24"
    elif streak_days >= 365:
        current_rank = "Net Sage"
        next_rank = "Net God"
        next_threshold = 730
        color = "#10b981"
    elif streak_days >= 180:
        current_rank = "Net Grandmaster"
        next_rank = "Net Sage"
        next_threshold = 365
        color = "#ef4444"
    elif streak_days >= 90:
        current_rank = "Net Master"
        next_rank = "Net Grandmaster"
        next_threshold = 180
        color = "#8b5cf6"
    elif streak_days >= 60:
        current_rank = "Net Guardian"
        next_rank = "Net Master"
        next_threshold = 90
        color = "#3b82f6"
    elif streak_days >= 30:
        current_rank = "Net Adept"
        next_rank = "Net Guardian"
        next_threshold = 60
        color = "#06b6d4"
    elif streak_days >= 15:
        current_rank = "Net Disciple"
        next_rank = "Net Adept"
        next_threshold = 30
        color = "#a855f7"
    elif streak_days >= 3:
        current_rank = "Net Citizen"
        next_rank = "Net Disciple"
        next_threshold = 15
        color = "#64748b"
        
    return {
        "title": current_rank,
        "next": next_rank,
        "current_days": streak_days,
        "required_days": next_threshold,
        "progress": (streak_days / next_threshold * 100) if next_threshold else 100,
        "color": color
    }

@router.get("/{user_id}/progress")
def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    streak = get_or_create_streak(db, user_id)
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    if not stats:
        stats = UserStats(user_id=user_id, chakra=0)
        db.add(stats)
        db.commit()
        db.refresh(stats)
        
    chakra_level = calculate_ninja_level(stats.chakra or 0)
    net_rank = calculate_net_rank(streak.current_streak)
    
    return api_response(
        data={
            "user_id": user_id,
            "level": chakra_level,
            "rank": net_rank,
            "streak": {
                "current": streak.current_streak,
                "longest": streak.longest_streak,
                "last_active": streak.last_active_date
            },
            "stats": {
                "chakra": stats.chakra,
                "episodes": streak.episodes_watched or 0,
                "time_online": streak.total_time_minutes or 0
            }
        }
    )

@router.post("/{user_id}/progress")
def update_user_progress(user_id: str, update: ChakraUpdate, db: Session = Depends(get_db)):
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(user_id=user_id, chakra=0)
        db.add(stats)
    
    streak = get_or_create_streak(db, user_id)
    
    chakra_gain = update.amount
    if not chakra_gain:
        chakra_gain = CHAKRA_REWARDS.get(update.action, 0)
        
    stats.chakra = (stats.chakra or 0) + chakra_gain
    
    streak_updated = False
    today = date.today().isoformat()
    
    if update.action == "daily_login":
        if streak.last_active_date != today:
            if streak.last_active_date:
                last_date = date.fromisoformat(streak.last_active_date)
                diff = (date.today() - last_date).days
                if diff == 1:
                    streak.current_streak += 1
                elif diff > 1:
                    streak.current_streak = 1
            else:
                streak.current_streak = 1
                
            streak.last_active_date = today
            streak.total_days_active += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            streak_updated = True
            
    elif update.action == "watch_episode":
        streak.episodes_watched = (streak.episodes_watched or 0) + 1
        
    db.commit()
    db.refresh(stats)
    db.refresh(streak)
    
    new_level = calculate_ninja_level(stats.chakra)
    new_rank = calculate_net_rank(streak.current_streak)
    
    return api_response(
        message="Progress updated",
        data={
            "gained_chakra": chakra_gain,
            "level": new_level,
            "rank": new_rank,
            "streak_updated": streak_updated
        }
    )

@router.get("/{user_id}/activity")
def get_user_activity(user_id: str, limit: int = 20, db: Session = Depends(get_db)):
    streak = get_or_create_streak(db, user_id)
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    activities = []
    
    if streak.last_active_date:
        activities.append({
            "type": "check_in",
            "description": f"Daily check-in (Day {streak.current_streak})",
            "timestamp": streak.last_active_date,
            "metadata": {"streak": streak.current_streak}
        })
    
    if streak.episodes_watched and streak.episodes_watched > 0:
        activities.append({
            "type": "watch",
            "description": f"Watched {streak.episodes_watched} episodes",
            "timestamp": streak.updated_at.isoformat() if streak.updated_at else None,
            "metadata": {"count": streak.episodes_watched}
        })
    
    if stats:
        total_days = streak.total_days_active + streak.bonus_days
        rank = calculate_rank(total_days)
        activities.append({
            "type": "rank",
            "description": f"Current rank: {rank['name']}",
            "timestamp": None,
            "metadata": {"rank": rank["name"], "color": rank["color"]}
        })
    
    return api_response(
        data={
            "user_id": user_id,
            "activities": activities[:limit]
        }
    )
