from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models.sql import User
from app.middleware import require_auth
from app.services.email_service import email_service
from app.api_gateway import api_response, error_response

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_admin_user(
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
) -> str:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user or user.is_admin != 1:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user_id

@router.post("/broadcast-email")
async def broadcast_email(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Send the 'New Standards' Rose Gold update to all registered users."""
    users = db.query(User).all()
    count = 0
    
    for user in users:
        # We queue this in background tasks to avoid blocking the response
        background_tasks.add_task(
            email_service.send_email,
            user.email,
            "NAKAMA NETWORK: The New Standard Has Arrived ⚔️",
            get_broadcast_template(user.display_name or "Nakama Member")
        )
        count += 1
        
    return api_response(message=f"Broadcast started for {count} users")

def get_broadcast_template(display_name: str) -> str:
    from app.services.email_service import get_email_base_template
    
    content = f"""
    <h2 style="color: #b76e79; margin-top: 0; font-size: 26px; text-align: center;">
        A NEW ERA BEGINS 🌑
    </h2>
    
    <p style="font-size: 16px; line-height: 1.8; color: #e2e8f0;">
        Greetings, <strong>{display_name}</strong>.
    </p>
    
    <p style="font-size: 16px; line-height: 1.8; color: #cbd5e1;">
        The Nakama Network has undergone a massive evolution. Our infrastructure has been hardened, 
        our aesthetics elevated to <span style="color: #b76e79; font-weight: bold;">Rose Gold Elite</span>, 
        and our community standards have been reset.
    </p>
    
    <div style="background-color: rgba(183,110,121,0.05); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(183,110,121,0.2);">
        <h3 style="margin: 0 0 15px; color: #fff; font-size: 18px;">🛑 THE NEW STANDARDS</h3>
        <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
            <li>Old authentication protocols are now deprecated.</li>
            <li>All users must verify their identity via our new secure gateway.</li>
            <li>New Clan scaling: 20 member minimum for elite verification.</li>
            <li>Premium Rose Gold theme is now the standard for all official communications.</li>
        </ul>
    </div>
    
    <p style="font-size: 15px; line-height: 1.7; color: #94a3b8; text-align: center;">
        Your previous status is being migrated. Secure your legacy now.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
        <a href="https://nk-network-project.web.app" 
           style="background: linear-gradient(135deg, #b76e79, #8c3343);
                  color: white;
                  padding: 18px 45px; 
                  text-decoration: none; 
                  border-radius: 50px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  display: inline-block;
                  box-shadow: 0 10px 20px rgba(183,110,121,0.3);">
            CLAIM YOUR IDENTITY
        </a>
    </div>
    """
    return get_email_base_template(content, preheader="The old standards are no longer valid. Enter the new era.")
