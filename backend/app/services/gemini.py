
import logging
import json
import re
from typing import Optional, Dict, Any, List

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    
    def __init__(self):
        self._configured = False
        self._model = None
    
    def _ensure_configured(self):
        if not self._configured and settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self._model = genai.GenerativeModel('gemini-1.5-flash')
            self._configured = True
    
    async def _generate(
        self, 
        prompt: str, 
        temperature: float = 0.9,
        max_tokens: int = 512
    ) -> Optional[str]:
        try:
            self._ensure_configured()
            
            if not self._model:
                logger.warning("Gemini model not configured")
                return None
            
            response = self._model.generate_content(
                prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                }
            )
            
            if response and response.text:
                return response.text
            return None
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return None
    
    def _parse_json(self, text: str) -> Optional[Dict]:
        try:
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group())
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            return None

    async def ask_oracle(
        self, 
        question: str, 
        conversation: List[Dict] = None
    ) -> str:
        
        context = """You are "The Oracle", an all-knowing guide in the Nakama Network app. 
You are wise, mysterious, and deeply knowledgeable about all anime. 
You speak with wisdom and occasional mystical references.
Your purpose is to help users discover anime based on their mood, preferences, and questions.
Keep responses under 150 words and be helpful yet enigmatic."""
        
        conv_text = ""
        if conversation:
            conv_text = "\n\nPrevious conversation:\n"
            for msg in conversation[-6:]:
                conv_text += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        
        prompt = f"{context}{conv_text}\n\nUser: {question}\n\nOracle:"
        
        response = await self._generate(prompt, temperature=0.85)
        return response or "The mists of fate cloud my vision... Ask again, seeker."
    
    async def get_mood_recommendations(self, mood: str) -> Dict:
        
        prompt = f"""Based on the mood "{mood}", recommend 5 anime that would be perfect to watch.

Return in this EXACT JSON format only:
{{"recommendations": [
  {{"title": "Anime Name", "reason": "Short reason why it fits the mood", "genre": "Main genre"}},
  ...
]}}

Make recommendations diverse and include both popular and hidden gems."""
        
        response = await self._generate(prompt)
        
        if response:
            result = self._parse_json(response)
            if result:
                return result
        
        return {"recommendations": []}
    
    async def generate_quote(self, theme: str = "motivation") -> Dict:
        
        prompt = f"""Generate an inspirational anime-style quote about "{theme}".

Return in this EXACT JSON format only:
{{"quote": "The inspirational quote", "attribution": "Character Name - Anime Title"}}

Make it sound authentic to anime but it can be original. Keep quote under 30 words."""
        
        response = await self._generate(prompt)
        
        if response:
            result = self._parse_json(response)
            if result:
                return result
        
        return {
            "quote": "The moment you give up is the moment you let someone else win.",
            "attribution": "Koro-sensei - Assassination Classroom"
        }
    
    async def generate_prophecy(self, user_name: str = "Shinobi") -> str:
        
        prompt = f"""Generate a cryptic, mysterious anime-style fortune/prophecy for a user named {user_name}. 
Make it sound like it's from an ancient sage or oracle. Keep it under 40 words. 
Use mystical and anime-inspired language. Include elements of fate, destiny, and hidden powers.
Do not use quotation marks in your response."""
        
        response = await self._generate(prompt, temperature=0.95)
        return response or "The path to glory is forged in silence. Today, embrace the stillness before the storm."
    
    async def generate_trivia(self, difficulty: str = "medium") -> Dict:
        
        prompt = f"""Generate a challenging anime trivia question with 4 multiple choice answers.
Difficulty: {difficulty}

Return in this EXACT JSON format only, no other text:
{{"question": "The question here", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why this is correct"}}

The "correct" field should be the index (0-3) of the correct answer.
Focus on popular anime from various genres. Make questions specific and interesting."""
        
        response = await self._generate(prompt)
        
        if response:
            result = self._parse_json(response)
            if result and all(k in result for k in ["question", "options", "correct"]):
                return result
        
        return {
            "question": "Which anime features a character named Goku?",
            "options": ["Dragon Ball", "Naruto", "One Piece", "Bleach"],
            "correct": 0,
            "explanation": "Goku is the main protagonist of Dragon Ball."
        }
    
    async def get_character_info(self, character_name: str, anime_name: str) -> Dict:
        
        prompt = f"""Provide interesting information about {character_name} from {anime_name}.

Return in this EXACT JSON format only:
{{"trait": "Most iconic personality trait", "quote": "A famous or fitting quote from the character", "funFact": "An interesting fact about them"}}"""
        
        response = await self._generate(prompt)
        
        if response:
            result = self._parse_json(response)
            if result:
                return result
        
        return {
            "trait": "Determined and never gives up",
            "quote": "I'll never go back on my word!",
            "funFact": "One of the most iconic characters in anime history."
        }

gemini_service = GeminiService()
