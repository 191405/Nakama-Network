const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nakama-network-api.onrender.com';

/**
 * Common fetch wrapper for backend AI endpoints
 */
const fetchAI = async (endpoint, payload = {}, method = 'POST') => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (method === 'POST') {
      options.body = JSON.stringify(payload);
    } else if (Object.keys(payload).length > 0) {
      const queryParams = new URLSearchParams(payload).toString();
      endpoint = `${endpoint}?${queryParams}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    let data;
    try {
      data = await response.json();
    } catch {
      console.warn(`AI Backend JSON parse failed for ${endpoint}`);
      throw new Error(`Server unavailable. Returning local cache...`);
    }

    if (!response.ok) {
      console.error(`AI Backend Error (${endpoint}):`, data);
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`AI Fetch Failure (${endpoint}):`, error.message);
    throw error;
  }
};

export const generateAIResponse = async (prompt, context = '') => {
  try {
    const data = await fetchAI('/ai/oracle', { 
      question: context ? `${context}\n\n${prompt}` : prompt 
    });
    return data.response;
  } catch (error) {
    return `The Oracle speaks: "The mists of fate cloud my vision... (Error: ${error.message})". Please check your connection to the Nakama Network.`;
  }
};

export const generateDailyProphecy = async (userName) => {
  try {
    const data = await fetchAI('/ai/prophecy', { name: userName }, 'GET');
    return data.prophecy;
  } catch (error) {
    return "The path to glory is forged in silence. Today, embrace the stillness before the storm.";
  }
};

export const explainAnimeContext = async (sceneName, culturalElement) => {
  const prompt = `As an anime cultural expert (AI Sensei), explain the following cultural element or trope in the context of "${sceneName}":
  
  Cultural Element: ${culturalElement}
  
  Provide a brief, educational explanation (100-150 words).`;

  return await generateAIResponse(prompt);
};

export const generateGhostModeCommentary = async (characterName, sceneDescription) => {
  const prompt = `You are ${characterName} from anime. Watch this scene and provide live commentary AS the character:
  
  Scene: ${sceneDescription}
  
  Respond in character. Keep it under 100 words.`;

  return await generateAIResponse(prompt);
};

export const generateClanName = async (userVibe, interests) => {
  const prompt = `Generate a unique anime-style clan name and motto based on:
  
  User Vibe: ${userVibe}
  Interests: ${interests}
  
  Return in this format: CLAN: [Name] MOTTO: [Phrase]`;

  return await generateAIResponse(prompt);
};

export const askTheOracle = async (userMessage, conversationHistory = []) => {
  try {
    const data = await fetchAI('/ai/oracle', { 
      question: userMessage,
      conversation: conversationHistory 
    });
    return data.response;
  } catch (error) {
    return "The mists of fate cloud my vision... Ask again, seeker.";
  }
};

export const generateTriviaQuestion = async (difficulty = 'medium') => {
  try {
    const data = await fetchAI('/ai/trivia', { difficulty });
    // Backend returns {question, options, correct, explanation}
    return data;
  } catch (error) {
    console.error('Trivia fetch failed:', error);
    return getRandomFallbackTrivia();
  }
};

export const summarizeAnimeNews = async (newsTitle, newsContent) => {
  try {
    const data = await fetchAI('/ai/summary', { 
      anime_title: newsTitle,
      spoiler_free: true 
    });
    return data.summary;
  } catch (error) {
    return `${newsTitle}: A significant development has occurred in the anime world. Check the full article for details.`;
  }
};

export const recommendByMood = async (mood, genres = []) => {
  try {
    const data = await fetchAI('/ai/mood', { mood });
    if (data.recommendations) {
      return data.recommendations
        .map((rec, i) => `${i+1}. ${rec.title} - ${rec.reason}`)
        .join('\n');
    }
    return "I couldn't find specific recommendations for that mood, but 'Slice of Life' is always a safe bet!";
  } catch (error) {
    return "The stars are silent on recommendations today. Try exploring the trending section!";
  }
};

export const askAboutAnime = async (animeContext, userQuestion) => {
  // Use the specialized /ai/oracle endpoint which is already tuned for anime questions
  return await askTheOracle(userQuestion, [
    { role: 'system', content: `Context: ${animeContext.title}. ${animeContext.synopsis}` }
  ]);
};

// Fallback data remains local for offline resilience
const FALLBACK_TRIVIA = [
  { question: "Which anime features a character named Goku?", options: ["Dragon Ball", "Naruto", "One Piece", "Bleach"], correct: 0, explanation: "Goku is the main protagonist of Dragon Ball." },
  { question: "Who is the captain of the Straw Hat Pirates?", options: ["Zoro", "Sanji", "Luffy", "Nami"], correct: 2, explanation: "Monkey D. Luffy is the captain of the Straw Hat Pirates in One Piece." },
  { question: "Which village is Naruto from?", options: ["Sand Village", "Sound Village", "Hidden Leaf Village", "Mist Village"], correct: 2, explanation: "Naruto is from Konohagakure, the Hidden Leaf Village." },
  { question: "What is the name of Light Yagami's Shinigami in Death Note?", options: ["Rem", "Ryuk", "Mello", "Near"], correct: 1, explanation: "Ryuk is the Shinigami who dropped the Death Note that Light found." },
  { question: "Which anime features Titans attacking humanity?", options: ["Tokyo Ghoul", "Demon Slayer", "Attack on Titan", "Parasyte"], correct: 2, explanation: "Attack on Titan (Shingeki no Kyojin) features Titans attacking humans." },
  { question: "Who is the strongest hero in One Punch Man?", options: ["Genos", "Saitama", "King", "Blast"], correct: 1, explanation: "Saitama can defeat any opponent with a single punch, hence the title One Punch Man." }
];

const getRandomFallbackTrivia = () => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_TRIVIA.length);
  return { ...FALLBACK_TRIVIA[randomIndex] };
};
