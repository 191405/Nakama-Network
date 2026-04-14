import logging
import json
import re
from typing import Optional, Dict, Any, List

from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    
    def __init__(self):
        self._configured = False
        self._client = None
        self._model_id = 'gemini-2.5-flash-lite'
    
    def _ensure_configured(self):
        if not self._configured and settings.gemini_api_key:
            # The new google-genai SDK uses client instantiation instead of global configure
            self._client = genai.Client(api_key=settings.gemini_api_key)
            self._configured = True
    
    async def _generate(
        self, 
        prompt: str, 
        temperature: float = 0.9,
        max_tokens: int = 512
    ) -> Optional[str]:
        try:
            self._ensure_configured()
            
            if not self._client:
                logger.warning("Gemini model not configured")
                return None
            
            # Using the new google-genai syntax
            response = self._client.models.generate_content(
                model=self._model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
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
    
    async def generate_content(self, prompt: str) -> Optional[Dict]:
        """Generic content generation that returns parsed JSON."""
        response = await self._generate(prompt, max_tokens=1024)
        if response:
            result = self._parse_json(response)
            if result:
                return result
        return None

    # ─── AI Story Writer Methods ──────────────────────────────────────────────

    async def generate_chapter(
        self,
        novel_title: str,
        genre: str,
        tone: str,
        world_rules: str,
        lore_entries: List[Dict],
        recent_chapters: List[Dict],
        chapter_number: int,
        user_prompt: str,
    ) -> Optional[str]:
        """Generate a new chapter using the Lorebook RAG architecture.
        
        This is the core of the Infinite Memory system:
        1. World rules give the AI immutable constraints.
        2. Lore entries (from the database) give it perfect recall of every
           character, plot event, and world detail ever established.
        3. Recent chapter summaries provide immediate narrative flow.
        4. The user prompt directs where the story goes next.
        """
        # Build the lorebook context block
        lore_block = ""
        if lore_entries:
            lore_by_cat = {}
            for entry in lore_entries:
                cat = entry.get("category", "general")
                if cat not in lore_by_cat:
                    lore_by_cat[cat] = []
                lore_by_cat[cat].append(f"  • {entry['key']}: {entry['value']}")
            for cat, items in lore_by_cat.items():
                lore_block += f"\n[{cat.upper()}]\n" + "\n".join(items) + "\n"

        # Build recent chapter context
        recent_block = ""
        if recent_chapters:
            for ch in recent_chapters[-2:]:  # Last 2 chapters only
                recent_block += f"\n--- Chapter {ch['chapter_number']}: {ch.get('title', 'Untitled')} ---\n"
                # Use summary if available, otherwise truncate content
                text = ch.get("summary") or (ch.get("content", "")[:2000] + "...")
                recent_block += text + "\n"

        prompt = f"""You are a world-class fiction author writing a serialized web novel.

NOVEL: "{novel_title}"
GENRE: {genre}
TONE: {tone}
CHAPTER: {chapter_number}

═══ WORLD RULES (NEVER VIOLATE THESE) ═══
{world_rules or "No specific rules established yet. Build the world naturally."}

═══ LOREBOOK (ESTABLISHED FACTS — maintain perfect consistency) ═══
{lore_block or "No lore established yet — this is a fresh story."}

═══ RECENT CHAPTERS (for narrative flow) ═══
{recent_block or "This is the first chapter."}

═══ AUTHOR DIRECTION ═══
{user_prompt}

═══ INSTRUCTIONS ═══
Write Chapter {chapter_number} of this novel. Requirements:
- Write 1500-2500 words of compelling, publication-quality prose.
- Never contradict the Lorebook facts above.
- Maintain consistent character voices and personalities.
- End on a hook that makes readers desperate for the next chapter.
- Use rich sensory details and varied sentence structure.
- Do NOT include any meta-commentary or author notes.
- Start directly with the chapter content.
- Give the chapter a compelling title on the first line formatted as: # Chapter {chapter_number}: [Title]

Begin writing now:"""

        response = await self._generate(prompt, temperature=0.85, max_tokens=8192)
        return response

    async def extract_lore(self, chapter_content: str, chapter_number: int) -> Optional[List[Dict]]:
        """The Lore Extraction Chain — reads a completed chapter and extracts
        discrete memory fragments for the Lorebook database.
        
        This is the 'secret sauce' that enables infinite memory. After every
        chapter is written/approved, this runs silently to capture everything
        important that happened."""
        
        prompt = f"""You are a meticulous story analyst. Read Chapter {chapter_number} below and extract ALL important facts.

CHAPTER CONTENT:
{chapter_content[:8000]}

Extract every important detail into structured entries. For each entry provide:
- category: one of "character", "plot", "world", "timeline", "secret", "relationship"
- key: a short identifier (e.g. character name, place name, event name)
- value: a detailed description of the fact (2-3 sentences)
- importance: 1-10 scale (10 = critical to the story, 1 = minor detail)

Return ONLY valid JSON in this format:
{{"lore": [
  {{"category": "character", "key": "Akira Tanaka", "value": "A 17-year-old prodigy swordsman. Lost his right eye in the battle of Moonfall. Sworn to avenge his master.", "importance": 9}},
  {{"category": "world", "key": "The Void Gate", "value": "A dimensional rift above the capital city. Opens every full moon and releases shadow creatures.", "importance": 8}}
]}}

Be thorough — capture every new character, location, power, relationship change, secret revealed, and timeline progression. Miss nothing."""

        response = await self._generate(prompt, temperature=0.3, max_tokens=4096)
        if response:
            result = self._parse_json(response)
            if result and "lore" in result:
                return result["lore"]
        return []

    async def summarize_chapter(self, chapter_content: str, chapter_number: int) -> Optional[str]:
        """Generate a compressed summary of a chapter for the rolling context window."""
        
        prompt = f"""Summarize Chapter {chapter_number} in exactly 3-5 sentences. Cover:
1. Key events that happened
2. Character decisions and emotional states
3. Any cliffhangers or unresolved tensions

Chapter content:
{chapter_content[:8000]}

Write only the summary, no preamble:"""

        response = await self._generate(prompt, temperature=0.3, max_tokens=500)
        return response

    async def expand_text(self, text: str, instruction: str) -> Optional[str]:
        """Expand or rewrite a selected passage based on user instruction."""
        prompt = f"""You are a skilled fiction editor. The author has selected the following passage and wants you to modify it.

SELECTED TEXT:
{text}

INSTRUCTION: {instruction}

Rewrite the passage following the instruction. Return ONLY the rewritten text, nothing else:"""

        response = await self._generate(prompt, temperature=0.8, max_tokens=4096)
        return response


gemini_service = GeminiService()
