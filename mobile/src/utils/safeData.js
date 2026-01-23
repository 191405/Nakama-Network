/**
 * Utility functions for safe data handling in the mobile app
 */

/**
 * Safely extract string from value that might be string or object
 * Handles cases where API returns {title: "..."} instead of just "..."
 */
export const safeString = (value, fallback = '') => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
        return value.title || value.name || value.text || String(value) || fallback;
    }
    return String(value);
};

/**
 * Safely get anime title from anime object
 */
export const getAnimeTitle = (anime, fallback = 'Unknown Anime') => {
    if (!anime) return fallback;
    if (typeof anime.title === 'string') return anime.title;
    if (typeof anime.title === 'object') {
        return anime.title.title || anime.title.name || anime.title.english || anime.title.romaji || fallback;
    }
    return anime.name || fallback;
};

/**
 * Safely get character name from character object
 */
export const getCharacterName = (character, fallback = 'Unknown Character') => {
    if (!character) return fallback;
    if (typeof character.name === 'string') return character.name;
    if (typeof character.name === 'object') {
        return character.name.full || character.name.first || character.name.name || fallback;
    }
    return character.title || fallback;
};

/**
 * Safely get user display name
 */
export const getDisplayName = (user, fallback = 'Shinobi') => {
    if (!user) return fallback;
    if (typeof user.displayName === 'string') return user.displayName;
    if (typeof user.displayName === 'object') {
        return user.displayName.name || user.displayName.displayName || fallback;
    }
    if (typeof user.name === 'string') return user.name;
    return fallback;
};

/**
 * Ensure value is a valid number
 */
export const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};

export default {
    safeString,
    getAnimeTitle,
    getCharacterName,
    getDisplayName,
    safeNumber,
};
