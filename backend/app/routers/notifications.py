from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.database import get_db
from app.models.sql import Notification
from app.middleware import require_auth
from app.api_gateway import api_response, paginated_response

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Retrieve personal notifications for the current user."""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    
    total = query.count()
    notifications = query.order_by(Notification.created_at.desc()).offset((page-1)*limit).limit(limit).all()
    
    return paginated_response(
        items=[{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "link": n.link,
            "is_read": bool(n.is_read),
            "created_at": n.created_at
        } for n in notifications],
        total=total,
        page=page,
        limit=limit
    )

@router.get("/unread-count")
async def get_unread_count(
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id, 
        Notification.is_read == 0
    ).count()
    
    return api_response(data={"count": count})

@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Mark a specific notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id, 
        Notification.user_id == user_id
    ).first()
    
    if notification:
        notification.is_read = 1
        db.commit()
        
    return api_response(message="Notification marked as read")

@router.post("/read-all")
async def mark_all_read(
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Mark all unread notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == user_id, 
        Notification.is_read == 0
    ).update({"is_read": 1})
    
    db.commit()
    return api_response(message="All notifications marked as read")
