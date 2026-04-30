
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
import logging
import secrets
import uuid

from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sql import User, UserStats, UserSettings
from app.services.email_service import email_service
from app.services.security import jwt_service, password_service
from app.middleware import require_auth
from app.api_gateway import api_response, error_response

router = APIRouter()
logger = logging.getLogger(__name__)

class WelcomeRequest(BaseModel):
    email: EmailStr
    display_name: str

class AnnouncementRequest(BaseModel):
    email: EmailStr
    display_name: str
    subject: str
    message: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: str = Field(..., min_length=2, max_length=30)

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        return error_response(message="Email already registered", code="ALREADY_EXISTS")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_pw = password_service.hash_password(request.password)
    
    new_user = User(
        user_id=user_id,
        email=request.email,
        hashed_password=hashed_pw,
        display_name=request.display_name,
        is_verified=0
    )
    
    # Initialize stats and settings
    new_stats = UserStats(user_id=user_id, display_name=request.display_name)
    new_settings = UserSettings(user_id=user_id)
    
    try:
        db.add(new_user)
        db.add(new_stats)
        db.add(new_settings)
        db.commit()
        db.refresh(new_user)
        
        # Create tokens
        access_token = jwt_service.create_access_token(user_id=user_id)
        refresh_token = jwt_service.create_refresh_token(user_id=user_id)
        
        # Create verification token
        verification_token = secrets.token_urlsafe(32)
        new_user.verification_token = verification_token
        db.commit()
        
        # Send verification email asynchronously via background tasks or just try/except
        try:
            from app.config import settings
            verify_url = f"{settings.app_url}/verify?token={verification_token}"
            email_service.send_verification_email(request.email, request.display_name, verify_url)
        except Exception as e:
            logger.warning(f"Could not send verification email to {request.email}: {e}")

        return api_response(
            message="User created successfully",
            data={
                "user": {
                    "user_id": user_id,
                    "email": new_user.email,
                    "display_name": new_user.display_name,
                    "is_verified": bool(new_user.is_verified)
                },
                "tokens": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "expires_in": jwt_service.expiry_minutes * 60
                }
            }
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}")
        return error_response(message="Failed to create user", code="INTERNAL_ERROR")


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user or not password_service.verify_password(request.password, user.hashed_password):
            return error_response(message="Invalid email or password", code="UNAUTHORIZED")
        
        # Create tokens
        access_token = jwt_service.create_access_token(user_id=user.user_id)
        refresh_token = jwt_service.create_refresh_token(user_id=user.user_id)
        
        return api_response(
            message="Login successful",
            data={
                "user": {
                    "user_id": user.user_id,
                    "email": user.email,
                    "display_name": user.display_name,
                    "avatar_url": user.avatar_url,
                    "is_verified": bool(user.is_verified)
                },
                "tokens": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "expires_in": jwt_service.expiry_minutes * 60
                }
            }
        )
    except Exception as e:
        logger.error(f"Login error: {e}")
        return error_response(message="Authentication service unavailable. Please try again.", code="INTERNAL_ERROR")

@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.verification_token == token).first()
        if not user:
            return error_response(message="Invalid or expired verification token", code="INVALID_INPUT")
        
        user.is_verified = 1
        user.verification_token = None
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Verify email error: {e}")
        return error_response(message="Failed to verify email", code="INTERNAL_ERROR")
    
    # Send welcome email now that verified
    try:
        email_service.send_welcome_email(user.email, user.display_name)
    except Exception as e:
        logger.warning(f"Welcome email failed for {user.email}: {e}")

    return api_response(message="Email verified successfully")

@router.post("/forgot-password")
async def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Obscure whether account exists
        return api_response(message="If an account exists, a reset link has been sent")
    
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    db.commit()
    
    try:
        from app.config import settings
        reset_url = f"{settings.app_url}/reset-password?token={reset_token}"
        email_service.send_password_reset_email(user.email, user.display_name, reset_url)
    except Exception as e:
        logger.error(f"Failed to send reset email: {e}")
        return error_response(message="Failed to send reset email", code="INTERNAL_ERROR")
        
    return api_response(message="Reset link sent")

@router.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        return error_response(message="Invalid or expired reset token", code="INVALID_INPUT")
    
    user.hashed_password = password_service.hash_password(new_password)
    user.reset_token = None
    db.commit()
    
    return api_response(message="Password updated successfully")

@router.get("/me")
async def get_me(user_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return error_response(message="User not found", code="NOT_FOUND")
    
    return api_response(
        data={
            "user_id": user.user_id,
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "is_verified": bool(user.is_verified)
        }
    )

@router.post("/refresh")
async def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    payload = jwt_service.verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        return error_response(message="Invalid refresh token", code="UNAUTHORIZED")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return error_response(message="User not found", code="NOT_FOUND")
    
    access_token = jwt_service.create_access_token(user_id=user_id)
    
    return api_response(
        data={
            "access_token": access_token,
            "refresh_token": request.refresh_token,
            "expires_in": jwt_service.expiry_minutes * 60
        }
    )

@router.post("/logout")
async def logout(user_id: str = Depends(require_auth)):
    logger.info(f"User {user_id} logged out")
    return api_response(message="Logged out successfully")

@router.post("/welcome")
async def send_welcome(request: WelcomeRequest):
    try:
        success = email_service.send_welcome_email(request.email, request.display_name)
        if not success:
            logger.warning(f"Failed to send welcome email to {request.email}")
            return api_response(message="Email queued (mock)", status="queued")
        return api_response(message="Welcome email sent")
    except Exception as e:
        logger.error(f"Error in welcome email: {e}")
        return error_response(message="Failed to send email", code="INTERNAL_ERROR")

@router.post("/announcement")
async def send_announcement(request: AnnouncementRequest):
    try:
        success = email_service.send_announcement_email(
            request.email, 
            request.display_name, 
            request.subject, 
            request.message
        )
        if not success:
            logger.warning(f"Failed to send announcement email to {request.email}")
            return api_response(message="Email queued (mock)", status="queued")
        return api_response(message="Announcement email sent")
    except Exception as e:
        logger.error(f"Error in announcement email: {e}")
        return error_response(message="Failed to send email", code="INTERNAL_ERROR")
