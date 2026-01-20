
export const jikanAPI = {
  baseURL: 'https://api.jikan.moe/v4',

  async getTrendingAnime(limit = 24) {
    try {
      const response = await fetch(`${this.baseURL}/top/anime?filter=airing&limit=${limit}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan API Error:', error);
      return [];
    }
  },

  async searchAnime(query, page = 1) {
    try {
      const response = await fetch(`${this.baseURL}/anime?query=${encodeURIComponent(query)}&limit=25&page=${page}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan Search Error:', error);
      return [];
    }
  },

  async getAnimeDetails(malId) {
    try {
      const response = await fetch(`${this.baseURL}/anime/${malId}/full`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Jikan Details Error:', error);
      return null;
    }
  },

  async getUpcomingAnime(limit = 12) {
    try {
      const response = await fetch(`${this.baseURL}/seasons/upcoming?limit=${limit}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan Upcoming Error:', error);
      return [];
    }
  },

  async getAnimesByGenre(genreId, limit = 24) {
    try {
      const response = await fetch(`${this.baseURL}/anime?genres=${genreId}&limit=${limit}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan Genre Error:', error);
      return [];
    }
  },

  async getRandomAnime() {
    try {
      const response = await fetch(`${this.baseURL}/random/anime`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Jikan Random Error:', error);
      return null;
    }
  },

  async searchCharacters(query, limit = 25) {
    try {
      const response = await fetch(`${this.baseURL}/characters?q=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan Character Search Error:', error);
      return [];
    }
  },

  async getTopCharacters(limit = 25) {
    try {
      const response = await fetch(`${this.baseURL}/top/characters?limit=${limit}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan Top Characters Error:', error);
      return [];
    }
  },

  async getCharacterById(characterId) {
    try {
      const response = await fetch(`${this.baseURL}/characters/${characterId}/full`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Jikan Character Details Error:', error);
      return null;
    }
  },

  async getAnimeCharacters(animeId) {
    try {
      const response = await fetch(`${this.baseURL}/anime/${animeId}/characters`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jikan Anime Characters Error:', error);
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
