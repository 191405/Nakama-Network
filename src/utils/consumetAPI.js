

const ANBUANIME_BASE = 'https://anbuanimeapi.vercel.app';

const CONSUMET_BASE_URL = 'https://api.consumet.org';

export const PROVIDERS = {
    GOGOANIME: 'gogoanime',
    ZORO: 'zoro',
    ANIMEPAHE: 'animepahe',
    NINEANIME: '9anime'
};

export const searchAnime = async (query, provider = PROVIDERS.GOGOANIME) => {
    try {
        const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Consumet search error:', error);
        return [];
    }
};

export const getAnimeInfo = async (id, provider = PROVIDERS.GOGOANIME) => {
    try {
        const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/info/${id}`);
        if (!response.ok) throw new Error('Failed to get anime info');
        return await response.json();
    } catch (error) {
        console.error('Consumet info error:', error);
        return null;
    }
};

export const getStreamingLinks = async (episodeId, provider = PROVIDERS.GOGOANIME) => {
    try {
        const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/watch/${episodeId}`);
        if (!response.ok) throw new Error('Failed to get streaming links');
        const data = await response.json();
        return {
            sources: data.sources || [],
            subtitles: data.subtitles || [],
            download: data.download || null
        };
    } catch (error) {
        console.error('Consumet streaming error:', error);
        return { sources: [], subtitles: [], download: null };
    }
};

export const getRecentEpisodes = async (provider = PROVIDERS.GOGOANIME, page = 1) => {
    
    try {
        const response = await fetch(`${ANBUANIME_BASE}/recent?page=${page}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) return data;
        }
    } catch (error) {
        console.warn('Anbuanime recent failed, trying Consumet:', error);
    }

    try {
        const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/recent-episodes?page=${page}`);
        if (!response.ok) throw new Error('Failed to get recent episodes');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Consumet recent error:', error);
        return [];
    }
};

export const getTopAiring = async (provider = PROVIDERS.GOGOANIME, page = 1) => {
    
    try {
        const response = await fetch(`${ANBUANIME_BASE}/popular?page=${page}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) return data;
        }
    } catch (error) {
        console.warn('Anbuanime popular failed, trying Consumet:', error);
    }

    try {
        const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/top-airing?page=${page}`);
        if (!response.ok) throw new Error('Failed to get top airing');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Consumet top airing error:', error);
        return [];
    }
};

export const getDownloadLinks = async (episodeId, provider = PROVIDERS.GOGOANIME) => {
    try {
        const streamData = await getStreamingLinks(episodeId, provider);
        const links = [];

        if (streamData.sources && streamData.sources.length > 0) {
            for (const source of streamData.sources) {
                const qualityLabel = source.quality || 'auto';
                const isHls = source.url?.includes('.m3u8');
                links.push({
                    url: source.url,
                    quality: qualityLabel,
                    type: isHls ? 'hls' : 'mp4',
                    isBackup: source.isBackup || false
                });
            }
        }

        if (streamData.download) {
            links.unshift({
                url: streamData.download,
                quality: 'Direct Download',
                type: 'direct',
                isBackup: false
            });
        }

        const qualityOrder = ['1080p', '720p', '480p', '360p', 'auto', 'Direct Download'];
        links.sort((a, b) => {
            let aIndex = qualityOrder.findIndex(q => a.quality.toLowerCase().includes(q.toLowerCase().replace('p', '')));
            let bIndex = qualityOrder.findIndex(q => b.quality.toLowerCase().includes(q.toLowerCase().replace('p', '')));
            if (aIndex === -1) aIndex = qualityOrder.length;
            if (bIndex === -1) bIndex = qualityOrder.length;
            return aIndex - bIndex;
        });

        return links;
    } catch (error) {
        console.error('Failed to get download links:', error);
        return [];
    }
};

export const consumetAPI = {
    searchAnime,
    getAnimeInfo,
    getStreamingLinks,
    getRecentEpisodes,
    getTopAiring,
    getDownloadLinks,
    PROVIDERS
};

export default consumetAPI;
