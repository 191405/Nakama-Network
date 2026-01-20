

const IMGFLIP_API = 'https://api.imgflip.com';

export const getMemeTemplates = async () => {
    try {
        const response = await fetch(`${IMGFLIP_API}/get_memes`);
        if (!response.ok) throw new Error('Failed to get meme templates');
        const data = await response.json();

        if (!data.success) throw new Error(data.error_message);

        return data.data.memes.map(meme => ({
            id: meme.id,
            name: meme.name,
            url: meme.url,
            width: meme.width,
            height: meme.height,
            boxCount: meme.box_count
        }));
    } catch (error) {
        console.error('Imgflip templates error:', error);
        return [];
    }
};

export const createMeme = async (templateId, topText, bottomText) => {

    const templates = await getMemeTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) return null;

    return {
        template,
        captions: {
            top: topText,
            bottom: bottomText
        },
        
        preview: {
            url: template.url,
            topText,
            bottomText
        }
    };
};

export const ANIME_MEME_IDS = [
    '181913649', 
    '87743020',  
    '112126428', 
    '438680',    
    '93895088',  
    '124822590', 
    '247375501', 
    '222403160', 
];

export const getAnimeMemeTemplates = async () => {
    const allTemplates = await getMemeTemplates();
    
    return allTemplates.slice(0, 50);
};

export const imgflipAPI = {
    getMemeTemplates,
    createMeme,
    getAnimeMemeTemplates,
    ANIME_MEME_IDS
};

export default imgflipAPI;
