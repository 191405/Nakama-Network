
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import subprocess
import os
import logging
from pathlib import Path

router = APIRouter()
logger = logging.getLogger(__name__)

ENCODE_DIR = "static/encoded"
Path(ENCODE_DIR).mkdir(parents=True, exist_ok=True)

QUALITY_PRESETS = {
    "1080p": {"height": 1080, "bitrate": "4000k", "audio_bitrate": "128k"},
    "720p": {"height": 720, "bitrate": "2500k", "audio_bitrate": "128k"},
    "480p": {"height": 480, "bitrate": "1000k", "audio_bitrate": "96k"},
    "360p": {"height": 360, "bitrate": "600k", "audio_bitrate": "64k"},
}

class EncodeRequest(BaseModel):
    video_url: str
    episode_id: int
    target_qualities: List[str] = ["720p", "480p"]

class EncodeStatus(BaseModel):
    episode_id: int
    status: str
    progress: int = 0
    qualities: dict = {}

encode_jobs = {}

def run_ffmpeg_encode(input_url: str, output_path: str, quality: str) -> bool:
    preset = QUALITY_PRESETS.get(quality, QUALITY_PRESETS["720p"])
    
    try:
        cmd = [
            "ffmpeg",
            "-i", input_url,
            "-vf", f"scale=-2:{preset['height']}",
            "-c:v", "libx264",
            "-preset", "medium",
            "-b:v", preset["bitrate"],
            "-c:a", "aac",
            "-b:a", preset["audio_bitrate"],
            "-movflags", "+faststart",
            "-y",
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        
        if result.returncode != 0:
            logger.error(f"FFmpeg error: {result.stderr}")
            return False
            
        return True
        
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg encoding timed out")
        return False
    except FileNotFoundError:
        logger.error("FFmpeg not installed on server")
        return False
    except Exception as e:
        logger.error(f"Encoding failed: {e}")
        return False

def process_encode_job(episode_id: int, video_url: str, qualities: List[str]):
    encode_jobs[episode_id] = {
        "status": "processing",
        "progress": 0,
        "qualities": {}
    }
    
    total = len(qualities)
    completed = 0
    
    for quality in qualities:
        output_filename = f"{episode_id}_{quality}.mp4"
        output_path = os.path.join(ENCODE_DIR, output_filename)
        
        logger.info(f"Encoding {episode_id} to {quality}...")
        
        success = run_ffmpeg_encode(video_url, output_path, quality)
        
        if success:
            encode_jobs[episode_id]["qualities"][quality] = f"/static/encoded/{output_filename}"
            completed += 1
            encode_jobs[episode_id]["progress"] = int((completed / total) * 100)
        else:
            logger.error(f"Failed to encode {episode_id} to {quality}")
    
    if completed == total:
        encode_jobs[episode_id]["status"] = "completed"
    elif completed > 0:
        encode_jobs[episode_id]["status"] = "partial"
    else:
        encode_jobs[episode_id]["status"] = "failed"

@router.post("/encode")
async def start_encode(request: EncodeRequest, background_tasks: BackgroundTasks):
    
    if request.episode_id in encode_jobs:
        job = encode_jobs[request.episode_id]
        if job["status"] == "processing":
            return {"message": "Already processing", "job": job}
    
    valid_qualities = [q for q in request.target_qualities if q in QUALITY_PRESETS]
    
    if not valid_qualities:
        raise HTTPException(status_code=400, detail="No valid quality targets specified")
    
    background_tasks.add_task(
        process_encode_job,
        request.episode_id,
        request.video_url,
        valid_qualities
    )
    
    encode_jobs[request.episode_id] = {
        "status": "pending",
        "progress": 0,
        "qualities": {}
    }
    
    return {
        "message": "Encoding started",
        "episode_id": request.episode_id,
        "target_qualities": valid_qualities
    }

@router.get("/status/{episode_id}")
def get_encode_status(episode_id: int):
    if episode_id not in encode_jobs:
        return {"status": "not_found", "episode_id": episode_id}
    
    return {
        "episode_id": episode_id,
        **encode_jobs[episode_id]
    }

@router.get("/qualities")
def get_available_qualities():
    return {
        "qualities": list(QUALITY_PRESETS.keys()),
        "presets": QUALITY_PRESETS
    }
