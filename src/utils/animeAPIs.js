

const API_KEYS = {
  TMDB: import.meta.env.VITE_TMDB_API_KEY || '',
  YOUTUBE: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  TWITCH_CLIENT_ID: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
  TWITCH_ACCESS_TOKEN: import.meta.env.VITE_TWITCH_ACCESS_TOKEN || '',
};

export const jikanAPI = {
  
  searchAnime: async (query) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan search error:', error);
      return [];
    }
  },

  getTrendingAnime: async () => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan trending error:', error);
      return [];
    }
  },

  getSeasonalAnime: async (year, season) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan seasonal error:', error);
      return [];
    }
  },

  getAnimeDetails: async (animeId) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Jikan details error:', error);
      return null;
    }
  },

  getAnimeReviews: async (animeId) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/reviews`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan reviews error:', error);
      return [];
    }
  },

  getRandomAnime: async () => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/random/anime');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Jikan random error:', error);
      return null;
    }
  },
};

export const anilistAPI = {
  
  query: async (query, variables = {}) => {
    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('AniList GraphQL error:', error);
      return null;
    }
  },

  getTrendingAnime: async (page = 1) => {
    const query = `
      query($page: Int) {
        Page(page: $page, perPage: 10) {
          media(sort: TRENDING_DESC, type: ANIME, status: RELEASING) {
            id
            title { romaji english }
            coverImage { large }
            description
            averageScore
            popularity
            episodes
            nextAiringEpisode { airingAt }
          }
        }
      }
    `;
    return await this.query(query, { page });
  },

  getSeasonalAnime: async () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth() + 1;
    let season = 'WINTER';
    if (month >= 3 && month < 6) season = 'SPRING';
    if (month >= 6 && month < 9) season = 'SUMMER';
    if (month >= 9) season = 'FALL';

    const query = `
      query($season: MediaSeason, $year: Int) {
        Page(perPage: 20) {
          media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji }
            coverImage { large }
            averageScore
            episodes
          }
        }
      }
    `;
    return await this.query(query, { season, year: currentYear });
  },

  getCharactersByAnime: async (animeId) => {
    const query = `
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          characters(page: 1, perPage: 10) {
            edges {
              node {
                id
                name { full }
                image { large }
              }
              characterRole
            }
          }
        }
      }
    `;
    return await this.query(query, { id: animeId });
  },

  searchAnime: async (search) => {
    const query = `
      query($search: String) {
        Media(search: $search, type: ANIME) {
          id
          title { romaji english }
          coverImage { large }
          description
          averageScore
          episodes
        }
      }
    `;
    return await this.query(query, { search });
  },
};

export const tmdbAPI = {
  baseURL: 'https://api.themoviedb.org/3',

  getTrendingMedia: async () => {
    if (!API_KEYS.TMDB) {
      console.warn('TMDB API key not configured');
      return [];
    }
    try {
      const response = await fetch(
        `${this.baseURL}/trending/tv/day?api_key=${API_KEYS.TMDB}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('TMDB trending error:', error);
      return [];
    }
  },

  searchMedia: async (query) => {
    if (!API_KEYS.TMDB) {
      console.warn('TMDB API key not configured');
      return [];
    }
    try {
      const response = await fetch(
        `${this.baseURL}/search/tv?api_key=${API_KEYS.TMDB}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('TMDB search error:', error);
      return [];
    }
  },

  getMediaDetails: async (mediaId) => {
    if (!API_KEYS.TMDB) {
      console.warn('TMDB API key not configured');
      return null;
    }
    try {
      const response = await fetch(
        `${this.baseURL}/tv/${mediaId}?api_key=${API_KEYS.TMDB}&append_to_response=credits,recommendations`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TMDB details error:', error);
      return null;
    }
  },
};

export const youtubeAPI = {
  searchVideos: async (query, maxResults = 10) => {
    if (!API_KEYS.YOUTUBE) {
      console.warn('YouTube API key not configured');
      return [];
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${API_KEYS.YOUTUBE}`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  },

  getVideoDetails: async (videoId) => {
    if (!API_KEYS.YOUTUBE) {
      console.warn('YouTube API key not configured');
      return null;
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEYS.YOUTUBE}`
      );
      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('YouTube details error:', error);
      return null;
    }
  },

  getAnimeTrailer: async (animeTitle) => {
    const results = await this.searchVideos(`${animeTitle} trailer`, 1);
    return results[0]?.id?.videoId || null;
  },
};

export const twitchAPI = {
  baseURL: 'https://api.twitch.tv/helix',

  getLiveAnimeStreams: async () => {
    if (!API_KEYS.TWITCH_CLIENT_ID || !API_KEYS.TWITCH_ACCESS_TOKEN) {
      console.warn('Twitch credentials not configured');
      return [];
    }
    try {
      const response = await fetch(`${this.baseURL}/streams?game_id=12191`, {
        headers: {
          'Client-ID': API_KEYS.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${API_KEYS.TWITCH_ACCESS_TOKEN}`,
        },
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Twitch streams error:', error);
      return [];
    }
  },

  searchChannels: async (query) => {
    if (!API_KEYS.TWITCH_CLIENT_ID || !API_KEYS.TWITCH_ACCESS_TOKEN) {
      console.warn('Twitch credentials not configured');
      return [];
    }
    try {
      const response = await fetch(
        `${this.baseURL}/search/channels?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Client-ID': API_KEYS.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${API_KEYS.TWITCH_ACCESS_TOKEN}`,
          },
        }
      );
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Twitch search error:', error);
      return [];
    }
  },
};

export const rapidAnimeAPI = {
  apiKey: import.meta.env.VITE_RAPIDAPI_KEY || '',

  async call(endpoint, params = {}) {
    if (!this.apiKey) {
      console.warn('RapidAPI key not configured');
      return null;
    }

    const queryString = new URLSearchParams(params).toString();
    try {
      const response = await fetch(
        `https://anime-api.onrender.com${endpoint}${queryString ? '?' + queryString : ''}`,
        {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'anime-api.onrender.com',
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('RapidAPI error:', error);
      return null;
    }
  },

  getAnimeQuotes: async () => {
    return await this.call('/quotes', { limit: 10 });
  },

  getAnimeCharacters: async (animeId) => {
    return await this.call(`/characters/${animeId}`);
  },

  getAnimeTrivia: async () => {
    return await this.call('/trivia', { limit: 5 });
  },
};

export const searchAnimeAcrossAPIs = async (query) => {
  const results = await Promise.all([
    jikanAPI.searchAnime(query),
    anilistAPI.searchAnime(query),
    tmdbAPI.searchMedia(query),
  ]);

  return {
    jikan: results[0],
    anilist: results[1],
    tmdb: results[2],
  };
};

export default {
  jikanAPI,
  anilistAPI,
  tmdbAPI,
  youtubeAPI,
  twitchAPI,
  rapidAnimeAPI,
  searchAnimeAcrossAPIs,
};
