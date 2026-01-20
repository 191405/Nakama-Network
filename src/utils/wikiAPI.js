

const wikiCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; 

export const fetchWikipediaSummary = async (searchTerm) => {
    const cacheKey = `wiki_${searchTerm}`;

    const cached = wikiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm + ' anime')}&format=json&origin=*`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.query?.search?.length) {
            return null;
        }

        const pageTitle = searchData.query.search[0].title;

        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryResponse = await fetch(summaryUrl);

        if (!summaryResponse.ok) {
            throw new Error('Wikipedia summary not found');
        }

        const summaryData = await summaryResponse.json();

        const result = {
            title: summaryData.title,
            summary: summaryData.extract,
            image: summaryData.thumbnail?.source || null,
            url: summaryData.content_urls?.desktop?.page || null,
            source: 'Wikipedia'
        };

        wikiCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    } catch (error) {
        console.warn('Wikipedia fetch failed:', error);
        return null;
    }
};

export const fetchVSBattlesTier = async (characterName) => {
    const cacheKey = `vsb_${characterName}`;

    const cached = wikiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        
        const searchUrl = `https://vsbattles.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(characterName)}&format=json&origin=*`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.query?.search?.length) {
            return getFallbackTier(characterName);
        }

        const pageTitle = searchData.query.search[0].title;

        const contentUrl = `https://vsbattles.fandom.com/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&origin=*`;
        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();

        if (!contentData.parse?.text?.['*']) {
            return getFallbackTier(characterName);
        }

        const htmlContent = contentData.parse.text['*'];
        const tierInfo = extractTierFromHTML(htmlContent);

        const result = {
            name: characterName,
            pageTitle,
            tier: tierInfo.tier,
            tierName: tierInfo.tierName,
            attackPotency: tierInfo.attackPotency,
            speed: tierInfo.speed,
            durability: tierInfo.durability,
            url: `https://vsbattles.fandom.com/wiki/${encodeURIComponent(pageTitle)}`,
            source: 'VS Battles Wiki'
        };

        wikiCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    } catch (error) {
        console.warn('VS Battles fetch failed:', error);
        return getFallbackTier(characterName);
    }
};

const extractTierFromHTML = (html) => {
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let tier = 'Unknown';
    let tierName = 'Unknown';
    let attackPotency = 'Unknown';
    let speed = 'Unknown';
    let durability = 'Unknown';

    try {
        
        const text = doc.body?.textContent || '';

        const tierMatch = text.match(/Tier:\s*([\d\-]+[\-A-Za-z]*)/);
        if (tierMatch) {
            tier = tierMatch[1].trim();
            tierName = getTierName(tier);
        }

        const apMatch = text.match(/Attack Potency:\s*([^|]+?)(?=\||Speed:|$)/);
        if (apMatch) {
            attackPotency = apMatch[1].trim().substring(0, 100);
        }

        const speedMatch = text.match(/Speed:\s*([^|]+?)(?=\||Lifting|$)/);
        if (speedMatch) {
            speed = speedMatch[1].trim().substring(0, 100);
        }

        const durabilityMatch = text.match(/Durability:\s*([^|]+?)(?=\||Stamina|$)/);
        if (durabilityMatch) {
            durability = durabilityMatch[1].trim().substring(0, 100);
        }
    } catch (e) {
        console.warn('Error parsing VS Battles HTML:', e);
    }

    return { tier, tierName, attackPotency, speed, durability };
};

const getTierName = (tierCode) => {
    const tierNames = {
        '0': 'Boundless',
        '1-A': 'Outerversal',
        '1-B': 'Hyperversal',
        '1-C': 'Complex Multiversal',
        '2-A': 'Multiverse Level+',
        '2-B': 'Multiverse Level',
        '2-C': 'Low Multiverse Level',
        '3-A': 'Universe Level',
        '3-B': 'Multi-Galaxy Level',
        '3-C': 'Galaxy Level',
        '4-A': 'Multi-Solar System Level',
        '4-B': 'Solar System Level',
        '4-C': 'Star Level',
        '5-A': 'Large Planet Level',
        '5-B': 'Planet Level',
        '5-C': 'Moon Level',
        '6-A': 'Continent Level',
        '6-B': 'Country Level',
        '6-C': 'Island Level',
        '7-A': 'Mountain Level',
        '7-B': 'City Level',
        '7-C': 'Town Level',
        '8-A': 'Multi-City Block Level',
        '8-B': 'City Block Level',
        '8-C': 'Building Level',
        '9-A': 'Small Building Level',
        '9-B': 'Wall Level',
        '9-C': 'Street Level',
        '10-A': 'Athlete Level',
        '10-B': 'Human Level',
        '10-C': 'Below Average Human'
    };

    const baseTier = tierCode.split(' ')[0].trim();
    return tierNames[baseTier] || tierCode;
};

const getFallbackTier = (characterName) => {
    const fallbackTiers = {
        'goku': { tier: '2-C', tierName: 'Low Multiverse Level', attackPotency: 'Low Multiverse level', speed: 'Massively FTL+', durability: 'Low Multiverse level' },
        'naruto': { tier: '5-B', tierName: 'Planet Level', attackPotency: 'Planet level', speed: 'Sub-Relativistic+', durability: 'Planet level' },
        'luffy': { tier: '6-A', tierName: 'Continent Level', attackPotency: 'Continent level', speed: 'Relativistic+', durability: 'Continent level' },
        'ichigo': { tier: '5-B', tierName: 'Planet Level', attackPotency: 'Planet level', speed: 'Massively FTL+', durability: 'Planet level' },
        'saitama': { tier: '2-C', tierName: 'Low Multiverse Level', attackPotency: 'At least Low Multiverse level', speed: 'Massively FTL+', durability: 'At least Low Multiverse level' },
        'gojo': { tier: '6-A', tierName: 'Continent Level', attackPotency: 'At least Continent level', speed: 'Massively Hypersonic+', durability: 'At least Continent level' },
        'madara': { tier: '5-C', tierName: 'Moon Level', attackPotency: 'Moon level', speed: 'Massively Hypersonic+', durability: 'Moon level' },
        'aizen': { tier: '5-B', tierName: 'Planet Level', attackPotency: 'Planet level', speed: 'Massively FTL+', durability: 'Planet level' },
        'vegeta': { tier: '2-C', tierName: 'Low Multiverse Level', attackPotency: 'Low Multiverse level', speed: 'Massively FTL+', durability: 'Low Multiverse level' },
        'zoro': { tier: '6-B', tierName: 'Country Level', attackPotency: 'Country level', speed: 'Relativistic+', durability: 'Country level' }
    };

    const key = characterName.toLowerCase().trim();
    const match = Object.keys(fallbackTiers).find(k => key.includes(k));

    if (match) {
        return {
            name: characterName,
            ...fallbackTiers[match],
            url: null,
            source: 'Fallback Database'
        };
    }

    return {
        name: characterName,
        tier: 'Unknown',
        tierName: 'Data Unavailable',
        attackPotency: 'Unknown',
        speed: 'Unknown',
        durability: 'Unknown',
        url: null,
        source: 'None'
    };
};

export const fetchAnimeInfo = async (animeName) => {
    
    let result = await fetchWikipediaSummary(animeName);

    if (result) {
        return result;
    }

    return {
        title: animeName,
        summary: 'Information not available.',
        image: null,
        url: null,
        source: 'Not Found'
    };
};

export const fetchCharacterInfo = async (characterName, animeName = '') => {
    
    const [wikiInfo, tierInfo] = await Promise.all([
        fetchWikipediaSummary(`${characterName} ${animeName}`),
        fetchVSBattlesTier(characterName)
    ]);

    return {
        name: characterName,
        anime: animeName,
        summary: wikiInfo?.summary || 'No information available.',
        image: wikiInfo?.image || null,
        wikiUrl: wikiInfo?.url || null,
        tier: tierInfo?.tier || 'Unknown',
        tierName: tierInfo?.tierName || 'Unknown',
        attackPotency: tierInfo?.attackPotency || 'Unknown',
        speed: tierInfo?.speed || 'Unknown',
        durability: tierInfo?.durability || 'Unknown',
        vsBattlesUrl: tierInfo?.url || null,
        sources: [wikiInfo?.source, tierInfo?.source].filter(Boolean)
    };
};

export const clearWikiCache = () => {
    wikiCache.clear();
};

export default {
    fetchWikipediaSummary,
    fetchVSBattlesTier,
    fetchAnimeInfo,
    fetchCharacterInfo,
    clearWikiCache
};
