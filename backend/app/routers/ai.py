
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.services.gemini import gemini_service

router = APIRouter()

class OracleRequest(BaseModel):
    question: str
    conversation: Optional[List[dict]] = None

class OracleResponse(BaseModel):
    response: str

class MoodRequest(BaseModel):
    mood: str

class MoodRecommendation(BaseModel):
    title: str
    reason: str
    genre: str

class MoodResponse(BaseModel):
    recommendations: List[MoodRecommendation]

class QuoteRequest(BaseModel):
    theme: str = "motivation"

class QuoteResponse(BaseModel):
    quote: str
    attribution: str

class TriviaRequest(BaseModel):
    difficulty: str = "medium"

class TriviaResponse(BaseModel):
    question: str
    options: List[str]
    correct: int
    explanation: str

class ProphecyResponse(BaseModel):
    prophecy: str

@router.post("/oracle", response_model=OracleResponse)
async def ask_oracle(request: OracleRequest):
    response = await gemini_service.ask_oracle(
        question=request.question,
        conversation=request.conversation
    )
    
    return {"response": response}

@router.post("/mood", response_model=MoodResponse)
async def get_mood_recommendations(request: MoodRequest):
    result = await gemini_service.get_mood_recommendations(request.mood)
    
    return result

@router.post("/quote", response_model=QuoteResponse)
async def generate_quote(request: QuoteRequest):
    result = await gemini_service.generate_quote(request.theme)
    
    return result

@router.get("/prophecy", response_model=ProphecyResponse)
async def get_daily_prophecy(
    name: str = Query("Shinobi", description="User's name for personalization")
):
    result = await gemini_service.generate_prophecy(name)
    
    return {"prophecy": result}

@router.post("/trivia", response_model=TriviaResponse)
async def generate_trivia(request: TriviaRequest):
    result = await gemini_service.generate_trivia(request.difficulty)
    
    return result

class RecommendationRequest(BaseModel):
    watchlist: List[str]
    preferences: Optional[str] = None

class SummaryRequest(BaseModel):
    anime_title: str
    spoiler_free: bool = True

class CharacterAnalysisRequest(BaseModel):
    character_name: str
    anime_title: str

@router.post("/recommend")
async def get_ai_recommendations(request: RecommendationRequest):
    prompt = f"""Based on this user's watchlist: {', '.join(request.watchlist[:10])}.
    {f'User preferences: {request.preferences}' if request.preferences else ''}
    
    Recommend 5 anime they would love. Return ONLY valid JSON:
    {{"recommendations": [{{"title": "Anime Name", "reason": "Why they'd like it", "match_score": 95}}]}}"""
    
    result = await gemini_service.generate_content(prompt)
    return result

@router.post("/summary")
async def generate_anime_summary(request: SummaryRequest):
    spoiler_note = "NO SPOILERS - only describe the premise and setup" if request.spoiler_free else "include major plot points"
    prompt = f"""Write a compelling 2-3 sentence summary of the anime "{request.anime_title}". 
    {spoiler_note}.
    Return ONLY valid JSON: {{"summary": "...", "genres": ["genre1", "genre2"], "mood": "exciting/emotional/funny/etc"}}"""
    
    result = await gemini_service.generate_content(prompt)
    return result

@router.post("/character-analysis")
async def analyze_character(request: CharacterAnalysisRequest):
    prompt = f"""Analyze the character "{request.character_name}" from "{request.anime_title}".
    Include their personality, role in the story, and what makes them memorable.
    Return ONLY valid JSON: {{"analysis": "...", "personality_traits": ["trait1", "trait2"], "memorable_quote": "..."}}"""
    
    result = await gemini_service.generate_content(prompt)
    return result

@router.get("/daily-fact")
async def get_daily_anime_fact():
    prompt = """Share one interesting, lesser-known fact about anime or manga.
    Return ONLY valid JSON: {"fact": "...", "category": "history/production/culture/trivia"}"""
    
    result = await gemini_service.generate_content(prompt)
    return result
