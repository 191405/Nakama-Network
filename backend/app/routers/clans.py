from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from app.database import get_db
from app.models.sql import Clan, ClanMember
from app.middleware import require_auth
from app.api_gateway import api_response, error_response, paginated_response

router = APIRouter()
logger = logging.getLogger(__name__)

CLAN_MAX_MEMBERS = 90
CLAN_MIN_ELITE = 20

class ClanCreate(BaseModel):
    name: str
    description: str
    banner_image: Optional[str] = None

def format_clan(clan: Clan) -> dict:
    return {
        "id": clan.id,
        "name": clan.name,
        "description": clan.description,
        "leader_id": clan.leader_id,
        "member_count": clan.member_count,
        "banner_image": clan.banner_image,
        "is_elite": clan.member_count >= CLAN_MIN_ELITE,
        "created_at": clan.created_at
    }

@router.post("/")
async def create_clan(
    clan_data: ClanCreate, 
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    # Check if user already in a clan
    existing_member = db.query(ClanMember).filter(ClanMember.user_id == user_id).first()
    if existing_member:
        return error_response(message="You are already in a clan", code="ALREADY_IN_CLAN")
        
    if db.query(Clan).filter(Clan.name == clan_data.name).first():
        return error_response(message="Clan name already exists", code="ALREADY_EXISTS")
    
    new_clan = Clan(
        name=clan_data.name,
        description=clan_data.description,
        leader_id=user_id,
        banner_image=clan_data.banner_image,
        member_count=1
    )
    db.add(new_clan)
    db.commit()
    db.refresh(new_clan)
    
    member = ClanMember(clan_id=new_clan.id, user_id=user_id, role="leader")
    db.add(member)
    db.commit()
    
    return api_response(
        message="Clan created successfully",
        data=format_clan(new_clan)
    )

@router.get("/")
async def list_clans(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    clans = db.query(Clan).offset(skip).limit(limit).all()
    return api_response(data=[format_clan(c) for c in clans])

@router.get("/{clan_id}")
async def get_clan(clan_id: int, db: Session = Depends(get_db)):
    clan = db.query(Clan).filter(Clan.id == clan_id).first()
    if not clan:
        return error_response(message="Clan not found", code="NOT_FOUND")
    return api_response(data=format_clan(clan))

@router.post("/{clan_id}/join")
async def join_clan(
    clan_id: int, 
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    clan = db.query(Clan).filter(Clan.id == clan_id).first()
    if not clan:
        return error_response(message="Clan not found", code="NOT_FOUND")
        
    if clan.member_count >= CLAN_MAX_MEMBERS:
        return error_response(
            message=f"Clan is full (Max {CLAN_MAX_MEMBERS} members)", 
            code="CLAN_FULL"
        )
        
    existing = db.query(ClanMember).filter(ClanMember.user_id == user_id).first()
    if existing:
         return error_response(message="You already belong to a clan", code="ALREADY_MEMBER")
    
    member = ClanMember(clan_id=clan_id, user_id=user_id)
    db.add(member)
    clan.member_count += 1
    db.commit()
    
    return api_response(message=f"Successfully joined {clan.name}")

@router.get("/me/membership")
async def get_my_clan(
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    member = db.query(ClanMember).filter(ClanMember.user_id == user_id).first()
    if not member:
        return api_response(data=None)
        
    clan = db.query(Clan).filter(Clan.id == member.clan_id).first()
    return api_response(data=format_clan(clan))
