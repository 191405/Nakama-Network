from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.sql import Review

router = APIRouter()

class ReviewCreate(BaseModel):
    user_id: str
    anime_id: int
    rating: int = Field(..., ge=1, le=10)
    text: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: str
    anime_id: int
    rating: int
    text: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    existing = db.query(Review).filter(
        Review.user_id == review.user_id, 
        Review.anime_id == review.anime_id
    ).first()
    
    if existing:
        existing.rating = review.rating
        existing.text = review.text
        existing.created_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    new_review = Review(**review.dict())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/{anime_id}", response_model=List[ReviewResponse])
def get_anime_reviews(anime_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.anime_id == anime_id).order_by(Review.created_at.desc()).all()
