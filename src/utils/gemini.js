const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateAIResponse = async (prompt, context = '') => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: context ? `${context}\n\n${prompt}` : prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No response from AI');
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'The AI oracle is temporarily unavailable. Please try again.';
  }
};

// Daily Prophecy Generator
export const generateDailyProphecy = async (userName) => {
  const prompt = `Generate a cryptic, mysterious anime-style fortune/prophecy for a user named ${userName}. 
  Make it sound like it's from an ancient sage or oracle. Keep it under 50 words. 
  Use mystical and anime-inspired language. Include elements of fate, destiny, and hidden powers.`;
  
  return await generateAIResponse(prompt);
};

// AI Sensei - Cultural Context Explainer
export const explainAnimeContext = async (sceneName, culturalElement) => {
  const prompt = `As an anime cultural expert (AI Sensei), explain the following cultural element or trope in the context of "${sceneName}":
  
  Cultural Element: ${culturalElement}
  
  Provide a brief, educational explanation (100-150 words) that helps viewers understand:
  1. What this element means in Japanese culture
  2. Why it appears in anime
  3. Any relevant historical or social context
  
  Be informative but conversational, like a knowledgeable friend.`;
  
  return await generateAIResponse(prompt);
};

// Ghost Mode - Character Commentary
export const generateGhostModeCommentary = async (characterName, sceneDescription) => {
  const prompt = `You are ${characterName} from anime. Watch this scene and provide live commentary AS the character:
  
  Scene: ${sceneDescription}
  
  Respond in first person, staying true to ${characterName}'s personality, speech patterns, and worldview. 
  Keep it under 100 words. Be entertaining and character-accurate. Use catchphrases if the character has them.`;
  
  return await generateAIResponse(prompt);
};

// Clan Name Generator
export const generateClanName = async (userVibe, interests) => {
  const prompt = `Generate a unique anime-style clan name and motto based on:
  
  User Vibe: ${userVibe}
  Interests: ${interests}
  
  Return ONLY in this exact format:
  CLAN: [Clan Name]
  MOTTO: [Clan Motto]
  
  The clan name should be 2-3 words, powerful, and anime-inspired (like "Crimson Moon Sect" or "Thunder God Clan").
  The motto should be a short, inspiring phrase (like "Through shadows, we rise" or "Honor before glory").`;
  
  return await generateAIResponse(prompt);
};

// The Oracle - Anime Recommendation Chat
export const askTheOracle = async (userMessage, conversationHistory = []) => {
  const context = `You are "The Oracle", an all-knowing AI entity that lives in the NK Network anime streaming platform. 
  You are wise, mysterious, and deeply knowledgeable about all anime. You speak with wisdom and occasional mystical references.
  Your purpose is to help users discover anime based on their mood, preferences, and questions.
  
  Previous conversation:
  ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
  
  const prompt = `User: ${userMessage}
  
  Respond as The Oracle. Be helpful, mystical, and knowledgeable. If recommending anime, explain why it fits their request. 
  Keep responses under 200 words.`;
  
  return await generateAIResponse(prompt, context);
};

// Trivia Question Generator
export const generateTriviaQuestion = async (difficulty = 'medium') => {
  const prompt = `Generate a challenging anime trivia question with 4 multiple choice answers.
  Difficulty: ${difficulty}
  
  Return in this EXACT format:
  QUESTION: [The question]
  A: [Answer option A]
  B: [Answer option B]
  C: [Answer option C]
  D: [Answer option D]
  CORRECT: [The correct letter: A, B, C, or D]
  EXPLANATION: [Brief explanation of why this is the answer]
  
  Focus on popular anime from various genres. Make questions specific and interesting, not too easy.`;
  
  const response = await generateAIResponse(prompt);
  return parseTriviaResponse(response);
};

// Parse Trivia Response
const parseTriviaResponse = (response) => {
  const lines = response.split('\n').filter(line => line.trim());
  const trivia = {
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correct: '',
    explanation: ''
  };
  
  lines.forEach(line => {
    if (line.startsWith('QUESTION:')) {
      trivia.question = line.replace('QUESTION:', '').trim();
    } else if (line.startsWith('A:')) {
      trivia.options.A = line.replace('A:', '').trim();
    } else if (line.startsWith('B:')) {
      trivia.options.B = line.replace('B:', '').trim();
    } else if (line.startsWith('C:')) {
      trivia.options.C = line.replace('C:', '').trim();
    } else if (line.startsWith('D:')) {
      trivia.options.D = line.replace('D:', '').trim();
    } else if (line.startsWith('CORRECT:')) {
      trivia.correct = line.replace('CORRECT:', '').trim();
    } else if (line.startsWith('EXPLANATION:')) {
      trivia.explanation = line.replace('EXPLANATION:', '').trim();
    }
  });
  
  return trivia;
};

// Parse Clan Response
export const parseClanResponse = (response) => {
  const lines = response.split('\n').filter(line => line.trim());
  let clanName = '';
  let motto = '';
  
  lines.forEach(line => {
    if (line.startsWith('CLAN:')) {
      clanName = line.replace('CLAN:', '').trim();
    } else if (line.startsWith('MOTTO:')) {
      motto = line.replace('MOTTO:', '').trim();
    }
  });
  
  return { clanName, motto };
};

// Anime News Summarizer
export const summarizeAnimeNews = async (newsTitle, newsContent) => {
  const prompt = `Summarize this anime news article in 2-3 exciting sentences:
  
  Title: ${newsTitle}
  Content: ${newsContent.substring(0, 500)}
  
  Make it engaging and highlight the most important information.`;
  
  return await generateAIResponse(prompt);
};

// Anime Recommendation Based on Mood
export const recommendByMood = async (mood, genres = []) => {
  const genreText = genres.length > 0 ? `Preferred genres: ${genres.join(', ')}` : '';
  
  const prompt = `Recommend 3 anime series perfect for someone feeling "${mood}". ${genreText}
  
  For each recommendation, provide:
  - Title
  - Why it fits the mood (1-2 sentences)
  
  Format as:
  1. [Title] - [Why it fits]
  2. [Title] - [Why it fits]
  3. [Title] - [Why it fits]`;
  
  return await generateAIResponse(prompt);
};
