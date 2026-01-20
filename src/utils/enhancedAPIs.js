

class APICache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, data, ttlMs = 3600000) { 
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });

    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttlMs);

    this.timers.set(key, timer);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.timers.delete(key);
      return null;
    }

    return item.data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }
}

export const apiCache = new APICache();

class RequestDeduplicator {
  constructor() {
    this.inFlight = new Map();
  }

  async execute(key, requestFn) {
    
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    const promise = requestFn().finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const requestDedup = new RequestDeduplicator();

export const jikanAPI = {
  baseURL: 'https://api.jikan.moe/v4',

  async getTrendingAnime(page = 1, limit = 12) {
    const cacheKey = `jikan_trending_${page}_${limit}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const offset = (page - 1) * limit;
      const response = await fetch(
        `${this.baseURL}/top/anime?filter=airing&limit=${limit}&offset=${offset * limit}`
      );
      const data = await response.json();
      const result = data.data || [];
      apiCache.set(cacheKey, result, 600000); 
      return result;
    } catch (error) {
      console.error('Jikan trending error:', error);
      return [];
    }
  },

  async searchAnime(query, page = 1, limit = 12) {
    const cacheKey = `jikan_search_${query}_${page}_${limit}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const offset = (page - 1) * limit;
      const response = await fetch(
        `${this.baseURL}/anime?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset * limit}`
      );
      const data = await response.json();
      const result = data.data || [];
      apiCache.set(cacheKey, result, 600000); 
      return result;
    } catch (error) {
      console.error('Jikan search error:', error);
      return [];
    }
  },

  async searchCharacters(query, page = 1, limit = 12) {
    const cacheKey = `jikan_char_search_${query}_${page}_${limit}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/characters?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
      const data = await response.json();
      const result = data.data || [];
      apiCache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Jikan character search error:', error);
      return [];
    }
  },

  async getAnimeDetails(malId) {
    const cacheKey = `jikan_details_${malId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/anime/${malId}/full`);
      const data = await response.json();
      const result = data.data || null;
      apiCache.set(cacheKey, result, 3600000); 
      return result;
    } catch (error) {
      console.error('Jikan details error:', error);
      return null;
    }
  },

  async getAnimeCharacters(malId) {
    const cacheKey = `jikan_chars_${malId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/anime/${malId}/characters`);
      const data = await response.json();
      const result = data.data || [];
      apiCache.set(cacheKey, result, 3600000);
      return result;
    } catch (error) {
      console.error('Jikan characters error:', error);
      return [];
    }
  },

  async getUpcomingAnime(page = 1, limit = 12) {
    const cacheKey = `jikan_upcoming_${page}_${limit}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseURL}/seasons/upcoming?limit=${limit}&page=${page}`
      );
      const data = await response.json();
      const result = data.data || [];
      apiCache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Jikan upcoming error:', error);
      return [];
    }
  },

  async getAnimeReviews(malId, page = 1) {
    const cacheKey = `jikan_reviews_${malId}_${page}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/anime/${malId}/reviews?page=${page}`);
      const data = await response.json();
      const result = data.data || [];
      apiCache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Jikan reviews error:', error);
      return [];
    }
  }
};

export const kitsuAPI = {
  baseURL: 'https://kitsu.io/api/edge',

  async searchAnime(query, limit = 12, offset = 0) {
    const cacheKey = `kitsu_search_${query}_${limit}_${offset}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseURL}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}&page[offset]=${offset}`
      );
      const data = await response.json();
      const result = (data.data || []).map(anime => ({
        id: anime.id,
        title: anime.attributes.canonicalTitle || anime.attributes.titles?.en_jp || 'Unknown',
        description: anime.attributes.description,
        posterImage: anime.attributes.posterImage?.medium,
        coverImage: anime.attributes.coverImage?.large,
        episodeCount: anime.attributes.episodeCount,
        rating: anime.attributes.averageRating,
        status: anime.attributes.status,
        subtype: anime.attributes.subtype
      }));
      apiCache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Kitsu search error:', error);
      return [];
    }
  },

  async getEpisodes(kitsuAnimeId, limit = 24, offset = 0) {
    const cacheKey = `kitsu_episodes_${kitsuAnimeId}_${limit}_${offset}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseURL}/anime/${kitsuAnimeId}/episodes?page[limit]=${limit}&page[offset]=${offset}`
      );
      const data = await response.json();
      const result = (data.data || []).map(ep => ({
        id: ep.id,
        number: ep.attributes.number,
        title: ep.attributes.canonicalTitle,
        description: ep.attributes.description,
        airDate: ep.attributes.airdate,
        length: ep.attributes.length
      }));
      apiCache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Kitsu episodes error:', error);
      return [];
    }
  },

  async getCharacters(kitsuAnimeId, limit = 20) {
    const cacheKey = `kitsu_characters_${kitsuAnimeId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseURL}/anime/${kitsuAnimeId}/characters?page[limit]=${limit}`
      );
      const data = await response.json();
      const result = (data.data || []).map(char => ({
        id: char.id,
        name: char.attributes.name,
        image: char.attributes.image?.medium,
        role: char.attributes.role
      }));
      apiCache.set(cacheKey, result, 3600000);
      return result;
    } catch (error) {
      console.error('Kitsu characters error:', error);
      return [];
    }
  }
};

export const anilistAPI = {
  endpoint: 'https://graphql.anilist.co',

  async query(query, variables = {}) {
    
    const cacheKey = `anilist_${query.substring(0, 50)}_${JSON.stringify(variables)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      const data = await response.json();
      if (data.errors) {
        console.error('AniList error:', data.errors);
        return null;
      }
      apiCache.set(cacheKey, data.data, 600000);
      return data.data;
    } catch (error) {
      console.error('AniList query error:', error);
      return null;
    }
  },

  async getTrendingAnime(page = 1, limit = 12) {
    const query = `
      query($page: Int) {
        Page(page: $page, perPage: ${limit}) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title { userPreferred english romaji }
            coverImage { large medium }
            description
            episodes
            status
            averageScore
            popularity
            genres
            streamingEpisodes {
              site
              url
            }
          }
        }
      }
    `;
    const data = await this.query(query, { page });
    return data?.Page?.media || [];
  },

  async getAiringSchedule(page = 1, limit = 12) {
    const query = `
      query($page: Int) {
        Page(page: $page, perPage: ${limit}) {
          airingSchedules(sort: TIME_DESC) {
            id
            mediaId
            episode
            airingAt
            media {
              id
              title { userPreferred }
              coverImage { large }
            }
          }
        }
      }
    `;
    const data = await this.query(query, { page });
    return data?.Page?.airingSchedules || [];
  }
};

export const animechanAPI = {
  baseURL: 'https://animechan.vercel.app/api',

  async getDailyQuote() {
    const cacheKey = `animechan_daily_${new Date().toDateString()}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/random`);
      const data = await response.json();
      apiCache.set(cacheKey, data, 86400000); 
      return data;
    } catch (error) {
      console.error('AnimeChan daily quote error:', error);
      return null;
    }
  },

  async getQuotesByAnime(animeName) {
    const cacheKey = `animechan_quotes_${animeName}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseURL}/quotes?title=${encodeURIComponent(animeName)}`
      );
      const data = await response.json();
      const result = Array.isArray(data) ? data : [];
      apiCache.set(cacheKey, result, 3600000);
      return result;
    } catch (error) {
      console.error('AnimeChan quotes error:', error);
      return [];
    }
  },

  async getRandomQuote() {
    try {
      const response = await fetch(`${this.baseURL}/random`);
      return await response.json();
    } catch (error) {
      console.error('AnimeChan random quote error:', error);
      return null;
    }
  }
};

export const streamingResolver = {
  
  getStreamingLinks(animeTitle, malId) {
    return {
      crunchyroll: `https://www.crunchyroll.com/search?q=${encodeURIComponent(animeTitle)}`,
      netflix: `https://www.netflix.com/search?q=${encodeURIComponent(animeTitle)}`,
      hulu: `https://www.hulu.com/search?q=${encodeURIComponent(animeTitle)}`,
      justwatch: `https://www.justwatch.com/search?q=${encodeURIComponent(animeTitle)}&provider=streaming_tv`,
      myanimelist: `https://myanimelist.net/anime/${malId}`,
      imdb: `https://www.imdb.com/find?q=${encodeURIComponent(animeTitle)}&s=all`
    };
  },

  getYouTubeTrailerLink(animeTitle) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(animeTitle + ' official trailer')}`;
  }
};

export const multiAPIfallback = {
  
  async searchAnimeWithFallback(query, page = 1, limit = 12) {
    try {
      const jikanResults = await jikanAPI.searchAnime(query, page, limit);
      if (jikanResults && jikanResults.length > 0) {
        return { source: 'jikan', data: jikanResults };
      }
    } catch (error) {
      console.warn('Jikan search failed, trying Kitsu...');
    }

    try {
      const kitsuResults = await kitsuAPI.searchAnime(query, limit, (page - 1) * limit);
      if (kitsuResults && kitsuResults.length > 0) {
        return { source: 'kitsu', data: kitsuResults };
      }
    } catch (error) {
      console.warn('Kitsu search also failed');
    }

    return { source: 'none', data: [] };
  },

  async getCombinedTrending(page = 1, limit = 12) {
    const results = await Promise.allSettled([
      jikanAPI.getTrendingAnime(page, limit),
      anilistAPI.getTrendingAnime(page, limit)
    ]);

    const jikanTrending = results[0].status === 'fulfilled' ? results[0].value : [];
    const anilistTrending = results[1].status === 'fulfilled' ? results[1].value : [];

    const seen = new Set();
    const combined = [];

    [...jikanTrending, ...anilistTrending].forEach(anime => {
      const title = anime.title?.userPreferred || anime.title || 'Unknown';
      if (!seen.has(title)) {
        seen.add(title);
        combined.push(anime);
      }
    });

    return combined.slice(0, limit);
  }
};

export const apiUtils = {
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  stripHtmlTags(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  },

  getImageUrl(url, fallback = '/default-anime.png') {
    return url || fallback;
  },

  getRatingColor(score) {
    if (score >= 8.5) return 'text-green-400'; 
    if (score >= 7.5) return 'text-blue-400';  
    if (score >= 6.5) return 'text-yellow-400'; 
    return 'text-red-400'; 
  }
};

export const apiHealth = {
  async checkAllAPIs() {
    const checks = {
      jikan: false,
      kitsu: false,
      anilist: false,
      animechan: false
    };

    try {
      const jikanRes = await fetch('https://api.jikan.moe/v4/anime/1');
      checks.jikan = jikanRes.ok;
    } catch (e) { }

    try {
      const kitsuRes = await fetch('https://kitsu.io/api/edge/anime/1');
      checks.kitsu = kitsuRes.ok;
    } catch (e) { }

    try {
      const anilistRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ Page { pageInfo { total } } }' })
      });
      checks.anilist = anilistRes.ok;
    } catch (e) { }

    try {
      const animechanRes = await fetch('https://animechan.vercel.app/api/random');
      checks.animechan = animechanRes.ok;
    } catch (e) { }

    return checks;
  }
};

export default {
  apiCache,
  requestDedup,
  jikanAPI,
  kitsuAPI,
  anilistAPI,
  animechanAPI,
  streamingResolver,
  multiAPIfallback,
  apiUtils,
  apiHealth
};
