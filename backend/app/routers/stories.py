"""
Stories Router — AI-powered Infinite Memory Story Writer
Provides CRUD for novels, chapters, and the Lorebook, plus AI generation endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.sql import WebNovel, StoryChapter, StoryLore
from app.services.gemini import gemini_service

router = APIRouter()


# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class NovelCreate(BaseModel):
    title: str
    synopsis: Optional[str] = ""
    genre: Optional[str] = "Fantasy"
    tone: Optional[str] = "dramatic"
    world_rules: Optional[str] = ""
    user_id: str

class NovelOut(BaseModel):
    id: int
    title: str
    synopsis: Optional[str]
    genre: Optional[str]
    tone: Optional[str]
    status: str
    chapter_count: int
    total_words: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChapterOut(BaseModel):
    id: int
    chapter_number: int
    title: Optional[str]
    content: str
    word_count: int
    summary: Optional[str]
    ai_generated: int
    created_at: datetime

    class Config:
        from_attributes = True

class LoreOut(BaseModel):
    id: int
    source_chapter: int
    category: str
    key: str
    value: str
    importance: int
    active: int

    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    user_prompt: str
    user_id: str

class ExpandRequest(BaseModel):
    text: str
    instruction: str

class ChapterSave(BaseModel):
    title: Optional[str] = ""
    content: str
    user_id: str

class LoreUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None
    importance: Optional[int] = None
    active: Optional[int] = None

class WorldRulesUpdate(BaseModel):
    world_rules: str
    user_id: str


# ─── Novel CRUD ───────────────────────────────────────────────────────────────

@router.post("/novels", response_model=NovelOut)
def create_novel(data: NovelCreate, db: Session = Depends(get_db)):
    novel = WebNovel(
        user_id=data.user_id,
        title=data.title,
        synopsis=data.synopsis,
        genre=data.genre,
        tone=data.tone,
        world_rules=data.world_rules,
    )
    db.add(novel)
    db.commit()
    db.refresh(novel)
    return novel


@router.get("/novels", response_model=List[NovelOut])
def list_novels(user_id: str = Query(...), db: Session = Depends(get_db)):
    return db.query(WebNovel).filter(WebNovel.user_id == user_id).order_by(WebNovel.updated_at.desc()).all()


@router.get("/novels/{novel_id}", response_model=NovelOut)
def get_novel(novel_id: int, db: Session = Depends(get_db)):
    novel = db.query(WebNovel).filter(WebNovel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    return novel


@router.put("/novels/{novel_id}/world-rules")
def update_world_rules(novel_id: int, data: WorldRulesUpdate, db: Session = Depends(get_db)):
    novel = db.query(WebNovel).filter(WebNovel.id == novel_id, WebNovel.user_id == data.user_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    novel.world_rules = data.world_rules
    db.commit()
    return {"status": "updated"}


@router.delete("/novels/{novel_id}")
def delete_novel(novel_id: int, user_id: str = Query(...), db: Session = Depends(get_db)):
    novel = db.query(WebNovel).filter(WebNovel.id == novel_id, WebNovel.user_id == user_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    db.delete(novel)
    db.commit()
    return {"status": "deleted"}


# ─── Chapter CRUD ─────────────────────────────────────────────────────────────

@router.get("/novels/{novel_id}/chapters", response_model=List[ChapterOut])
def list_chapters(novel_id: int, db: Session = Depends(get_db)):
    return (
        db.query(StoryChapter)
        .filter(StoryChapter.novel_id == novel_id)
        .order_by(StoryChapter.chapter_number.asc())
        .all()
    )


@router.get("/novels/{novel_id}/chapters/{chapter_num}", response_model=ChapterOut)
def get_chapter(novel_id: int, chapter_num: int, db: Session = Depends(get_db)):
    chapter = (
        db.query(StoryChapter)
        .filter(StoryChapter.novel_id == novel_id, StoryChapter.chapter_number == chapter_num)
        .first()
    )
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.post("/novels/{novel_id}/chapters")
def save_chapter(novel_id: int, data: ChapterSave, db: Session = Depends(get_db)):
    """Manually save a user-written chapter."""
    novel = db.query(WebNovel).filter(WebNovel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")

    next_num = novel.chapter_count + 1
    word_count = len(data.content.split())

    chapter = StoryChapter(
        novel_id=novel_id,
        chapter_number=next_num,
        title=data.title or f"Chapter {next_num}",
        content=data.content,
        word_count=word_count,
        ai_generated=0,
    )
    db.add(chapter)
    novel.chapter_count = next_num
    novel.total_words += word_count
    db.commit()
    db.refresh(chapter)
    return {"chapter_number": next_num, "id": chapter.id, "word_count": word_count}


# ─── Lorebook CRUD ────────────────────────────────────────────────────────────

@router.get("/novels/{novel_id}/lore", response_model=List[LoreOut])
def list_lore(novel_id: int, category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(StoryLore).filter(StoryLore.novel_id == novel_id, StoryLore.active == 1)
    if category:
        q = q.filter(StoryLore.category == category)
    return q.order_by(StoryLore.importance.desc()).all()


@router.put("/novels/{novel_id}/lore/{lore_id}")
def update_lore(novel_id: int, lore_id: int, data: LoreUpdate, db: Session = Depends(get_db)):
    entry = db.query(StoryLore).filter(StoryLore.id == lore_id, StoryLore.novel_id == novel_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Lore entry not found")
    if data.key is not None:
        entry.key = data.key
    if data.value is not None:
        entry.value = data.value
    if data.importance is not None:
        entry.importance = data.importance
    if data.active is not None:
        entry.active = data.active
    db.commit()
    return {"status": "updated"}


@router.post("/novels/{novel_id}/lore")
def add_manual_lore(
    novel_id: int,
    category: str = Query(...),
    key: str = Query(...),
    value: str = Query(...),
    importance: int = Query(5),
    db: Session = Depends(get_db),
):
    """Allow users to manually add lore entries to fine-tune the AI's memory."""
    entry = StoryLore(
        novel_id=novel_id,
        source_chapter=0,  # 0 = manually added
        category=category,
        key=key,
        value=value,
        importance=importance,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "status": "created"}


# ─── AI Generation Endpoints ─────────────────────────────────────────────────

@router.post("/novels/{novel_id}/generate")
async def generate_chapter(
    novel_id: int,
    data: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """The crown jewel: Generate a new chapter using the Infinite Memory pipeline.
    
    Flow:
    1. Load novel metadata + world rules
    2. Gather all active lore entries from the database
    3. Fetch the last 2 chapters (summaries preferred)
    4. Send everything to Gemini for chapter generation
    5. Save the chapter
    6. Schedule background lore extraction for the new chapter
    """
    novel = db.query(WebNovel).filter(WebNovel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")

    # 1. Gather lore
    lore_rows = (
        db.query(StoryLore)
        .filter(StoryLore.novel_id == novel_id, StoryLore.active == 1)
        .order_by(StoryLore.importance.desc())
        .limit(60)  # Top 60 most important lore entries
        .all()
    )
    lore_entries = [{"category": l.category, "key": l.key, "value": l.value} for l in lore_rows]

    # 2. Gather recent chapters
    recent = (
        db.query(StoryChapter)
        .filter(StoryChapter.novel_id == novel_id)
        .order_by(StoryChapter.chapter_number.desc())
        .limit(2)
        .all()
    )
    recent_chapters = [
        {
            "chapter_number": ch.chapter_number,
            "title": ch.title,
            "content": ch.content,
            "summary": ch.summary,
        }
        for ch in reversed(recent)
    ]

    next_chapter = novel.chapter_count + 1

    # 3. Generate!
    content = await gemini_service.generate_chapter(
        novel_title=novel.title,
        genre=novel.genre or "Fantasy",
        tone=novel.tone or "dramatic",
        world_rules=novel.world_rules or "",
        lore_entries=lore_entries,
        recent_chapters=recent_chapters,
        chapter_number=next_chapter,
        user_prompt=data.user_prompt,
    )

    if not content:
        raise HTTPException(status_code=500, detail="AI generation failed. Try again.")

    # 4. Extract title from content if present
    lines = content.strip().split("\n")
    title = f"Chapter {next_chapter}"
    if lines[0].startswith("#"):
        title = lines[0].lstrip("#").strip()
        content_body = "\n".join(lines[1:]).strip()
    else:
        content_body = content.strip()

    word_count = len(content_body.split())

    # 5. Save to DB
    chapter = StoryChapter(
        novel_id=novel_id,
        chapter_number=next_chapter,
        title=title,
        content=content_body,
        word_count=word_count,
        ai_generated=1,
    )
    db.add(chapter)
    novel.chapter_count = next_chapter
    novel.total_words += word_count
    db.commit()
    db.refresh(chapter)

    # 6. Schedule background lore extraction and summarization
    background_tasks.add_task(_extract_and_store_lore, novel_id, chapter.id, next_chapter, content_body)

    return {
        "chapter_number": next_chapter,
        "title": title,
        "content": content_body,
        "word_count": word_count,
        "id": chapter.id,
    }


async def _extract_and_store_lore(novel_id: int, chapter_id: int, chapter_number: int, content: str):
    """Background task: runs after chapter generation to extract and store lore."""
    from app.database import SessionLocal

    # Extract lore
    lore_entries = await gemini_service.extract_lore(content, chapter_number)

    # Summarize chapter
    summary = await gemini_service.summarize_chapter(content, chapter_number)

    db = SessionLocal()
    try:
        # Save lore entries
        if lore_entries:
            for entry in lore_entries:
                lore = StoryLore(
                    novel_id=novel_id,
                    source_chapter=chapter_number,
                    category=entry.get("category", "general"),
                    key=entry.get("key", "Unknown"),
                    value=entry.get("value", ""),
                    importance=entry.get("importance", 5),
                )
                db.add(lore)

        # Save chapter summary
        if summary:
            chapter = db.query(StoryChapter).filter(StoryChapter.id == chapter_id).first()
            if chapter:
                chapter.summary = summary

        db.commit()
    except Exception as e:
        db.rollback()
        import logging
        logging.getLogger(__name__).error(f"Lore extraction failed for chapter {chapter_number}: {e}")
    finally:
        db.close()


@router.post("/novels/{novel_id}/expand")
async def expand_text(novel_id: int, data: ExpandRequest):
    """AI-assisted text expansion/rewrite for the editor."""
    result = await gemini_service.expand_text(data.text, data.instruction)
    if not result:
        raise HTTPException(status_code=500, detail="AI expansion failed")
    return {"result": result}
