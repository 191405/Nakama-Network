
export const RANKS = [
    { name: 'Wanderer', minChakra: 0 },
    { name: 'Net Disciple', minChakra: 100 },
    { name: 'Net Adept', minChakra: 500 },
    { name: 'Net Elite', minChakra: 2000 },
    { name: 'Net Master', minChakra: 10000 },
    { name: 'Overseer', minChakra: 50000 },
];

export const getRankForChakra = (chakra) => {
    let currentRank = RANKS[0].name;
    for (const rank of RANKS) {
        if (chakra >= rank.minChakra) {
            currentRank = rank.name;
        } else {
            break;
        }
    }
    return currentRank;
};

export const calculateNextRankProgress = (chakra) => {
    let nextRank = null;
    let currentRankObj = RANKS[0];

    for (let i = 0; i < RANKS.length; i++) {
        if (chakra >= RANKS[i].minChakra) {
            currentRankObj = RANKS[i];
            if (i + 1 < RANKS.length) {
                nextRank = RANKS[i + 1];
            }
        } else {
            break;
        }
    }

    if (!nextRank) return 100; 

    const totalNeeded = nextRank.minChakra - currentRankObj.minChakra;
    const currentProgress = chakra - currentRankObj.minChakra;

    return Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));
};

export const CHAKRA_REWARDS = {
    TRIVIA_CORRECT: 10,
    TRIVIA_STREAK_BONUS: 5,
    DAILY_LOGIN: 50,
    WATCHLIST_ADD: 5,
};
