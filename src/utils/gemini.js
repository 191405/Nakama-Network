const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

export const generateAIResponse = async (prompt, context = '') => {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured. Add VITE_GOOGLE_GEMINI_API_KEY to .env.local');
      return 'The Oracle encounters a cosmic disturbance... The connection to the knowledge dimension is unavailable. Please ensure your Gemini API key is configured.';
    }

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

    if (!response.ok) {
      console.error('Gemini API Error Response:', data);
      if (data.error) {
        const errorMessage = data.error.message || 'Unknown error';
        console.error(`Gemini API Error: ${errorMessage}`);

        if (errorMessage.includes('401') || errorMessage.includes('API key')) {
          return 'The Oracle\'s connection falters... Your API key appears to be invalid. Please check your VITE_GOOGLE_GEMINI_API_KEY configuration.';
        }
        if (errorMessage.includes('429')) {
          return 'The Oracle is overloaded with requests... Please wait a moment and try again.';
        }
        if (errorMessage.includes('503')) {
          return 'The Oracle\'s dimension is experiencing technical difficulties... Google Gemini API is temporarily unavailable.';
        }
      }
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('No response from AI');
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return `The Oracle speaks: "${error.message}". Please check your API configuration and internet connection.`;
  }
};

export const generateDailyProphecy = async (userName) => {
  const prompt = `Generate a cryptic, mysterious anime-style fortune/prophecy for a user named ${userName}. 
  Make it sound like it's from an ancient sage or oracle. Keep it under 50 words. 
  Use mystical and anime-inspired language. Include elements of fate, destiny, and hidden powers.`;

  return await generateAIResponse(prompt);
};

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

export const generateGhostModeCommentary = async (characterName, sceneDescription) => {
  const prompt = `You are ${characterName} from anime. Watch this scene and provide live commentary AS the character:
  
  Scene: ${sceneDescription}
  
  Respond in first person, staying true to ${characterName}'s personality, speech patterns, and worldview. 
  Keep it under 100 words. Be entertaining and character-accurate. Use catchphrases if the character has them.`;

  return await generateAIResponse(prompt);
};

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

export const askTheOracle = async (userMessage, conversationHistory = []) => {
  const context = `You are "The Oracle", an all-knowing AI entity that lives in the Nakama Network anime streaming platform. 
  You are wise, mysterious, and deeply knowledgeable about all anime. You speak with wisdom and occasional mystical references.
  Your purpose is to help users discover anime based on their mood, preferences, and questions.
  
  Previous conversation:
  ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

  const prompt = `User: ${userMessage}
  
  Respond as The Oracle. Be helpful, mystical, and knowledgeable. If recommending anime, explain why it fits their request. 
  Keep responses under 200 words.`;

  return await generateAIResponse(prompt, context);
};

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

const parseTriviaResponse = (response) => {
  try {
    const lines = response.split('\n').filter(line => line.trim());
    const trivia = {
      question: '',
      options: [],
      correct: 0,
      explanation: ''
    };

    const optionsMap = { A: '', B: '', C: '', D: '' };
    let correctLetter = 'A';

    lines.forEach(line => {
      if (line.startsWith('QUESTION:')) {
        trivia.question = line.replace('QUESTION:', '').trim();
      } else if (line.startsWith('A:')) {
        optionsMap.A = line.replace('A:', '').trim();
      } else if (line.startsWith('B:')) {
        optionsMap.B = line.replace('B:', '').trim();
      } else if (line.startsWith('C:')) {
        optionsMap.C = line.replace('C:', '').trim();
      } else if (line.startsWith('D:')) {
        optionsMap.D = line.replace('D:', '').trim();
      } else if (line.startsWith('CORRECT:')) {
        correctLetter = line.replace('CORRECT:', '').trim().toUpperCase();
      } else if (line.startsWith('EXPLANATION:')) {
        trivia.explanation = line.replace('EXPLANATION:', '').trim();
      }
    });

    trivia.options = [optionsMap.A, optionsMap.B, optionsMap.C, optionsMap.D].filter(o => o);

    const letterIndex = { A: 0, B: 1, C: 2, D: 3 };
    trivia.correct = letterIndex[correctLetter] ?? 0;

    if (!trivia.question || trivia.options.length < 2) {
      throw new Error('Invalid trivia format');
    }

    return trivia;
  } catch (e) {
    console.error('Trivia parsing failed, using fallback:', e);
    return getRandomFallbackTrivia();
  }
};

const FALLBACK_TRIVIA = [
  { question: "Which anime features a character named Goku?", options: ["Dragon Ball", "Naruto", "One Piece", "Bleach"], correct: 0, explanation: "Goku is the main protagonist of Dragon Ball." },
  { question: "Who is the captain of the Straw Hat Pirates?", options: ["Zoro", "Sanji", "Luffy", "Nami"], correct: 2, explanation: "Monkey D. Luffy is the captain of the Straw Hat Pirates in One Piece." },
  { question: "Which village is Naruto from?", options: ["Sand Village", "Sound Village", "Hidden Leaf Village", "Mist Village"], correct: 2, explanation: "Naruto is from Konohagakure, the Hidden Leaf Village." },
  { question: "What is the name of Light Yagami's Shinigami in Death Note?", options: ["Rem", "Ryuk", "Mello", "Near"], correct: 1, explanation: "Ryuk is the Shinigami who dropped the Death Note that Light found." },
  { question: "Which anime features Titans attacking humanity?", options: ["Tokyo Ghoul", "Demon Slayer", "Attack on Titan", "Parasyte"], correct: 2, explanation: "Attack on Titan (Shingeki no Kyojin) features Titans attacking humans." },
  { question: "Who is the strongest hero in One Punch Man?", options: ["Genos", "Saitama", "King", "Blast"], correct: 1, explanation: "Saitama can defeat any opponent with a single punch, hence the title One Punch Man." },
  { question: "What is the name of the demon-slaying corps in Demon Slayer?", options: ["Soul Society", "Demon Slayer Corps", "Survey Corps", "Hashira"], correct: 1, explanation: "The Demon Slayer Corps protects humanity from demons in Demon Slayer: Kimetsu no Yaiba." },
  { question: "Which anime is known for the phrase 'Believe it!'?", options: ["Dragon Ball Z", "Bleach", "Naruto", "My Hero Academia"], correct: 2, explanation: "Naruto's English dub is famous for the catchphrase 'Believe it!' (Dattebayo in Japanese)." },
  { question: "What is Gojo Satoru's domain expansion called?", options: ["Malevolent Shrine", "Infinite Void", "Chimera Shadow Garden", "Coffin of the Iron Mountain"], correct: 1, explanation: "Infinite Void (Mugen) is Gojo Satoru's domain expansion in Jujutsu Kaisen." },
  { question: "Who said 'Plus Ultra!'?", options: ["Goku", "All Might", "Naruto", "Ichigo"], correct: 1, explanation: "Plus Ultra is All Might's catchphrase and the motto of UA High School in My Hero Academia." }
];

const getRandomFallbackTrivia = () => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_TRIVIA.length);
  return { ...FALLBACK_TRIVIA[randomIndex] };
};

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

export const summarizeAnimeNews = async (newsTitle, newsContent) => {
  const prompt = `Summarize this anime news article in 2-3 exciting sentences:
  
  Title: ${newsTitle}
  Content: ${newsContent.substring(0, 500)}
  
  Make it engaging and highlight the most important information.`;

  return await generateAIResponse(prompt);
};

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
