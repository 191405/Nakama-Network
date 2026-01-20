
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, WebSocketException, status
from starlette.websockets import WebSocketState
from typing import List, Dict, Optional, Set
import json
import logging
import asyncio
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.sql import Message
from app.database import get_db
from datetime import datetime, timedelta
import time

logger = logging.getLogger(__name__)

router = APIRouter()

class WebSocketConfig:
    HEARTBEAT_INTERVAL = 30
    HEARTBEAT_TIMEOUT = 10
    MAX_MESSAGE_SIZE = 65536
    RATE_LIMIT_MESSAGES = 20
    RATE_LIMIT_WINDOW = 10
    MAX_CONNECTIONS_PER_ROOM = 100
    CONNECTION_TIMEOUT = 300
    RECONNECT_GRACE_PERIOD = 5

class RobustConnectionManager:
    
    def __init__(self):
        self.active_connections: Dict[str, Dict[WebSocket, dict]] = defaultdict(dict)
        self.rate_limits: Dict[str, List[float]] = defaultdict(list)
        self._heartbeat_tasks: Dict[WebSocket, asyncio.Task] = {}
        self._lock = asyncio.Lock()
    
    async def connect(
        self, 
        websocket: WebSocket, 
        room_id: str, 
        user_name: str,
        user_id: Optional[str] = None
    ) -> bool:
        async with self._lock:
            if len(self.active_connections[room_id]) >= WebSocketConfig.MAX_CONNECTIONS_PER_ROOM:
                logger.warning(f"Room {room_id} at capacity, rejecting connection")
                await websocket.close(code=1013, reason="Room at capacity")
                return False
            
            try:
                await websocket.accept()
            except Exception as e:
                logger.error(f"Failed to accept WebSocket: {e}")
                return False
            
            client_info = {
                "user_name": user_name,
                "user_id": user_id or user_name,
                "connected_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "message_count": 0
            }
            self.active_connections[room_id][websocket] = client_info
            
            self._heartbeat_tasks[websocket] = asyncio.create_task(
                self._heartbeat_loop(websocket, room_id)
            )
            
            logger.info(
                f"Client {user_name} connected to room {room_id}. "
                f"Room has {len(self.active_connections[room_id])} clients"
            )
            return True
    
    async def disconnect(self, websocket: WebSocket, room_id: str):
        async with self._lock:
            if websocket in self._heartbeat_tasks:
                self._heartbeat_tasks[websocket].cancel()
                try:
                    await self._heartbeat_tasks[websocket]
                except asyncio.CancelledError:
                    pass
                del self._heartbeat_tasks[websocket]
            
            if room_id in self.active_connections:
                if websocket in self.active_connections[room_id]:
                    client_info = self.active_connections[room_id].pop(websocket)
                    logger.info(f"Client {client_info['user_name']} disconnected from room {room_id}")
                
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
            
            client_id = f"{room_id}:{id(websocket)}"
            if client_id in self.rate_limits:
                del self.rate_limits[client_id]
    
    def is_connected(self, websocket: WebSocket) -> bool:
        try:
            return (
                websocket.client_state == WebSocketState.CONNECTED and
                websocket.application_state == WebSocketState.CONNECTED
            )
        except Exception:
            return False
    
    def check_rate_limit(self, websocket: WebSocket, room_id: str) -> bool:
        client_id = f"{room_id}:{id(websocket)}"
        now = time.time()
        window_start = now - WebSocketConfig.RATE_LIMIT_WINDOW
        
        self.rate_limits[client_id] = [
            ts for ts in self.rate_limits[client_id] 
            if ts > window_start
        ]
        
        if len(self.rate_limits[client_id]) >= WebSocketConfig.RATE_LIMIT_MESSAGES:
            return False
        
        self.rate_limits[client_id].append(now)
        return True
    
    async def send_safe(self, websocket: WebSocket, message: dict) -> bool:
        if not self.is_connected(websocket):
            return False
        
        try:
            await asyncio.wait_for(
                websocket.send_json(message),
                timeout=5.0
            )
            return True
        except asyncio.TimeoutError:
            logger.warning("WebSocket send timed out")
            return False
        except Exception as e:
            logger.debug(f"WebSocket send failed: {e}")
            return False
    
    async def broadcast(self, message: dict, room_id: str, exclude: WebSocket = None):
        if room_id not in self.active_connections:
            return
        
        dead_connections = []
        
        connections = list(self.active_connections[room_id].keys())
        
        for websocket in connections:
            if websocket == exclude:
                continue
            
            success = await self.send_safe(websocket, message)
            if not success:
                dead_connections.append(websocket)
        
        for ws in dead_connections:
            await self.disconnect(ws, room_id)
    
    async def _heartbeat_loop(self, websocket: WebSocket, room_id: str):
        try:
            while self.is_connected(websocket):
                await asyncio.sleep(WebSocketConfig.HEARTBEAT_INTERVAL)
                
                if not self.is_connected(websocket):
                    break
                
                try:
                    pong_waiter = await websocket.ping()
                    await asyncio.wait_for(pong_waiter, timeout=WebSocketConfig.HEARTBEAT_TIMEOUT)
                    
                    if room_id in self.active_connections:
                        if websocket in self.active_connections[room_id]:
                            self.active_connections[room_id][websocket]["last_activity"] = datetime.utcnow()
                            
                except asyncio.TimeoutError:
                    logger.info(f"Heartbeat timeout for client in room {room_id}")
                    break
                except Exception as e:
                    logger.debug(f"Heartbeat error: {e}")
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Heartbeat loop error: {e}")
        finally:
            if self.is_connected(websocket):
                try:
                    await websocket.close(code=1000, reason="Heartbeat failed")
                except Exception:
                    pass
    
    def get_room_stats(self, room_id: str) -> dict:
        if room_id not in self.active_connections:
            return {"clients": 0, "users": []}
        
        clients = self.active_connections[room_id]
        return {
            "clients": len(clients),
            "users": [info["user_name"] for info in clients.values()]
        }
    
    def get_total_connections(self) -> int:
        return sum(len(clients) for clients in self.active_connections.values())

manager = RobustConnectionManager()

@router.websocket("/ws/{room_id}/{user_name}")
async def websocket_endpoint(
    websocket: WebSocket, 
    room_id: str, 
    user_name: str
):
    db = next(get_db())
    
    try:
        connected = await manager.connect(websocket, room_id, user_name)
        if not connected:
            return
        
        await manager.broadcast({
            "type": "system",
            "message": f"{user_name} has joined the chat",
            "user": "System",
            "timestamp": datetime.utcnow().isoformat(),
            "room_stats": manager.get_room_stats(room_id)
        }, room_id, exclude=websocket)
        
        await manager.send_safe(websocket, {
            "type": "connected",
            "message": f"Welcome to {room_id}!",
            "room_stats": manager.get_room_stats(room_id)
        })
        
        while manager.is_connected(websocket):
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=WebSocketConfig.CONNECTION_TIMEOUT
                )
                
                if len(data) > WebSocketConfig.MAX_MESSAGE_SIZE:
                    await manager.send_safe(websocket, {
                        "type": "error",
                        "message": "Message too large",
                        "max_size": WebSocketConfig.MAX_MESSAGE_SIZE
                    })
                    continue
                
                if not manager.check_rate_limit(websocket, room_id):
                    await manager.send_safe(websocket, {
                        "type": "error",
                        "message": "Rate limit exceeded. Please slow down.",
                        "retry_after": WebSocketConfig.RATE_LIMIT_WINDOW
                    })
                    continue
                
                try:
                    message_data = json.loads(data)
                except json.JSONDecodeError:
                    await manager.send_safe(websocket, {
                        "type": "error",
                        "message": "Invalid JSON format"
                    })
                    continue
                
                msg_type = message_data.get("type", "message")
                
                if msg_type == "ping":
                    await manager.send_safe(websocket, {"type": "pong"})
                    continue
                
                if msg_type == "typing":
                    await manager.broadcast({
                        "type": "typing",
                        "user": user_name
                    }, room_id, exclude=websocket)
                    continue
                
                text = message_data.get("text", "").strip()
                if not text:
                    continue
                
                avatar = message_data.get("avatar", "")
                
                try:
                    new_msg = Message(
                        room_id=room_id,
                        user_name=user_name,
                        user_id=user_name,
                        avatar=avatar,
                        text=text,
                        timestamp=datetime.utcnow()
                    )
                    db.add(new_msg)
                    db.commit()
                    
                    await manager.broadcast({
                        "type": "message",
                        "text": text,
                        "user": user_name,
                        "avatar": avatar,
                        "timestamp": new_msg.timestamp.isoformat(),
                        "id": new_msg.id
                    }, room_id)
                    
                except Exception as e:
                    logger.error(f"Database error: {e}")
                    db.rollback()
                    await manager.send_safe(websocket, {
                        "type": "error",
                        "message": "Failed to save message"
                    })
                
            except asyncio.TimeoutError:
                logger.info(f"Connection timeout for {user_name} in room {room_id}")
                await manager.send_safe(websocket, {
                    "type": "timeout",
                    "message": "Connection timed out due to inactivity"
                })
                break
                
            except WebSocketDisconnect:
                break
                
            except Exception as e:
                logger.error(f"Error in message loop: {e}")
                await asyncio.sleep(0.1)
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await manager.disconnect(websocket, room_id)
        
        try:
            await manager.broadcast({
                "type": "system",
                "message": f"{user_name} has left the chat",
                "user": "System",
                "timestamp": datetime.utcnow().isoformat(),
                "room_stats": manager.get_room_stats(room_id)
            }, room_id)
        except Exception:
            pass
        
        try:
            db.close()
        except Exception:
            pass

@router.get("/chat/history/{room_id}")
def get_chat_history(room_id: str, db: Session = Depends(get_db), limit: int = 50):
    messages = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.timestamp.desc()).limit(limit).all()
    
    history = []
    for msg in reversed(messages):
        history.append({
            "type": "message",
            "text": msg.text,
            "user": msg.user_name,
            "avatar": msg.avatar,
            "timestamp": msg.timestamp.isoformat(),
            "id": msg.id
        })
    return history

@router.get("/chat/rooms")
def get_active_rooms():
    rooms = []
    for room_id in manager.active_connections.keys():
        stats = manager.get_room_stats(room_id)
        rooms.append({
            "id": room_id,
            "name": room_id.replace("clan_", "Clan: ").replace("room_", ""),
            "clients": stats["clients"],
            "users": stats["users"]
        })
    return {
        "rooms": rooms,
        "total_connections": manager.get_total_connections()
    }

@router.get("/chat/recent")
def get_recent_chats(user_name: str = None, db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    subquery = db.query(
        Message.room_id,
        func.max(Message.timestamp).label("max_ts")
    ).group_by(Message.room_id).subquery()
    
    results = db.query(Message).join(
        subquery,
        (Message.room_id == subquery.c.room_id) & (Message.timestamp == subquery.c.max_ts)
    ).order_by(Message.timestamp.desc()).limit(20).all()
    
    chats = []
    for msg in results:
        room_stats = manager.get_room_stats(msg.room_id)
        chats.append({
            "id": msg.room_id,
            "name": msg.room_id.replace("clan_", "Clan: ").replace("room_", ""),
            "message": msg.text,
            "time": msg.timestamp.strftime("%H:%M"),
            "timestamp": msg.timestamp.isoformat(),
            "unread": 0,
            "online": room_stats["clients"]
        })
    return chats

@router.get("/chat/health")
def websocket_health():
    return {
        "status": "healthy",
        "total_connections": manager.get_total_connections(),
        "active_rooms": len(manager.active_connections),
        "config": {
            "heartbeat_interval": WebSocketConfig.HEARTBEAT_INTERVAL,
            "rate_limit": f"{WebSocketConfig.RATE_LIMIT_MESSAGES} per {WebSocketConfig.RATE_LIMIT_WINDOW}s",
            "max_message_size": WebSocketConfig.MAX_MESSAGE_SIZE,
            "max_clients_per_room": WebSocketConfig.MAX_CONNECTIONS_PER_ROOM
        }
    }
