import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    WATCHLIST: '@nakama_watchlist',
    ACHIEVEMENTS: '@nakama_achievements',
    STATS: '@nakama_stats',
    FAVORITES: '@nakama_favorites',
    THEME: '@nakama_theme',
    QUOTES: '@nakama_saved_quotes',
};

export const saveData = async (key, data) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Storage save error:', e);
        return false;
    }
};

export const loadData = async (key, defaultValue = null) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Storage load error:', e);
        return defaultValue;
    }
};

export const getWatchlist = () => loadData(KEYS.WATCHLIST, []);

export const addToWatchlist = async (anime) => {
    const watchlist = await getWatchlist();
    if (!watchlist.find(a => a.id === anime.id)) {
        watchlist.unshift({ ...anime, addedAt: new Date().toISOString(), status: 'planning' });
        await saveData(KEYS.WATCHLIST, watchlist);
    }
    return watchlist;
};

export const removeFromWatchlist = async (animeId) => {
    let watchlist = await getWatchlist();
    watchlist = watchlist.filter(a => a.id !== animeId);
    await saveData(KEYS.WATCHLIST, watchlist);
    return watchlist;
};

export const updateWatchlistStatus = async (animeId, status) => {
    const watchlist = await getWatchlist();
    const index = watchlist.findIndex(a => a.id === animeId);
    if (index !== -1) {
        watchlist[index].status = status;
        await saveData(KEYS.WATCHLIST, watchlist);
    }
    return watchlist;
};

export const getStats = () => loadData(KEYS.STATS, {
    triviaPlayed: 0,
    triviaCorrect: 0,
    oracleChats: 0,
    propheciesViewed: 0,
    loginStreak: 0,
    lastLogin: null,
    totalTimeMs: 0,
    quotesGenerated: 0,
});

export const updateStats = async (updates) => {
    const stats = await getStats();
    const newStats = { ...stats, ...updates };
    await saveData(KEYS.STATS, newStats);
    return newStats;
};

export const incrementStat = async (key, amount = 1) => {
    const stats = await getStats();
    stats[key] = (stats[key] || 0) + amount;
    await saveData(KEYS.STATS, stats);
    return stats;
};

export const getUnlockedAchievements = () => loadData(KEYS.ACHIEVEMENTS, []);

export const unlockAchievement = async (achievementId) => {
    const unlocked = await getUnlockedAchievements();
    if (!unlocked.includes(achievementId)) {
        unlocked.push(achievementId);
        await saveData(KEYS.ACHIEVEMENTS, unlocked);
        return true; 
    }
    return false; 
};

export const getSavedQuotes = () => loadData(KEYS.QUOTES, []);

export const saveQuote = async (quote) => {
    const quotes = await getSavedQuotes();
    if (!quotes.find(q => q.text === quote.text)) {
        quotes.unshift({ ...quote, savedAt: new Date().toISOString() });
        await saveData(KEYS.QUOTES, quotes);
    }
    return quotes;
};

export const getTheme = () => loadData(KEYS.THEME, 'purple');
export const setTheme = (theme) => saveData(KEYS.THEME, theme);

export { KEYS };
