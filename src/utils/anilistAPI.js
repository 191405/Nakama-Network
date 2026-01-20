

const ANILIST_URL = 'https://graphql.anilist.co';

const query = async (queryString, variables = {}) => {
    try {
        const response = await fetch(ANILIST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryString, variables })
        });
        if (!response.ok) throw new Error('AniList query failed');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('AniList error:', error);
        return null;
    }
};

export const getAiringSchedule = async (page = 1, perPage = 20) => {
    const now = Math.floor(Date.now() / 1000);
    const tomorrow = now + 86400;

    const queryString = `
    query ($page: Int, $perPage: Int, $airingAt_greater: Int, $airingAt_lesser: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME) {
          id
          episode
          airingAt
          media {
            id
            title { romaji english native }
            coverImage { large medium }
            bannerImage
            episodes
            genres
            averageScore
            popularity
          }
        }
      }
    }
  `;

    const data = await query(queryString, { page, perPage, airingAt_greater: now, airingAt_lesser: tomorrow });
    return data?.Page?.airingSchedules || [];
};

export const getSeasonalAnime = async (season, year, page = 1) => {
    const queryString = `
    query ($season: MediaSeason, $year: Int, $page: Int) {
      Page(page: $page, perPage: 24) {
        media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
          id
          title { romaji english }
          coverImage { large }
          bannerImage
          episodes
          genres
          averageScore
          popularity
          status
          nextAiringEpisode { episode airingAt }
        }
      }
    }
  `;

    const data = await query(queryString, { season, year, page });
    return data?.Page?.media || [];
};

export const getRecommendations = async (mediaId) => {
    const queryString = `
    query ($id: Int) {
      Media(id: $id) {
        recommendations(page: 1, perPage: 10, sort: RATING_DESC) {
          nodes {
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { large }
              averageScore
              genres
            }
          }
        }
      }
    }
  `;

    const data = await query(queryString, { id: mediaId });
    return data?.Media?.recommendations?.nodes?.map(n => n.mediaRecommendation) || [];
};

export const searchAnime = async (searchQuery, page = 1) => {
    const queryString = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 20) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title { romaji english native }
          coverImage { large medium }
          bannerImage
          episodes
          genres
          averageScore
          popularity
          status
          description
          startDate { year month day }
        }
      }
    }
  `;

    const data = await query(queryString, { search: searchQuery, page });
    return data?.Page?.media || [];
};

export const getTrending = async (page = 1, perPage = 10) => {
    const queryString = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title { romaji english }
          coverImage { large }
          episodes
          averageScore
          trending
        }
      }
    }
  `;

    const data = await query(queryString, { page, perPage });
    return data?.Page?.media || [];
};

export const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) return 'WINTER';
    if (month >= 3 && month <= 5) return 'SPRING';
    if (month >= 6 && month <= 8) return 'SUMMER';
    return 'FALL';
};

export const anilistAPI = {
    getAiringSchedule,
    getSeasonalAnime,
    getRecommendations,
    searchAnime,
    getTrending,
    getCurrentSeason
};

export default anilistAPI;
