
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import logging

from app.database import get_db
from app.models.sql import Feedback
from app.services.email_service import send_feedback_received_email

logger = logging.getLogger(__name__)

router = APIRouter()

class FeedbackCreate(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    category: str = Field(..., description="bug | feature | general | other")
    message: str = Field(..., min_length=10, max_length=2000)

class RatingCreate(BaseModel):
    user_id: str
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    comment: Optional[str] = Field(None, max_length=500)
    platform: str = Field(default="web", description="web | ios | android")

class FeedbackResponse(BaseModel):
    id: int
    category: str
    message: str
    created_at: datetime
    status: str = "received"

app_ratings = []

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    
    new_feedback = Feedback(
        user_id=feedback.user_id,
        email=feedback.email,
        category=feedback.category,
        message=feedback.message
    )
    
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    
    logger.info(f"📬 New feedback received: [{feedback.category}] from {feedback.user_id or 'anonymous'}")
    
    if feedback.email:
        try:
            send_feedback_received_email(
                user_email=feedback.email,
                feedback_text=feedback.message,
                display_name="Nakama Member"
            )
        except Exception as e:
            logger.error(f"Failed to send feedback confirmation email: {e}")
    
    return {
        "id": new_feedback.id,
        "category": new_feedback.category,
        "message": new_feedback.message,
        "created_at": new_feedback.created_at,
        "status": "received"
    }

@router.get("/feedback")
def get_all_feedback(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)
    
    if category:
        query = query.filter(Feedback.category == category)
    
    feedbacks = query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": f.id,
            "user_id": f.user_id,
            "email": f.email,
            "category": f.category,
            "message": f.message,
            "created_at": f.created_at
        }
        for f in feedbacks
    ]

@router.get("/feedback/stats")
def get_feedback_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    total = db.query(Feedback).count()
    
    category_counts = db.query(
        Feedback.category,
        func.count(Feedback.id)
    ).group_by(Feedback.category).all()
    
    return {
        "total_feedback": total,
        "by_category": {cat: count for cat, count in category_counts}
    }

@router.post("/app/rate")
def rate_app(rating: RatingCreate):
    
    rating_entry = {
        "user_id": rating.user_id,
        "rating": rating.rating,
        "comment": rating.comment,
        "platform": rating.platform,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    app_ratings.append(rating_entry)
    
    logger.info(f"⭐ App rated {rating.rating}/5 by {rating.user_id} on {rating.platform}")
    
    if app_ratings:
        avg = sum(r["rating"] for r in app_ratings) / len(app_ratings)
    else:
        avg = rating.rating
    
    return {
        "message": "Thank you for rating!",
        "your_rating": rating.rating,
        "total_ratings": len(app_ratings),
        "average_rating": round(avg, 2)
    }

@router.get("/app/ratings")
def get_app_ratings():
    if not app_ratings:
        return {
            "total_ratings": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in app_ratings:
        distribution[r["rating"]] += 1
    
    avg = sum(r["rating"] for r in app_ratings) / len(app_ratings)
    
    return {
        "total_ratings": len(app_ratings),
        "average_rating": round(avg, 2),
        "rating_distribution": distribution,
        "recent_ratings": app_ratings[-10:]
    }
