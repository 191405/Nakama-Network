
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

export const generateAIResponse = async (prompt, context = '') => {
    try {
        if (!GEMINI_API_KEY) {
            console.warn('Gemini API key not configured');
            return null;
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: context ? `${context}\n\n${prompt}` : prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 512,
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return null;
        }

        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        }

        return null;
    } catch (error) {
        console.error('Gemini Error:', error);
        return null;
    }
};

export const generateDailyProphecy = async (userName) => {
    const prompt = `Generate a cryptic, mysterious anime-style fortune/prophecy for a user named ${userName}. 
  Make it sound like it's from an ancient sage or oracle. Keep it under 40 words. 
  Use mystical and anime-inspired language. Include elements of fate, destiny, and hidden powers.
  Do not use quotation marks in your response.`;

    return await generateAIResponse(prompt);
};

export const generateTriviaQuestion = async (difficulty = 'medium') => {
    const prompt = `Generate a challenging anime trivia question with 4 multiple choice answers.
  Difficulty: ${difficulty}
  
  Return ONLY valid JSON in this EXACT format, nothing else before or after:
  {"question": "The question here", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why this is correct", "hint": "A subtle clue"}
  
  The "correct" field should be the index (0-3) of the correct answer.
  Focus on popular anime from various genres. Make questions specific and interesting. Include a helpful hint.`;

    const response = await generateAIResponse(prompt);

    if (response) {
        try {
            
            let cleanResponse = response
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/gi, '')
                .trim();

            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                
                let jsonStr = jsonMatch[0]
                    .replace(/,\s*}/g, '}')  
                    .replace(/,\s*]/g, ']')  
                    .replace(/[\r\n]+/g, ' '); 

                const parsed = JSON.parse(jsonStr);

                if (parsed.question && Array.isArray(parsed.options) &&
                    parsed.options.length === 4 && typeof parsed.correct === 'number') {
                    return parsed;
                }
            }
        } catch (e) {
            console.log('Trivia parse failed, using fallback:', e.message);
        }
    }

    return getRandomFallbackTrivia();
};

const FALLBACK_TRIVIA = [
    { question: "Which anime features a character named Goku?", options: ["Dragon Ball", "Naruto", "One Piece", "Bleach"], correct: 0, explanation: "Goku is the main protagonist of Dragon Ball." },
    { question: "Who is the captain of the Straw Hat Pirates?", options: ["Zoro", "Sanji", "Luffy", "Nami"], correct: 2, explanation: "Monkey D. Luffy is the captain of the Straw Hat Pirates." },
    { question: "What is Gojo Satoru's domain expansion called?", options: ["Malevolent Shrine", "Infinite Void", "Chimera Shadow Garden", "Coffin of the Iron Mountain"], correct: 1, explanation: "Infinite Void is Gojo Satoru's domain expansion in Jujutsu Kaisen." },
];

const getRandomFallbackTrivia = () => FALLBACK_TRIVIA[Math.floor(Math.random() * FALLBACK_TRIVIA.length)];

export const askTheOracle = async (userMessage, conversationHistory = []) => {
    const context = `You are "The Oracle", an all-knowing AI entity that lives in the Nakama Network anime app. 
  You are wise, mysterious, and deeply knowledgeable about all anime. You speak with wisdom and occasional mystical references.
  Your purpose is to help users discover anime based on their mood, preferences, and questions.
  Keep responses under 150 words and be helpful yet enigmatic.
  
  Previous conversation:
  ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

    return await generateAIResponse(`User: ${userMessage}`, context);
};

export const getMoodRecommendations = async (mood) => {
    const prompt = `Based on the mood "${mood}", recommend 5 anime that would be perfect to watch.
  
  Return in this EXACT JSON format only:
  {"recommendations": [
    {"title": "Anime Name", "reason": "Short reason why it fits the mood", "genre": "Main genre"},
    ...
  ]}
  
  Make recommendations diverse and include both popular and hidden gems.`;

    const response = await generateAIResponse(prompt);

    if (response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('Failed to parse mood recommendations:', e);
        }
    }

    return { recommendations: [] };
};

export const getCharacterOfTheDay = async () => {
    const prompt = `Pick a random iconic anime character and provide their details.
  
  Return in this EXACT JSON format only:
  {"name": "Character Name", "anime": "Anime Title", "trait": "Most iconic personality trait", "quote": "Famous quote from the character", "funFact": "An interesting fact about them"}
  
  Choose from well-known anime characters that fans would recognize.`;

    const response = await generateAIResponse(prompt);

    if (response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('Failed to parse character:', e);
        }
    }

    return { name: "Naruto Uzumaki", anime: "Naruto", trait: "Never gives up", quote: "Believe it!", funFact: "His favorite food is Ichiraku ramen." };
};

export const generateAnimeQuote = async (theme = 'motivation') => {
    const prompt = `Generate an inspirational anime-style quote about "${theme}".
  
  Return in this EXACT JSON format only:
  {"quote": "The inspirational quote", "attribution": "Character Name - Anime Title"}
  
  Make it sound authentic to anime but it can be original. Keep quote under 30 words.`;

    const response = await generateAIResponse(prompt);

    if (response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('Failed to parse quote:', e);
        }
    }

    return { quote: "The moment you give up is the moment you let someone else win.", attribution: "Koro-sensei - Assassination Classroom" };
};

export const searchAnimeAI = async (query) => {
    const prompt = `The user is searching for anime with query: "${query}"
  
  Return 6 anime recommendations that match this search in this EXACT JSON format:
  {"results": [
    {"id": 1, "title": "Anime Name", "description": "One sentence description", "genre": "Main genre", "year": 2020, "rating": "8.5"},
    ...
  ]}
  
  Include both exact matches and related suggestions.`;

    const response = await generateAIResponse(prompt);

    if (response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('Failed to parse search:', e);
        }
    }

    return { results: [] };
};
