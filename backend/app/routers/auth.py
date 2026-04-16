
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import logging
import secrets

import uuid
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sql import User, UserStats, UserSettings
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
    avatar_url: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserInfo
    tokens: TokenResponse

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_pw = password_service.hash_password(request.password)
    
    new_user = User(
        user_id=user_id,
        email=request.email,
        hashed_password=hashed_pw,
        display_name=request.display_name
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
        
        # Send verification email instead of direct welcome
        try:
            # We'll need a frontend URL for verification
            from app.config import settings
            verify_url = f"{settings.app_url}/verify?token={verification_token}"
            from app.services.email_service import email_service
            email_service.send_verification_email(request.email, request.display_name, verify_url)
        except Exception as e:
            logger.warning(f"Could not send verification email to {request.email}: {e}")

        return AuthResponse(
            user=UserInfo(
                user_id=user_id,
                email=new_user.email,
                display_name=new_user.display_name
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=jwt_service.expiry_minutes * 60
            )
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user")

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not password_service.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create tokens
    access_token = jwt_service.create_access_token(user_id=user.user_id)
    refresh_token = jwt_service.create_refresh_token(user_id=user.user_id)
    
    return AuthResponse(
        user=UserInfo(
            user_id=user.user_id,
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url
        ),
        tokens=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=jwt_service.expiry_minutes * 60
        )
    )

@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    
    user.is_verified = 1
    user.verification_token = None
    db.commit()
    
    # Now send the real welcome email as they are verified
    try:
        from app.services.email_service import email_service
        email_service.send_welcome_email(user.email, user.display_name)
    except Exception:
        pass

    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal user existence in prod, but for now we follow request
        return {"message": "If an account exists, a reset link has been sent"}
    
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    db.commit()
    
    try:
        reset_url = f"{APP_URL}/reset-password?token={reset_token}"
        from app.services.email_service import email_service
        email_service.send_password_reset_email(user.email, user.display_name, reset_url)
    except Exception as e:
        logger.error(f"Failed to send reset email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reset email")
        
    return {"message": "Reset link sent"}

@router.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user.hashed_password = password_service.hash_password(new_password)
    user.reset_token = None
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.get("/me", response_model=UserInfo)
async def get_me(user_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserInfo(
        user_id=user.user_id,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = jwt_service.verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new access token
    access_token = jwt_service.create_access_token(user_id=user_id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token, # Reuse or rotate
        expires_in=jwt_service.expiry_minutes * 60
    )

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
