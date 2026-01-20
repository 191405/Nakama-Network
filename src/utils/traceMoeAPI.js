

const TRACE_MOE_BASE_URL = 'https://api.trace.moe';

export const searchByImageUrl = async (imageUrl) => {
    try {
        const response = await fetch(`${TRACE_MOE_BASE_URL}/search?url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) throw new Error('Trace.moe search failed');
        const data = await response.json();

        return data.result?.map(result => ({
            anilistId: result.anilist,
            filename: result.filename,
            episode: result.episode,
            from: result.from,
            to: result.to,
            similarity: (result.similarity * 100).toFixed(1),
            video: result.video,
            image: result.image
        })) || [];
    } catch (error) {
        console.error('Trace.moe URL search error:', error);
        return [];
    }
};

export const searchByImageFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${TRACE_MOE_BASE_URL}/search`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Trace.moe upload search failed');
        const data = await response.json();

        return data.result?.map(result => ({
            anilistId: result.anilist,
            filename: result.filename,
            episode: result.episode,
            from: result.from,
            to: result.to,
            similarity: (result.similarity * 100).toFixed(1),
            video: result.video,
            image: result.image
        })) || [];
    } catch (error) {
        console.error('Trace.moe file search error:', error);
        return [];
    }
};

export const searchByBase64 = async (base64Image) => {
    try {
        const response = await fetch(`${TRACE_MOE_BASE_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        if (!response.ok) throw new Error('Trace.moe base64 search failed');
        const data = await response.json();

        return data.result?.map(result => ({
            anilistId: result.anilist,
            filename: result.filename,
            episode: result.episode,
            from: result.from,
            to: result.to,
            similarity: (result.similarity * 100).toFixed(1),
            video: result.video,
            image: result.image
        })) || [];
    } catch (error) {
        console.error('Trace.moe base64 search error:', error);
        return [];
    }
};

export const getQuota = async () => {
    try {
        const response = await fetch(`${TRACE_MOE_BASE_URL}/me`);
        if (!response.ok) throw new Error('Failed to get quota');
        return await response.json();
    } catch (error) {
        console.error('Trace.moe quota error:', error);
        return null;
    }
};

export const traceMoeAPI = {
    searchByImageUrl,
    searchByImageFile,
    searchByBase64,
    getQuota
};

export default traceMoeAPI;
