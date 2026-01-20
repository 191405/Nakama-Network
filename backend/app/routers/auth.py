
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import logging

from app.services.email_service import send_welcome_email
from app.services.security import jwt_service, password_service
from app.middleware import require_auth, optional_auth

router = APIRouter()
logger = logging.getLogger(__name__)

class WelcomeRequest(BaseModel):
    email: EmailStr
    display_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: str = Field(..., min_length=2, max_length=30)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str

class UserInfo(BaseModel):
    user_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None

@router.post("/welcome")
async def send_welcome(request: WelcomeRequest):
    try:
        success = send_welcome_email(request.email, request.display_name)
        if not success:
            logger.warning(f"Failed to send welcome email to {request.email}")
            return {"status": "queued", "message": "Email queued (mock)"}
        return {"status": "sent", "message": "Welcome email sent"}
    except Exception as e:
        logger.error(f"Error in welcome email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@router.post("/token", response_model=TokenResponse)
async def create_token(user_id: str, email: Optional[str] = None):
    try:
        access_token = jwt_service.create_access_token(
            user_id=user_id,
            extra_claims={"email": email} if email else None
        )
        refresh_token = jwt_service.create_refresh_token(user_id=user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=jwt_service.expiry_minutes * 60
        )
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create authentication token"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest):
    payload = jwt_service.verify_token(request.refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    access_token = jwt_service.create_access_token(user_id=user_id)
    refresh_token = jwt_service.create_refresh_token(user_id=user_id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=jwt_service.expiry_minutes * 60
    )

@router.get("/me", response_model=UserInfo)
async def get_current_user(user_id: str = Depends(require_auth)):
    return UserInfo(user_id=user_id)

@router.post("/verify")
async def verify_token(user_id: Optional[str] = Depends(optional_auth)):
    if user_id:
        return {
            "valid": True,
            "user_id": user_id,
            "authenticated": True
        }
    return {
        "valid": False,
        "user_id": None,
        "authenticated": False
    }

@router.post("/logout")
async def logout(user_id: str = Depends(require_auth)):
    logger.info(f"User {user_id} logged out")
    return {
        "message": "Logged out successfully",
        "user_id": user_id
    }

@router.post("/hash-password")
async def hash_password_endpoint(password: str):
    from app.config import settings
    
    if settings.is_production:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint not available"
        )
    
    hashed = password_service.hash_password(password)
    return {"hashed": hashed}

@router.post("/verify-password")
async def verify_password_endpoint(password: str, hashed: str):
    from app.config import settings
    
    if settings.is_production:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint not available"
        )
    
    valid = password_service.verify_password(password, hashed)
    return {"valid": valid}
