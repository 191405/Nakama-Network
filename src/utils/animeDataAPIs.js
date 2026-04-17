
/* ── 3-Day localStorage Cache Layer ── */
const CACHE_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

const getCacheKey = (url) => `nk_cache_${btoa(url).slice(0, 60)}`;

const getFromCache = (url) => {
  try {
    const key = getCacheKey(url);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null; // expired
    }
    return data;
  } catch {
    return null;
  }
};

const setToCache = (url, data) => {
  try {
    const key = getCacheKey(url);
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    // localStorage full — evict oldest entries
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('nk_cache_'));
      if (keys.length > 0) {
        let oldest = keys[0], oldestTime = Infinity;
        keys.forEach(k => {
          try {
            const t = JSON.parse(localStorage.getItem(k))?.timestamp || 0;
            if (t < oldestTime) { oldestTime = t; oldest = k; }
          } catch {}
        });
        localStorage.removeItem(oldest);
        localStorage.setItem(getCacheKey(url), JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch {}
  }
};

const safeFetch = async (url, options = {}, retries = 2, delay = 1000) => {
  // Check cache first (GET requests only)
  if (!options.method || options.method === 'GET') {
    const cached = getFromCache(url);
    if (cached) {
      return cached;
    }
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const waitTime = delay * Math.pow(2, i);
        console.warn(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      // Cache the successful response (but not empty data arrays)
      if (!options.method || options.method === 'GET') {
        const hasData = !json.data || (Array.isArray(json.data) && json.data.length > 0) || !Array.isArray(json.data);
        if (hasData) {
          setToCache(url, json);
        }
      }
      return json;
    } catch (error) {
      if (i === retries) {
        console.warn('Max retries reached. Failing gracefully.', error.message);
        return { data: null }; // Return generic empty JSON shape to prevent crash
      }
      const waitTime = delay * Math.pow(2, i);
      console.warn(`Fetch error. Retrying in ${waitTime}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

export const jikanAPI = {
  baseURL: 'https://api.jikan.moe/v4',

  async getTrendingAnime(limit = 24) {
    try {
      const data = await safeFetch(`${this.baseURL}/top/anime?filter=airing&limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan API Error:', error);
      return [];
    }
  },

  async searchAnime(query, page = 1) {
    try {
      const data = await safeFetch(`${this.baseURL}/anime?q=${encodeURIComponent(query)}&limit=25&page=${page}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Search Error:', error);
      return [];
    }
  },

  async getAnimeDetails(malId) {
    try {
      const data = await safeFetch(`${this.baseURL}/anime/${malId}/full`);
      return data.data || null;
    } catch (error) {
      console.error('Jikan Details Error:', error);
      return null;
    }
  },

  async getUpcomingAnime(limit = 12) {
    try {
      const data = await safeFetch(`${this.baseURL}/seasons/upcoming?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Upcoming Error:', error);
      return [];
    }
  },

  async getSeasonNow(limit = 12) {
    try {
      const data = await safeFetch(`${this.baseURL}/seasons/now?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Season Now Error:', error);
      return [];
    }
  },

  async getSeasonalAnime(year, season, limit = 12) {
    try {
      const data = await safeFetch(`${this.baseURL}/seasons/${year}/${season}?limit=${limit}&order_by=score&sort=desc`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Seasonal Error:', error);
      return [];
    }
  },

  async getAnimesByGenre(genreId, limit = 24) {
    try {
      const data = await safeFetch(`${this.baseURL}/anime?genres=${genreId}&limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Genre Error:', error);
      return [];
    }
  },

  async getRandomAnime() {
    try {
      const data = await safeFetch(`${this.baseURL}/random/anime`);
      return data.data || null;
    } catch (error) {
      console.error('Jikan Random Error:', error);
      return null;
    }
  },

  async searchCharacters(query, limit = 25) {
    try {
      const data = await safeFetch(`${this.baseURL}/characters?q=${encodeURIComponent(query)}&limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Character Search Error:', error);
      return [];
    }
  },

  async getTopCharacters(limit = 25) {
    try {
      const data = await safeFetch(`${this.baseURL}/top/characters?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Top Characters Error:', error);
      return [];
    }
  },

  async getCharacterById(characterId) {
    try {
      const data = await safeFetch(`${this.baseURL}/characters/${characterId}/full`);
      return data.data || null;
    } catch (error) {
      console.error('Jikan Character Details Error:', error);
      return null;
    }
  },

  async getAnimeCharacters(animeId) {
    try {
      const data = await safeFetch(`${this.baseURL}/anime/${animeId}/characters`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Anime Characters Error:', error);
      return [];
    }
  },

  async getAnimeEpisodes(animeId, page = 1) {
    try {
      const data = await safeFetch(`${this.baseURL}/anime/${animeId}/episodes?page=${page}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Anime Episodes Error:', error);
      return [];
    }
  },

  async getAnimeNews(animeId, limit = 5) {
    try {
      const data = await safeFetch(`${this.baseURL}/anime/${animeId}/news?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Jikan Anime News Error:', error);
      // With 3-day cache in place, real data persists — no placeholder fallback needed
      return [];
    }
  }
};

export const anilistAPI = {
  endpoint: 'https://graphql.anilist.co',

  async query(query, variables = {}) {
    try {
      const response = await fetch(this.endpoint, {
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
      if (data.errors) {
        console.error('AniList Error:', data.errors);
        return null;
      }
      return data.data;
    } catch (error) {
      console.error('AniList Query Error:', error);
      return null;
    }
  },

  async getTrendingAnime(limit = 24) {
    const query = `
      query {
        Page(perPage: ${limit}) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              userPreferred
              english
              romaji
            }
            coverImage {
              large
              medium
            }
            description
            season
            seasonYear
            episodes
            status
            averageScore
            popularity
            genres
            studios(isMain: true) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    `;
    const data = await this.query(query);
    return data?.Page?.media || [];
  },

  async searchAnime(searchTerm, page = 1, limit = 25) {
    const query = `
      query($search: String, $page: Int) {
        Page(page: $page, perPage: ${limit}) {
          media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
            id
            title {
              userPreferred
              english
              romaji
            }
            coverImage {
              large
              medium
            }
            description
            season
            seasonYear
            episodes
            status
            averageScore
            popularity
            genres
          }
        }
      }
    `;
    const data = await this.query(query, { search: searchTerm, page });
    return data?.Page?.media || [];
  },

  async getAnimeDetails(id) {
    const query = `
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            userPreferred
            english
            romaji
            native
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          season
          seasonYear
          episodes
          duration
          status
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          averageScore
          popularity
          trending
          genres
          tags {
            name
          }
          studios(isMain: true) {
            edges {
              node {
                name
              }
            }
          }
          nextAiringEpisode {
            airingAt
            episode
          }
          externalLinks {
            site
            url
          }
        }
      }
    `;
    const data = await this.query(query, { id });
    return data?.Media || null;
  },

  async getUpcomingAnime(limit = 12) {
    const query = `
      query {
        Page(perPage: ${limit}) {
          media(type: ANIME, status: NOT_YET_RELEASED, sort: START_DATE_ASC) {
            id
            title {
              userPreferred
            }
            coverImage {
              large
              medium
            }
            season
            seasonYear
            episodes
            status
            averageScore
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;
    const data = await this.query(query);
    return data?.Page?.media || [];
  },

  async getAnimeByGenre(genre, limit = 24) {
    const query = `
      query($genre: String) {
        Page(perPage: ${limit}) {
          media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
            id
            title {
              userPreferred
            }
            coverImage {
              large
            }
            season
            seasonYear
            episodes
            status
            averageScore
            genres
          }
        }
      }
    `;
    const data = await this.query(query, { genre });
    return data?.Page?.media || [];
  },

  async getAiringSchedule(limit = 12) {
    const query = `
      query {
        Page(perPage: ${limit}) {
          airingSchedules(sort: TIME_ASC) {
            id
            episode
            airingAt
            media {
              id
              title {
                userPreferred
              }
              coverImage {
                medium
              }
            }
          }
        }
      }
    `;
    const data = await this.query(query);
    return data?.Page?.airingSchedules || [];
  }
};
