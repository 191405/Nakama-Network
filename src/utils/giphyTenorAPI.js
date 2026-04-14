

const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';
const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; 

const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2';
const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';

export const searchGiphy = async (query, limit = 20, offset = 0) => {
    try {
        const response = await fetch(
            `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=pg-13`
        );
        if (!response.ok) throw new Error('Giphy search failed');
        const data = await response.json();
        return data.data.map(gif => ({
            id: gif.id,
            title: gif.title,
            url: gif.images.fixed_height.url,
            preview: gif.images.fixed_height_small.url,
            original: gif.images.original.url,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height,
            source: 'giphy'
        }));
    } catch (error) {
        console.error('Giphy error:', error);
        return [];
    }
};

export const getTrendingGiphy = async (limit = 20) => {
    try {
        const response = await fetch(
            `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`
        );
        if (!response.ok) throw new Error('Giphy trending failed');
        const data = await response.json();
        return data.data.map(gif => ({
            id: gif.id,
            title: gif.title,
            url: gif.images.fixed_height.url,
            preview: gif.images.fixed_height_small.url,
            original: gif.images.original.url,
            source: 'giphy'
        }));
    } catch (error) {
        console.error('Giphy trending error:', error);
        return [];
    }
};

export const searchTenor = async (query, limit = 20) => {
    try {
        const response = await fetch(
            `${TENOR_BASE_URL}/search?key=${TENOR_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&contentfilter=medium`
        );
        if (!response.ok) throw new Error('Tenor search failed');
        const data = await response.json();
        return data.results.map(gif => ({
            id: gif.id,
            title: gif.content_description,
            url: gif.media_formats.gif.url,
            preview: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
            original: gif.media_formats.gif.url,
            source: 'tenor'
        }));
    } catch (error) {
        console.error('Tenor error:', error);
        return [];
    }
};

export const searchAllGifs = async (query, limit = 10) => {
    const [giphyResults, tenorResults] = await Promise.all([
        searchGiphy(query, limit),
        searchTenor(query, limit)
    ]);
    
    const combined = [];
    for (let i = 0; i < Math.max(giphyResults.length, tenorResults.length); i++) {
        if (giphyResults[i]) combined.push(giphyResults[i]);
        if (tenorResults[i]) combined.push(tenorResults[i]);
    }
    return combined;
};

export const ANIME_GIF_CATEGORIES = [
    'anime reaction', 'anime happy', 'anime sad', 'anime angry',
    'anime laugh', 'anime cry', 'anime hug', 'anime wave',
    'anime thumbs up', 'anime facepalm', 'anime shocked'
];

export const gifAPI = {
    searchGiphy,
    getTrendingGiphy,
    searchTenor,
    searchAllGifs,
    ANIME_GIF_CATEGORIES
};

export default gifAPI;
