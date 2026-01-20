

const CONSUMET_BASE = 'https://api.consumet.org';

const FALLBACK_APIS = [
    'https://api.consumet.org',
    'https://consumet-api.vercel.app'
];

export const STREAMING_SOURCES = {
    GOGOANIME: 'gogoanime',
    ZORO: 'zoro',
    ANIMEPAHE: 'animepahe',
    NINE_ANIME: '9anime'
};

let currentAPI = CONSUMET_BASE;

const fetchWithFallback = async (endpoint, options = {}) => {
    for (const baseUrl of FALLBACK_APIS) {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (response.ok) {
                currentAPI = baseUrl;
                return await response.json();
            }
        } catch (error) {
            console.warn(`Failed to fetch from ${baseUrl}:`, error.message);
        }
    }
    throw new Error('All API endpoints failed');
};

export const searchAnime = async (query, source = STREAMING_SOURCES.GOGOANIME) => {
    try {
        const data = await fetchWithFallback(`/anime/${source}/${encodeURIComponent(query)}`);
        return data.results || [];
    } catch (error) {
        console.error('Search failed:', error);
        return [];
    }
};

export const getAnimeInfo = async (animeId, source = STREAMING_SOURCES.GOGOANIME) => {
    try {
        const data = await fetchWithFallback(`/anime/${source}/info/${animeId}`);
        return data;
    } catch (error) {
        console.error('Failed to get anime info:', error);
        return null;
    }
};

export const getStreamingLinks = async (episodeId, source = STREAMING_SOURCES.GOGOANIME) => {
    try {
        const data = await fetchWithFallback(`/anime/${source}/watch/${episodeId}`);
        return {
            sources: data.sources || [],
            subtitles: data.subtitles || [],
            headers: data.headers || {},
            download: data.download || null
        };
    } catch (error) {
        console.error('Failed to get streaming links:', error);
        return { sources: [], subtitles: [], headers: {} };
    }
};

export const getRecentEpisodes = async (page = 1, source = STREAMING_SOURCES.GOGOANIME) => {
    try {
        const data = await fetchWithFallback(`/anime/${source}/recent-episodes?page=${page}`);
        return data.results || [];
    } catch (error) {
        console.error('Failed to get recent episodes:', error);
        return [];
    }
};

export const getTopAiring = async (page = 1, source = STREAMING_SOURCES.GOGOANIME) => {
    try {
        const data = await fetchWithFallback(`/anime/${source}/top-airing?page=${page}`);
        return data.results || [];
    } catch (error) {
        console.error('Failed to get top airing:', error);
        return [];
    }
};

export const getByGenre = async (genre, page = 1, source = STREAMING_SOURCES.GOGOANIME) => {
    try {
        const data = await fetchWithFallback(`/anime/${source}/genre/${genre}?page=${page}`);
        return data.results || [];
    } catch (error) {
        console.error('Failed to get anime by genre:', error);
        return [];
    }
};

export const getServers = async (episodeId) => {
    try {
        const data = await fetchWithFallback(`/anime/zoro/servers/${episodeId}`);
        return data || [];
    } catch (error) {
        console.error('Failed to get servers:', error);
        return [];
    }
};

export const parseQualities = (sources) => {
    const qualities = {
        '1080p': null,
        '720p': null,
        '480p': null,
        '360p': null,
        'default': null,
        'backup': null
    };

    sources.forEach(source => {
        const quality = source.quality?.toLowerCase() || 'default';
        if (quality.includes('1080')) qualities['1080p'] = source;
        else if (quality.includes('720')) qualities['720p'] = source;
        else if (quality.includes('480')) qualities['480p'] = source;
        else if (quality.includes('360')) qualities['360p'] = source;
        else if (quality === 'default' || quality === 'auto') qualities['default'] = source;
        else if (quality === 'backup') qualities['backup'] = source;
        else if (!qualities['default']) qualities['default'] = source;
    });

    return qualities;
};

export const getBestQuality = (sources) => {
    if (!sources || sources.length === 0) return null;

    const priorityOrder = ['1080', '720', '480', 'default', 'auto'];

    for (const priority of priorityOrder) {
        const source = sources.find(s =>
            s.quality?.toLowerCase().includes(priority)
        );
        if (source) return source;
    }

    return sources[0];
};

export const ANIME_GENRES = [
    'action', 'adventure', 'cars', 'comedy', 'dementia',
    'demons', 'drama', 'ecchi', 'fantasy', 'game',
    'harem', 'historical', 'horror', 'isekai', 'josei',
    'kids', 'magic', 'martial-arts', 'mecha', 'military',
    'music', 'mystery', 'parody', 'police', 'psychological',
    'romance', 'samurai', 'school', 'sci-fi', 'seinen',
    'shoujo', 'shoujo-ai', 'shounen', 'shounen-ai', 'slice-of-life',
    'space', 'sports', 'super-power', 'supernatural', 'thriller',
    'vampire', 'yaoi', 'yuri'
];

export default {
    searchAnime,
    getAnimeInfo,
    getStreamingLinks,
    getRecentEpisodes,
    getTopAiring,
    getByGenre,
    getServers,
    parseQualities,
    getBestQuality,
    STREAMING_SOURCES,
    ANIME_GENRES
};
