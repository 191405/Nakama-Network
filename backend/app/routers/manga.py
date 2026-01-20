import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

MANGADEX_API_URL = "https://api.mangadex.org"

class Manga(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    cover_url: Optional[str] = None
    status: Optional[str] = "ongoing"
    year: Optional[str] = None
    tags: List[str] = []

class Chapter(BaseModel):
    id: str
    chapter_number: str
    title: Optional[str] = ""
    publish_date: Optional[str] = None

class MangaResponse(BaseModel):
    results: List[Manga]

async def get_cover_art(manga_id: str, cover_id: str) -> str:
    if not cover_id: 
        return "https://via.placeholder.com/300x450?text=No+Cover"
    try:
        async with httpx.AsyncClient(headers={"User-Agent": "NakamaNetwork/1.0"}) as client:
            response = await client.get(f"{MANGADEX_API_URL}/cover/{cover_id}")
            if response.status_code == 200:
                data = response.json()
                filename = data['data']['attributes']['fileName']
                return f"https://uploads.mangadex.org/covers/{manga_id}/{filename}"
    except Exception:
        pass
    return "https://via.placeholder.com/300x450?text=Error"

def transform_manga_data(data: dict) -> Manga:
    attr = data['attributes']
    
    title = attr['title'].get('en') or next(iter(attr['title'].values()), "Unknown Title")
    
    desc = attr['description'].get('en') or next(iter(attr['description'].values()), "")
    
    cover_id = next((r['id'] for r in data['relationships'] if r['type'] == 'cover_art'), None)
    
    return Manga(
        id=data['id'],
        title=title,
        description=desc,
        status=attr.get('status'),
        year=str(attr.get('year') or ""),
        tags=[t['attributes']['name']['en'] for t in attr.get('tags', [])],
        cover_url=cover_id
    )

@router.get("/list")
async def list_manga(limit: int = 20, offset: int = 0):
    async with httpx.AsyncClient(headers={"User-Agent": "NakamaNetwork/1.0"}) as client:
        response = await client.get(
            f"{MANGADEX_API_URL}/manga",
            params={
                "limit": limit,
                "offset": offset,
                "includes[]": "cover_art",
                "order[followedCount]": "desc"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch from MangaDex")
            
        data = response.json()
        manga_list = []
        
        for item in data['data']:
            attr = item['attributes']
            title = attr['title'].get('en') or next(iter(attr['title'].values()), "Unknown")
            
            cover_rel = next((r for r in item['relationships'] if r['type'] == 'cover_art'), None)
            cover_url = None
            if cover_rel and cover_rel.get('attributes'):
                filename = cover_rel['attributes']['fileName']
                cover_url = f"https://uploads.mangadex.org/covers/{item['id']}/{filename}.256.jpg"

            manga_list.append({
                "id": item['id'],
                "title": title,
                "description": attr['description'].get('en', ''),
                "cover_url": cover_url,
                "year": attr.get('year'),
                "status": attr.get('status')
            })
            
        return {"manga": manga_list}

@router.get("/search")
async def search_manga(q: str):
    async with httpx.AsyncClient(headers={"User-Agent": "NakamaNetwork/1.0"}) as client:
        response = await client.get(
            f"{MANGADEX_API_URL}/manga",
            params={
                "title": q,
                "limit": 10,
                "includes[]": "cover_art"
            }
        )
        
        if response.status_code != 200:
            return {"results": []}
            
        data = response.json()
        results = []
        
        for item in data['data']:
            attr = item['attributes']
            title = attr['title'].get('en') or next(iter(attr['title'].values()), "Unknown")
            
            cover_rel = next((r for r in item['relationships'] if r['type'] == 'cover_art'), None)
            cover_url = None
            if cover_rel and cover_rel.get('attributes'):
                 filename = cover_rel['attributes']['fileName']
                 cover_url = f"https://uploads.mangadex.org/covers/{item['id']}/{filename}.256.jpg"
            
            results.append({
                "id": item['id'],
                "title": title,
                "cover_url": cover_url,
                "year": attr.get('year'),
                "status": attr.get('status')
            })
            
        return {"results": results}

@router.get("/{manga_id}")
async def get_manga_details(manga_id: str):
    async with httpx.AsyncClient(headers={"User-Agent": "NakamaNetwork/1.0"}) as client:
        manga_resp = await client.get(f"{MANGADEX_API_URL}/manga/{manga_id}?includes[]=cover_art")
        if manga_resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Manga not found")
            
        manga_data = manga_resp.json()['data']
        attr = manga_data['attributes']
        
        cover_rel = next((r for r in manga_data['relationships'] if r['type'] == 'cover_art'), None)
        cover_url = ""
        if cover_rel and cover_rel.get('attributes'):
             filename = cover_rel['attributes']['fileName']
             cover_url = f"https://uploads.mangadex.org/covers/{manga_id}/{filename}"
        
        manga_info = {
            "id": manga_data['id'],
            "title": attr['title'].get('en') or next(iter(attr['title'].values()), "Unknown"),
            "description": attr['description'].get('en', ''),
            "cover_url": cover_url,
            "author": "",
            "status": attr['status'],
            "genres": [t['attributes']['name']['en'] for t in attr['tags']]
        }
        
        feed_resp = await client.get(
            f"{MANGADEX_API_URL}/manga/{manga_id}/feed",
            params={
                "translatedLanguage[]": "en",
                "order[chapter]": "desc",
                "limit": 100
            }
        )
        
        chapters = []
        if feed_resp.status_code == 200:
            for ch in feed_resp.json()['data']:
                chapters.append({
                    "id": ch['id'],
                    "chapter_number": ch['attributes']['chapter'],
                    "title": ch['attributes']['title'] or f"Chapter {ch['attributes']['chapter']}",
                    "published_at": ch['attributes']['publishAt']
                })
                
        return {"manga": manga_info, "chapters": chapters}

@router.get("/chapter/{chapter_id}/pages")
async def get_chapter_pages(chapter_id: str):
    async with httpx.AsyncClient(headers={"User-Agent": "NakamaNetwork/1.0"}) as client:
        resp = await client.get(f"{MANGADEX_API_URL}/at-home/server/{chapter_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch pages")
            
        data = resp.json()
        base_url = data['baseUrl']
        hash = data['chapter']['hash']
        filenames = data['chapter']['data']
        
        pages = [f"{base_url}/data/{hash}/{f}" for f in filenames]
        
        return {"pages": pages}

@router.post("/download/{chapter_id}")
async def download_chapter(chapter_id: str):
    return {"status": "queued", "message": "Download started", "chapter_id": chapter_id}
