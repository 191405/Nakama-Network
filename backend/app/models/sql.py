from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Anime(Base):
    __tablename__ = "anime"

    id = Column(Integer, primary_key=True, index=True)
    mal_id = Column(Integer, unique=True, index=True)
    title = Column(String, index=True)
    image_url = Column(String)
    synopsis = Column(String)
    score = Column(Float)
    genres = Column(String)  # Stored as comma-separated string
    year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship: One anime has many episodes
    episodes = relationship("Episode", back_populates="anime")

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    anime_id = Column(Integer, ForeignKey("anime.mal_id"), index=True) # Link to Anime table
    anime_title = Column(String, index=True) # Keep for redundancy/legacy
    episode_number = Column(Integer)
    title = Column(String, nullable=True)
    video_url = Column(String)
    quality = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    anime = relationship("Anime", back_populates="episodes")

class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    rank_title = Column(String, default="Academy Student")
    rank_color = Column(String, default="#94a3b8")
    chakra = Column(Integer, default=0)
    achievements = Column(String, nullable=True)

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(String)
    xp_value = Column(Integer)
    icon = Column(String)
    rarity = Column(String)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    anime_id = Column(Integer, index=True)
    rating = Column(Integer)
    text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Clan(Base):
    __tablename__ = "clans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    leader_id = Column(String, index=True)
    banner_image = Column(String, nullable=True)
    member_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class ClanMember(Base):
    __tablename__ = "clan_members"
    id = Column(Integer, primary_key=True, index=True)
    clan_id = Column(Integer, ForeignKey("clans.id"))
    user_id = Column(String, index=True)
    role = Column(String, default="member")
    joined_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, index=True)
    user_id = Column(String)
    user_name = Column(String)
    avatar = Column(String, nullable=True)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class UserSettings(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    
    dark_mode = Column(Integer, default=1)
    accent_color = Column(String, default="purple")
    
    auto_play_videos = Column(Integer, default=1)
    data_saver = Column(Integer, default=0)
    sound_effects = Column(Integer, default=1)
    
    push_notifications = Column(Integer, default=1)
    episode_alerts = Column(Integer, default=1)
    clan_messages = Column(Integer, default=1)
    daily_prophecy = Column(Integer, default=0)
    weekly_digest = Column(Integer, default=1)
    
    online_status = Column(Integer, default=1)
    public_profile = Column(Integer, default=1)
    activity_sharing = Column(Integer, default=1)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserStreak(Base):
    __tablename__ = "user_streaks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_days_active = Column(Integer, default=0)
    total_time_minutes = Column(Integer, default=0)
    episodes_watched = Column(Integer, default=0)
    last_active_date = Column(String, nullable=True)
    
    bonus_days = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PrivateMessage(Base):
    __tablename__ = "private_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String, index=True)
    receiver_id = Column(String, index=True)
    text = Column(String)
    read = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    email = Column(String, nullable=True)
    category = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class GameSession(Base):
    __tablename__ = "game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, unique=True, index=True)
    game_type = Column(String)
    host_id = Column(String)
    opponent_id = Column(String, nullable=True)
    status = Column(String, default="waiting") # waiting, playing, finished
    winner_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

class TriviaStats(Base):
    __tablename__ = "trivia_stats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    
    total_played = Column(Integer, default=0)
    total_correct = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    chakra_earned = Column(Integer, default=0)
    last_played = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ─── AI Story Writer Models ───────────────────────────────────────────────────

class WebNovel(Base):
    __tablename__ = "web_novels"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    title = Column(String, index=True)
    synopsis = Column(String, nullable=True)
    genre = Column(String, nullable=True)          # e.g. "Fantasy, Romance"
    cover_image = Column(String, nullable=True)
    status = Column(String, default="ongoing")      # ongoing, completed, hiatus
    ai_model = Column(String, default="gemini-1.5-flash")
    world_rules = Column(String, nullable=True)     # User-defined static rules for the AI
    tone = Column(String, default="dramatic")       # dramatic, comedic, dark, literary
    chapter_count = Column(Integer, default=0)
    total_words = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chapters = relationship("StoryChapter", back_populates="novel", cascade="all, delete-orphan")
    lore_entries = relationship("StoryLore", back_populates="novel", cascade="all, delete-orphan")

class StoryChapter(Base):
    __tablename__ = "story_chapters"
    id = Column(Integer, primary_key=True, index=True)
    novel_id = Column(Integer, ForeignKey("web_novels.id"), index=True)
    chapter_number = Column(Integer)
    title = Column(String, nullable=True)
    content = Column(String)                        # Full chapter text (HTML or Markdown)
    word_count = Column(Integer, default=0)
    summary = Column(String, nullable=True)         # AI-generated chapter summary
    ai_generated = Column(Integer, default=0)       # 1 if AI wrote it, 0 if user
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    novel = relationship("WebNovel", back_populates="chapters")

class StoryLore(Base):
    """The Lorebook — discrete memory fragments extracted from chapters.
    These are fed to the AI before generating the next chapter so it
    maintains perfect continuity across 1000+ chapters."""
    __tablename__ = "story_lore"
    id = Column(Integer, primary_key=True, index=True)
    novel_id = Column(Integer, ForeignKey("web_novels.id"), index=True)
    source_chapter = Column(Integer)                # Which chapter this was extracted from
    category = Column(String, index=True)           # character, plot, world, timeline, secret
    key = Column(String, index=True)                # e.g. "Akira Tanaka", "The Curse of Moonfall"
    value = Column(String)                          # The full lore description
    importance = Column(Integer, default=5)         # 1-10 scale; higher = always include
    active = Column(Integer, default=1)             # 0 if user archived/deleted this lore
    created_at = Column(DateTime, default=datetime.utcnow)

    novel = relationship("WebNovel", back_populates="lore_entries")

# ─── Rank Tiers ───────────────────────────────────────────────────────────────

RANK_TIERS = [
    {"name": "Academy Student", "required_days": 0, "color": "#94a3b8", "badge": "🎓"},
    {"name": "Net Novice", "required_days": 7, "color": "#a8a29e", "badge": "📖"},
    {"name": "Wanderer", "required_days": 15, "color": "#6b7280", "badge": "🚶"},
    {"name": "Net Disciple", "required_days": 30, "color": "#cd7f32", "badge": "📿"},
    {"name": "Net Master", "required_days": 40, "color": "#c0c0c0", "badge": "🥋"},
    {"name": "Overseer", "required_days": 60, "color": "#ffd700", "badge": "👁️"},
    {"name": "Net King", "required_days": 70, "color": "#e5e4e2", "badge": "👑"},
    {"name": "Net Emperor", "required_days": 85, "color": "#b9f2ff", "badge": "🏯"},
    {"name": "Net Ancestor", "required_days": 100, "color": "#50c878", "badge": "🌳"},
    {"name": "Net Sage", "required_days": 150, "color": "#e0115f", "badge": "📜"},
    {"name": "Net Demi-God", "required_days": 200, "color": "#0f52ba", "badge": "⚡"},
    {"name": "Golden Overseer", "required_days": 300, "color": "#dc143c", "badge": "🔱"},
    {"name": "Net God", "required_days": 365, "color": "#ff00ff", "badge": "✨"},
]

def calculate_rank(total_days: int) -> dict:
    current_rank = RANK_TIERS[0]
    for tier in RANK_TIERS:
        if total_days >= tier["required_days"]:
            current_rank = tier
    return current_rank
