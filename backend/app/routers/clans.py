from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.sql import Clan, ClanMember

router = APIRouter()

class ClanCreate(BaseModel):
    name: str
    description: str
    leader_id: str
    banner_image: Optional[str] = None

class ClanResponse(BaseModel):
    id: int
    name: str
    description: str
    leader_id: str
    member_count: int
    banner_image: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ClanResponse)
def create_clan(clan: ClanCreate, db: Session = Depends(get_db)):
    if db.query(Clan).filter(Clan.name == clan.name).first():
        raise HTTPException(status_code=400, detail="Clan name already exists")
    
    new_clan = Clan(
        name=clan.name,
        description=clan.description,
        leader_id=clan.leader_id,
        banner_image=clan.banner_image,
        member_count=1
    )
    db.add(new_clan)
    db.commit()
    db.refresh(new_clan)
    
    member = ClanMember(clan_id=new_clan.id, user_id=clan.leader_id, role="leader")
    db.add(member)
    db.commit()
    
    return new_clan

@router.get("/", response_model=List[ClanResponse])
def list_clans(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Clan).offset(skip).limit(limit).all()

@router.get("/{clan_id}", response_model=ClanResponse)
def get_clan(clan_id: int, db: Session = Depends(get_db)):
    clan = db.query(Clan).filter(Clan.id == clan_id).first()
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    return clan

@router.post("/{clan_id}/join")
def join_clan(clan_id: int, user_id: str, db: Session = Depends(get_db)):
    clan = db.query(Clan).filter(Clan.id == clan_id).first()
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
        
    existing = db.query(ClanMember).filter(ClanMember.clan_id == clan_id, ClanMember.user_id == user_id).first()
    if existing:
         raise HTTPException(status_code=400, detail="Already a member")
    
    member = ClanMember(clan_id=clan_id, user_id=user_id)
    db.add(member)
    clan.member_count += 1
    db.commit()
    return {"message": "Joined clan"}

@router.get("/user/{user_id}")
def get_user_clan(user_id: str, db: Session = Depends(get_db)):
    member = db.query(ClanMember).filter(ClanMember.user_id == user_id).first()
    if not member:
        return None
    return db.query(Clan).filter(Clan.id == member.clan_id).first()
