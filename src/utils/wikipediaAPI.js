

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';
const WIKIPEDIA_SEARCH_API = 'https://en.wikipedia.org/w/api.php';

export const searchWikipedia = async (query, limit = 10) => {
    try {
        const params = new URLSearchParams({
            action: 'opensearch',
            search: query,
            limit: limit.toString(),
            namespace: '0',
            format: 'json',
            origin: '*'
        });

        const response = await fetch(`${WIKIPEDIA_SEARCH_API}?${params}`);
        if (!response.ok) throw new Error('Wikipedia search failed');
        const data = await response.json();

        return data[1]?.map((title, i) => ({
            title,
            description: data[2][i],
            url: data[3][i]
        })) || [];
    } catch (error) {
        console.error('Wikipedia search error:', error);
        return [];
    }
};

export const getSummary = async (title) => {
    try {
        const response = await fetch(`${WIKIPEDIA_API}/page/summary/${encodeURIComponent(title)}`);
        if (!response.ok) throw new Error('Wikipedia summary failed');
        const data = await response.json();

        return {
            title: data.title,
            extract: data.extract,
            description: data.description,
            thumbnail: data.thumbnail?.source,
            originalImage: data.originalimage?.source,
            url: data.content_urls?.desktop?.page
        };
    } catch (error) {
        console.error('Wikipedia summary error:', error);
        return null;
    }
};

export const getArticle = async (title) => {
    try {
        const params = new URLSearchParams({
            action: 'query',
            titles: title,
            prop: 'extracts|pageimages|info',
            inprop: 'url',
            pithumbsize: 500,
            format: 'json',
            origin: '*'
        });

        const response = await fetch(`${WIKIPEDIA_SEARCH_API}?${params}`);
        if (!response.ok) throw new Error('Wikipedia article failed');
        const data = await response.json();

        const pages = data.query?.pages;
        const page = Object.values(pages)[0];

        if (page.pageid < 0) return null;

        return {
            title: page.title,
            extract: page.extract,
            thumbnail: page.thumbnail?.source,
            url: page.fullurl
        };
    } catch (error) {
        console.error('Wikipedia article error:', error);
        return null;
    }
};

export const searchAnimeWiki = async (animeName) => {
    
    let results = await searchWikipedia(`${animeName} (anime)`, 5);
    if (results.length === 0) {
        results = await searchWikipedia(`${animeName} anime`, 5);
    }
    if (results.length === 0) {
        results = await searchWikipedia(animeName, 5);
    }
    return results;
};

export const searchCharacterWiki = async (characterName, animeName = '') => {
    const query = animeName ? `${characterName} ${animeName}` : characterName;
    return await searchWikipedia(query, 5);
};

export const getCharacterInfo = async (name) => {
    try {

        const results = await searchWikipedia(name, 1);

        if (results.length > 0) {
            
            return await getSummary(results[0].title);
        }
        return null;
    } catch (error) {
        console.error('Wiki character info error:', error);
        return null;
    }
};

export const wikipediaAPI = {
    searchWikipedia,
    getSummary,
    getArticle,
    searchAnimeWiki,
    searchCharacterWiki,
    getCharacterInfo
};

export default wikipediaAPI;
