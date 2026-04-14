
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import logging
import asyncio

router = APIRouter()
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import logging
import asyncio
import uuid
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import sql as models

online_players: Dict[str, dict] = {}
game_rooms: Dict[str, dict] = {}
websocket_connections: Dict[str, WebSocket] = {}

class PlayerStatus(BaseModel):
    user_id: str
    display_name: str
    avatar_url: Optional[str] = None
    game_type: str = "trivia"
    looking_for_game: bool = True

class GameRoom(BaseModel):
    room_id: str
    game_type: str
    players: List[str]
    status: str = "waiting"
    max_players: int = 2

@router.post("/go-online")
async def go_online(player: PlayerStatus):
    online_players[player.user_id] = {
        "user_id": player.user_id,
        "display_name": player.display_name,
        "avatar_url": player.avatar_url,
        "game_type": player.game_type,
        "looking_for_game": player.looking_for_game,
        "last_seen": datetime.utcnow()
    }
    
    return {
        "success": True,
        "online_count": len(online_players),
        "message": f"Welcome to the arcade, {player.display_name}!"
    }

@router.post("/go-offline/{user_id}")
async def go_offline(user_id: str):
    if user_id in online_players:
        del online_players[user_id]
    
    for room_id, room in list(game_rooms.items()):
        if user_id in room["players"]:
            room["players"].remove(user_id)
            if len(room["players"]) == 0:
                del game_rooms[room_id]
    
    return {"success": True}

@router.get("/online-players")
async def get_online_players(game_type: Optional[str] = None, limit: int = 20):
    cutoff = datetime.utcnow() - timedelta(minutes=5)
    active_players = {
        uid: p for uid, p in online_players.items() 
        if p["last_seen"] > cutoff
    }
    
    if game_type:
        active_players = {
            uid: p for uid, p in active_players.items() 
            if p["game_type"] == game_type
        }
    
    looking = [p for p in active_players.values() if p.get("looking_for_game", True)]
    
    return {
        "players": looking[:limit],
        "total_online": len(active_players)
    }

@router.post("/heartbeat/{user_id}")
async def heartbeat(user_id: str):
    if user_id in online_players:
        online_players[user_id]["last_seen"] = datetime.utcnow()
        return {"success": True}
    return {"success": False, "message": "Player not found"}

@router.post("/find-match")
async def find_match(player: PlayerStatus, db: Session = Depends(get_db)):
    await go_online(player)
    
    # 1. Search for an open room in DB
    open_game = db.query(models.GameSession).filter(
        models.GameSession.game_type == player.game_type,
        models.GameSession.status == "waiting",
        models.GameSession.host_id != player.user_id,
        models.GameSession.opponent_id == None
    ).first()
    
    if open_game:
        # Join existing game
        open_game.opponent_id = player.user_id
        open_game.status = "ready" # Client will see "ready" and can start
        db.commit()
        db.refresh(open_game)
        
        return {
            "matched": True,
            "room_id": open_game.room_id,
            "players": [open_game.host_id, open_game.opponent_id],
            "status": "ready"
        }
    
    # 2. Create new room if none found
    room_id = str(uuid.uuid4())[:8]
    new_game = models.GameSession(
        room_id=room_id,
        game_type=player.game_type,
        host_id=player.user_id,
        status="waiting",
        created_at=datetime.utcnow()
    )
    db.add(new_game)
    db.commit()
    
    return {
        "matched": False,
        "room_id": room_id,
        "players": [player.user_id],
        "status": "waiting",
        "message": "Waiting for opponent..."
    }

@router.get("/room/{room_id}")
async def get_room(room_id: str, db: Session = Depends(get_db)):
    game = db.query(models.GameSession).filter(models.GameSession.room_id == room_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Room not found")
        
    players = [game.host_id]
    if game.opponent_id:
        players.append(game.opponent_id)

    # Hydrate player details from online_players cache (or DB if needed, but cache is fast)
    player_details = []
    for uid in players:
        if uid in online_players:
            player_details.append(online_players[uid])
        else:
             # Fallback: Minimal info if they aren't "online" right now but in game
            player_details.append({
                "user_id": uid, 
                "display_name": "Player", 
                "avatar_url": None
            })
    
    return {
        "room_id": game.room_id,
        "game_type": game.game_type,
        "status": game.status,
        "players": players,
        "player_details": player_details
    }

@router.post("/room/{room_id}/start")
async def start_game(room_id: str, db: Session = Depends(get_db)):
    game = db.query(models.GameSession).filter(models.GameSession.room_id == room_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not game.opponent_id:
        raise HTTPException(status_code=400, detail="Not enough players")
    
    game.status = "playing"
    game.started_at = datetime.utcnow()
    db.commit()
    db.refresh(game)
    
    return {"success": True, "room_id": game.room_id, "status": "playing"}

@router.post("/room/{room_id}/leave/{user_id}")
async def leave_room(room_id: str, user_id: str, db: Session = Depends(get_db)):
    game = db.query(models.GameSession).filter(models.GameSession.room_id == room_id).first()
    if not game:
        return {"success": True, "message": "Room already closed"}
    
    if game.host_id == user_id:
        # Host left, close room or transfer? For now, close it.
        db.delete(game)
    elif game.opponent_id == user_id:
        # Opponent left
        game.opponent_id = None
        game.status = "waiting"
    
    db.commit()
    return {"success": True}

@router.get("/quick-games")
async def get_quick_games():
    games = {
        "trivia": {"name": "Anime Trivia", "emoji": "🧠", "online": 0},
        "quiz": {"name": "Character Quiz", "emoji": "🎭", "online": 0},
        "match": {"name": "Card Match", "emoji": "🃏", "online": 0},
    }
    
    cutoff = datetime.utcnow() - timedelta(minutes=5)
    
    for player in online_players.values():
        if player["last_seen"] > cutoff and player.get("looking_for_game"):
            game_type = player.get("game_type", "trivia")
            if game_type in games:
                games[game_type]["online"] += 1
    
    game_list = [
        {"id": gid, **gdata} 
        for gid, gdata in games.items()
    ]
    
    return {
        "games": game_list,
        "total_online": len([p for p in online_players.values() if p["last_seen"] > cutoff])
    }
