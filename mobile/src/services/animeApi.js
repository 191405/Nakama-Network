

const BASE_URL = 'https://api.jikan.moe/v4';

let lastRequest = 0;
const MIN_DELAY = 350; 

const rateLimitedFetch = async (url) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < MIN_DELAY) {
        await new Promise(resolve => setTimeout(resolve, MIN_DELAY - timeSinceLastRequest));
    }

    lastRequest = Date.now();

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
};

const transformAnime = (anime) => ({
    id: anime.mal_id,
    title: anime.title || anime.title_english,
    titleJapanese: anime.title_japanese,
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    thumbnail: anime.images?.jpg?.small_image_url,
    synopsis: anime.synopsis,
    score: anime.score,
    scoredBy: anime.scored_by,
    rank: anime.rank,
    popularity: anime.popularity,
    episodes: anime.episodes,
    status: anime.status,
    airing: anime.airing,
    duration: anime.duration,
    rating: anime.rating,
    genres: anime.genres?.map(g => g.name) || [],
    themes: anime.themes?.map(t => t.name) || [],
    studios: anime.studios?.map(s => s.name) || [],
    year: anime.year || (anime.aired?.prop?.from?.year),
    season: anime.season,
    source: anime.source,
    trailer: anime.trailer?.youtube_id,
    url: anime.url,
});

const transformCharacter = (char) => ({
    id: char.mal_id,
    name: char.name,
    nameKanji: char.name_kanji,
    image: char.images?.jpg?.image_url,
    about: char.about,
    favorites: char.favorites,
    url: char.url,
});

export const getTrendingAnime = async (limit = 10, filter = 'airing') => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/top/anime?filter=${filter}&limit=${limit}`);
        return data.data?.map(transformAnime) || [];
    } catch (error) {
        console.error('Failed to fetch trending anime:', error);
        return [];
    }
};

export const getSeasonalAnime = async (limit = 10) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/seasons/now?limit=${limit}`);
        return data.data?.map(transformAnime) || [];
    } catch (error) {
        console.error('Failed to fetch seasonal anime:', error);
        return [];
    }
};

export const getTopAnime = async (filter = 'bypopularity', limit = 25) => {
    
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/top/anime?filter=${filter}&limit=${limit}`);
        return data.data?.map(transformAnime) || [];
    } catch (error) {
        console.error('Failed to fetch top anime:', error);
        return [];
    }
};

export const searchAnime = async (query, limit = 10) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`);
        return data.data?.map(transformAnime) || [];
    } catch (error) {
        console.error('Failed to search anime:', error);
        return [];
    }
};

export const getAnimeByGenre = async (genreId, limit = 10) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/anime?genres=${genreId}&limit=${limit}&order_by=score&sort=desc`);
        return data.data?.map(transformAnime) || [];
    } catch (error) {
        console.error('Failed to fetch anime by genre:', error);
        return [];
    }
};

export const getAnimeDetails = async (animeId) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/anime/${animeId}/full`);
        return transformAnime(data.data);
    } catch (error) {
        console.error('Failed to fetch anime details:', error);
        return null;
    }
};

export const getAnimeCharacters = async (animeId) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/anime/${animeId}/characters`);
        return data.data?.map(item => ({
            ...transformCharacter(item.character),
            role: item.role,
            voiceActors: item.voice_actors?.slice(0, 2).map(va => ({
                name: va.person?.name,
                language: va.language,
                image: va.person?.images?.jpg?.image_url,
            })) || [],
        })) || [];
    } catch (error) {
        console.error('Failed to fetch anime characters:', error);
        return [];
    }
};

export const getRandomAnime = async () => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/random/anime`);
        return transformAnime(data.data);
    } catch (error) {
        console.error('Failed to fetch random anime:', error);
        return null;
    }
};

export const getTopCharacters = async (limit = 25) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/top/characters?limit=${limit}`);
        return data.data?.map(transformCharacter) || [];
    } catch (error) {
        console.error('Failed to fetch top characters:', error);
        return [];
    }
};

export const getCharacterDetails = async (characterId) => {
    try {
        const data = await rateLimitedFetch(`${BASE_URL}/characters/${characterId}/full`);
        const char = data.data;
        return {
            ...transformCharacter(char),
            anime: char.anime?.map(a => ({
                id: a.anime.mal_id,
                title: a.anime.title,
                role: a.role,
            })) || [],
        };
    } catch (error) {
        console.error('Failed to fetch character details:', error);
        return null;
    }
};

export const getRandomCharacter = async () => {
    try {
        
        const topChars = await getTopCharacters(100);
        if (topChars.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * topChars.length);
        const char = topChars[randomIndex];

        return await getCharacterDetails(char.id);
    } catch (error) {
        console.error('Failed to fetch random character:', error);
        return null;
    }
};

export const ANIME_GENRES = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
    { id: 4, name: 'Comedy' },
    { id: 8, name: 'Drama' },
    { id: 10, name: 'Fantasy' },
    { id: 14, name: 'Horror' },
    { id: 22, name: 'Romance' },
    { id: 24, name: 'Sci-Fi' },
    { id: 36, name: 'Slice of Life' },
    { id: 30, name: 'Sports' },
    { id: 37, name: 'Supernatural' },
    { id: 41, name: 'Suspense' },
];
