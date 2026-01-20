

export const API_BASE_URL = 'https://bright-ways-work.loca.lt';

const DEFAULT_TIMEOUT = 10000; 
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; 

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.isOnline = true;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchWithTimeout(url, options, timeout = DEFAULT_TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }

    async request(endpoint, options = {}, config = {}) {
        const {
            timeout = DEFAULT_TIMEOUT,
            retries = MAX_RETRIES,
            fallback = null,
            silent = false
        } = config;

        const url = `${this.baseUrl}${endpoint}`;
        const headers = { ...options.headers };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        headers['Bypass-Tunnel-Reminder'] = 'true';
        headers['ngrok-skip-browser-warning'] = 'true';

        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, {
                    headers,
                    ...options,
                }, timeout);

                if (!response.ok) {
                    
                    if (response.status >= 400 && response.status < 500) {
                        throw new Error(`API Error: ${response.status}`);
                    }
                    
                    throw new Error(`Server Error: ${response.status}`);
                }

                this.isOnline = true;
                return await response.json();

            } catch (error) {
                lastError = error;

                const isRetryable = error.message.includes('Server Error') ||
                    error.message.includes('timed out') ||
                    error.message.includes('Network request failed');

                if (isRetryable && attempt < retries) {
                    const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
                    if (!silent) {
                        console.log(`Retry ${attempt + 1}/${retries} for ${endpoint} in ${delay}ms`);
                    }
                    await this.sleep(delay);
                    continue;
                }

                break;
            }
        }

        this.isOnline = false;
        if (!silent) {
            console.error(`API failed after ${retries} retries: ${endpoint}`, lastError?.message);
        }

        if (fallback !== null) {
            return fallback;
        }

        throw lastError;
    }

    async safeRequest(endpoint, options = {}, fallback = null) {
        try {
            return await this.request(endpoint, options, { fallback, silent: true });
        } catch {
            return fallback;
        }
    }

    async getTrendingAnime(page = 1, limit = 25, filter = 'airing') {
        return this.safeRequest(
            `/anime/trending?page=${page}&limit=${limit}&filter=${filter}`,
            {},
            { anime: [], pagination: { page, hasNextPage: false, totalPages: 1 } }
        );
    }

    async getSeasonalAnime(page = 1, limit = 25) {
        return this.safeRequest(
            `/anime/seasonal?page=${page}&limit=${limit}`,
            {},
            { anime: [], pagination: { page, hasNextPage: false, totalPages: 1 } }
        );
    }

    async getPopularAnime(page = 1, limit = 25) {
        return this.safeRequest(
            `/anime/popular?page=${page}&limit=${limit}`,
            {},
            { anime: [], pagination: { page, hasNextPage: false, totalPages: 1 } }
        );
    }

    async searchAnime(query, page = 1, limit = 25, genre = null) {
        let url = `/anime/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
        if (genre) url += `&genre=${genre}`;
        return this.safeRequest(url, {}, { anime: [], pagination: { page, hasNextPage: false, totalPages: 1 } });
    }

    async getAnimeByGenre(genreName, page = 1, limit = 25) {
        return this.safeRequest(
            `/anime/genre/${genreName}?page=${page}&limit=${limit}`,
            {},
            { anime: [], pagination: { page, hasNextPage: false, totalPages: 1 } }
        );
    }

    async getAnimeDetails(animeId) {
        return this.safeRequest(`/anime/${animeId}`, {}, null);
    }

    async getAnimeCharacters(animeId) {
        return this.safeRequest(`/anime/${animeId}/characters`, {}, { characters: [] });
    }

    async getGenres() {
        return this.safeRequest('/anime/genres', {}, { genres: [] });
    }

    async getTopCharacters(page = 1, limit = 25) {
        return this.safeRequest(
            `/characters/top?page=${page}&limit=${limit}`,
            {},
            { characters: [], pagination: { page, hasNextPage: false, totalPages: 1 } }
        );
    }

    async searchCharacters(query, page = 1, limit = 25) {
        return this.safeRequest(
            `/characters/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
            {},
            { characters: [], pagination: { page, hasNextPage: false, totalPages: 1 } }
        );
    }

    async getRandomCharacter() {
        return this.safeRequest('/characters/random', {}, null);
    }

    async getCharacterDetails(characterId) {
        return this.safeRequest(`/characters/${characterId}`, {}, null);
    }

    async getCharacterOfTheDay() {
        return this.safeRequest('/characters/daily', {}, null);
    }

    async askOracle(question, conversation = []) {
        return this.safeRequest('/ai/oracle', {
            method: 'POST',
            body: JSON.stringify({ question, conversation }),
        }, { response: "The oracle is currently meditating. Please try again later." });
    }

    async getMoodRecommendations(mood) {
        return this.safeRequest('/ai/mood', {
            method: 'POST',
            body: JSON.stringify({ mood }),
        }, { recommendations: [] });
    }

    async generateQuote(theme = 'motivation') {
        return this.safeRequest('/ai/quote', {
            method: 'POST',
            body: JSON.stringify({ theme }),
        }, { quote: "Even in darkness, the flame of hope never dies.", attribution: "Unknown Sage" });
    }

    async getDailyProphecy(name = 'Shinobi') {
        return this.safeRequest(`/ai/prophecy?name=${encodeURIComponent(name)}`, {}, null);
    }

    async generateTrivia(difficulty = 'medium') {
        return this.safeRequest('/ai/trivia', {
            method: 'POST',
            body: JSON.stringify({ difficulty }),
        }, null);
    }

    async sendWelcomeEmail(email, displayName) {
        return this.request('/auth/welcome', {
            method: 'POST',
            body: JSON.stringify({ email, display_name: displayName }),
        }, { retries: 0 });
    }

    async getQuickGames() {
        return this.safeRequest('/arcade/quick-games', {}, { games: [], total_online: 0 });
    }

    async goOnline(userId, displayName, avatarUrl, gameType = 'trivia') {
        return this.request('/arcade/go-online', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                display_name: displayName,
                avatar_url: avatarUrl,
                game_type: gameType
            })
        }, { retries: 0 });
    }

    async findMatch(userId, displayName, avatarUrl, gameType = 'trivia') {
        return this.request('/arcade/find-match', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                display_name: displayName,
                avatar_url: avatarUrl,
                game_type: gameType
            })
        }, { retries: 0 });
    }

    async addXP(userId, amount, action) {
        return this.request('/interaction/xp', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, amount, action }),
        }, { retries: 1 });
    }

    async getUserStats(userId) {
        return this.safeRequest(`/interaction/stats/${userId}`, {}, {
            user_id: userId,
            xp: 0,
            level: 1,
            rank: 'Academy Student',
            rank_color: '#94a3b8',
            next_level_xp: 500
        });
    }

    async updateUserProfile(userId, updates) {
        return this.request(`/interaction/update/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        }, { retries: 1 });
    }

    async createReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    async getReviews(animeId) {
        return this.safeRequest(`/reviews/${animeId}`, {}, []);
    }

    async saveEpisode(episodeData) {
        return this.request('/episodes/save', {
            method: 'POST',
            body: JSON.stringify(episodeData),
        });
    }

    async getEpisodes(animeId) {
        return this.safeRequest(`/episodes/${animeId}`, {}, []);
    }

    async getAllEpisodes(limit = 50) {
        return this.safeRequest(`/episodes/all?limit=${limit}`, {}, []);
    }

    async deleteEpisode(episodeId) {
        return this.request(`/episodes/${episodeId}`, {
            method: 'DELETE'
        });
    }

    async listManga(type = 'all', limit = 50) {
        const typeParam = type !== 'all' ? `&type=${type}` : '';
        return this.safeRequest(`/manga/list?limit=${limit}${typeParam}`, {}, { manga: [] });
    }

    async getManga(mangaId) {
        return this.safeRequest(`/manga/${mangaId}`, {}, { manga: null, chapters: [] });
    }

    async createManga(mangaData) {
        return this.request('/manga/create', {
            method: 'POST',
            body: JSON.stringify(mangaData)
        });
    }

    async searchManga(query, type = 'all') {
        const typeParam = type !== 'all' ? `&type=${type}` : '';
        return this.safeRequest(`/manga/search?q=${encodeURIComponent(query)}${typeParam}`, {}, { results: [] });
    }

    async addChapter(chapterData) {
        return this.request('/manga/chapter/add', {
            method: 'POST',
            body: JSON.stringify(chapterData)
        });
    }

    async getChapter(chapterId) {
        return this.safeRequest(`/manga/chapter/${chapterId}`, {}, { chapter: null });
    }

    async deleteManga(mangaId, userId) {
        return this.request(`/manga/${mangaId}?user_id=${userId}`, {
            method: 'DELETE'
        });
    }

    async getRecentMangaUpdates(limit = 20) {
        return this.safeRequest(`/manga/recent/updates?limit=${limit}`, {}, { manga: [] });
    }

    async getChatHistory(roomId) {
        return this.safeRequest(`/chat/history/${roomId}`, {}, []);
    }

    async getRecentChats(userId) {
        return this.safeRequest(`/chat/recent?user_name=${encodeURIComponent(userId)}`, {}, []);
    }

    async submitTriviaAnswer(userId, isCorrect, difficulty = 'medium', streakCount = 0) {
        return this.request('/trivia/submit', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                is_correct: isCorrect,
                difficulty,
                streak_count: streakCount
            })
        });
    }

    async getTriviaStats(userId) {
        return this.safeRequest(`/trivia/stats/${userId}`, {}, { stats: {} });
    }

    async getTriviaLeaderboard(limit = 20) {
        return this.safeRequest(`/trivia/leaderboard?limit=${limit}`, {}, { leaderboard: [] });
    }

    async getTriviaLevels(userId) {
        return this.safeRequest(`/trivia/levels/${userId}`, {}, {
            levels: [],
            unlocked_levels: ['normal'],
            accuracy: 0
        });
    }

    async getAllTriviaLevels() {
        return this.safeRequest('/trivia/levels', {}, { levels: [] });
    }

    async getAllAchievements() {
        return this.safeRequest('/achievements/list', {}, { achievements: [] });
    }

    async getUserAchievements(userId) {
        return this.safeRequest(`/achievements/user/${userId}`, {}, { unlocked: [], achievements: [], total_points: 0 });
    }

    async unlockAchievement(userId, achievementId) {
        return this.request('/achievements/unlock', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                achievement_id: achievementId
            })
        });
    }

    async getAchievementsLeaderboard(limit = 20) {
        return this.safeRequest(`/achievements/leaderboard?limit=${limit}`, {}, { leaderboard: [] });
    }

    async getUserProgress(userId) {
        return this.safeRequest(`/users/${userId}/progress`, {}, {
            level: { title: 'Academy Student', progress: 0, badge: '🎓' },
            rank: { title: 'Net Wanderer', progress: 0, color: '#94a3b8' },
            streak: { current: 0, longest: 0 },
            stats: { chakra: 0, episodes: 0 }
        });
    }

    async creditChakra(userId, action, amount = null) {
        return this.safeRequest(`/users/${userId}/progress`, {
            method: 'POST',
            body: JSON.stringify({ action, amount })
        }, null);
    }

    async checkHealth() {
        return this.safeRequest('/health', {}, { status: 'offline' });
    }

    async ping() {
        try {
            await this.request('/health', {}, { timeout: 3000, retries: 0 });
            this.isOnline = true;
            return true;
        } catch {
            this.isOnline = false;
            return false;
        }
    }
}

export const api = new ApiClient(API_BASE_URL);

export const getTrendingAnime = (page, limit) => api.getTrendingAnime(page, limit);
export const getSeasonalAnime = (page, limit) => api.getSeasonalAnime(page, limit);
export const getTopAnime = (page, limit) => api.getPopularAnime(page, limit);
export const searchAnime = (query, limit) => api.searchAnime(query, 1, limit);
export const getAnimeByGenre = (genreId, limit, page) => api.getAnimeByGenre(genreId, page, limit);
export const getAnimeDetails = (id) => api.getAnimeDetails(id);
export const getAnimeCharacters = (id) => api.getAnimeCharacters(id);
export const getTopCharacters = (limit) => api.getTopCharacters(1, limit);
export const searchCharacters = (query, limit) => api.searchCharacters(query, 1, limit);
export const getRandomCharacter = () => api.getRandomCharacter();
export const getCharacterDetails = (id) => api.getCharacterDetails(id);
export const uploadEpisode = (data) => api.uploadEpisode(data);
export const getEpisodes = (id) => api.getEpisodes(id);
export const addXP = (userId, amount, action) => api.addXP(userId, amount, action);
export const getUserStats = (userId) => api.getUserStats(userId);
export const createReview = (reviewData) => api.createReview(reviewData);
export const getReviews = (animeId) => api.getReviews(animeId);
export const createClan = (clanData) => api.createClan(clanData);
export const getClans = () => api.getClans();
export const joinClan = (clanId, userId) => api.joinClan(clanId, userId);
export const getUserClan = (userId) => api.getUserClan(userId);
export const getChatHistory = (roomId) => api.getChatHistory(roomId);
export const getRecentChats = (userId) => api.getRecentChats(userId);

export const submitTriviaAnswer = (userId, isCorrect, difficulty, streakCount) =>
    api.submitTriviaAnswer(userId, isCorrect, difficulty, streakCount);
export const getTriviaStats = (userId) => api.getTriviaStats(userId);
export const getTriviaLeaderboard = (limit) => api.getTriviaLeaderboard(limit);

export const getAllAchievements = () => api.getAllAchievements();
export const getUserAchievements = (userId) => api.getUserAchievements(userId);
export const unlockAchievement = (userId, achievementId) => api.unlockAchievement(userId, achievementId);
export const getAchievementsLeaderboard = (limit) => api.getAchievementsLeaderboard(limit);

export const ANIME_GENRES = [
    { id: 'action', name: 'Action' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'horror', name: 'Horror' },
    { id: 'romance', name: 'Romance' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'slice-of-life', name: 'Slice of Life' },
    { id: 'sports', name: 'Sports' },
    { id: 'supernatural', name: 'Supernatural' },
    { id: 'suspense', name: 'Suspense' },
];

export default api;
