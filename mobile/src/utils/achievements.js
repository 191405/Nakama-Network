

export const ACHIEVEMENTS = [
    
    { id: 'first_login', name: 'First Steps', description: 'Log in for the first time', icon: '🎯', points: 10, category: 'beginner' },
    { id: 'first_prophecy', name: 'Fortune Seeker', description: 'View your first Daily Prophecy', icon: '🔮', points: 15, category: 'beginner' },
    { id: 'first_trivia', name: 'Quiz Rookie', description: 'Play your first trivia game', icon: '🎮', points: 10, category: 'beginner' },
    { id: 'first_oracle', name: 'Seeker of Wisdom', description: 'Ask The Oracle a question', icon: '✨', points: 15, category: 'beginner' },

    { id: 'trivia_10', name: 'Trivia Enthusiast', description: 'Answer 10 trivia questions', icon: '📚', points: 25, category: 'trivia' },
    { id: 'trivia_50', name: 'Knowledge Hunter', description: 'Answer 50 trivia questions', icon: '🧠', points: 50, category: 'trivia' },
    { id: 'trivia_100', name: 'Quiz Master', description: 'Answer 100 trivia questions', icon: '👑', points: 100, category: 'trivia' },
    { id: 'trivia_streak_5', name: 'Hot Streak', description: 'Get 5 correct answers in a row', icon: '🔥', points: 30, category: 'trivia' },
    { id: 'trivia_streak_10', name: 'Unstoppable', description: 'Get 10 correct answers in a row', icon: '⚡', points: 75, category: 'trivia' },
    { id: 'trivia_perfect', name: 'Perfect Round', description: 'Get 10/10 in a trivia session', icon: '💯', points: 50, category: 'trivia' },

    { id: 'oracle_10', name: 'Curious Mind', description: 'Ask The Oracle 10 questions', icon: '💬', points: 25, category: 'social' },
    { id: 'oracle_50', name: 'Oracle\'s Friend', description: 'Ask The Oracle 50 questions', icon: '🌟', points: 75, category: 'social' },

    { id: 'watchlist_5', name: 'List Starter', description: 'Add 5 anime to your watchlist', icon: '📝', points: 20, category: 'collector' },
    { id: 'watchlist_20', name: 'Otaku Curator', description: 'Add 20 anime to your watchlist', icon: '📚', points: 50, category: 'collector' },
    { id: 'quote_5', name: 'Quote Collector', description: 'Save 5 anime quotes', icon: '💭', points: 20, category: 'collector' },

    { id: 'streak_3', name: 'Dedicated', description: 'Log in 3 days in a row', icon: '📅', points: 25, category: 'dedication' },
    { id: 'streak_7', name: 'Weekly Warrior', description: 'Log in 7 days in a row', icon: '🗓️', points: 50, category: 'dedication' },
    { id: 'streak_30', name: 'Monthly Master', description: 'Log in 30 days in a row', icon: '🏆', points: 150, category: 'dedication' },

    { id: 'mood_explorer', name: 'Mood Explorer', description: 'Try all mood recommendations', icon: '🎭', points: 40, category: 'special' },
    { id: 'night_owl', name: 'Night Owl', description: 'Use the app after midnight', icon: '🦉', points: 15, category: 'special' },
    { id: 'early_bird', name: 'Early Bird', description: 'Use the app before 6 AM', icon: '🌅', points: 15, category: 'special' },
];

export const getAchievementById = (id) => ACHIEVEMENTS.find(a => a.id === id);

export const getCategoryAchievements = (category) => ACHIEVEMENTS.filter(a => a.category === category);

export const calculateTotalPoints = (unlockedIds) => {
    return unlockedIds.reduce((total, id) => {
        const achievement = getAchievementById(id);
        return total + (achievement?.points || 0);
    }, 0);
};

export const getNextAchievements = (unlockedIds, limit = 3) => {
    return ACHIEVEMENTS
        .filter(a => !unlockedIds.includes(a.id))
        .slice(0, limit);
};

export const checkAchievements = async (stats, unlockedIds) => {
    const newlyUnlocked = [];

    if (stats.triviaPlayed >= 10 && !unlockedIds.includes('trivia_10')) newlyUnlocked.push('trivia_10');
    if (stats.triviaPlayed >= 50 && !unlockedIds.includes('trivia_50')) newlyUnlocked.push('trivia_50');
    if (stats.triviaPlayed >= 100 && !unlockedIds.includes('trivia_100')) newlyUnlocked.push('trivia_100');

    if (stats.oracleChats >= 10 && !unlockedIds.includes('oracle_10')) newlyUnlocked.push('oracle_10');
    if (stats.oracleChats >= 50 && !unlockedIds.includes('oracle_50')) newlyUnlocked.push('oracle_50');

    if (stats.loginStreak >= 3 && !unlockedIds.includes('streak_3')) newlyUnlocked.push('streak_3');
    if (stats.loginStreak >= 7 && !unlockedIds.includes('streak_7')) newlyUnlocked.push('streak_7');
    if (stats.loginStreak >= 30 && !unlockedIds.includes('streak_30')) newlyUnlocked.push('streak_30');

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5 && !unlockedIds.includes('night_owl')) newlyUnlocked.push('night_owl');
    if (hour >= 4 && hour < 6 && !unlockedIds.includes('early_bird')) newlyUnlocked.push('early_bird');

    return newlyUnlocked;
};
