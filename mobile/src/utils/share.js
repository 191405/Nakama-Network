import { Share } from 'react-native';

const NAKAMA_URL = 'https://nakamanetwork.com'; 
const HASHTAG = '#NakamaNetwork';

export const shareContent = async ({
    title,
    message,
    url,
    attribution
}) => {
    try {
        
        let shareMessage = '';

        if (title) shareMessage += `📺 ${title}\n\n`;
        if (message) shareMessage += `"${message}"\n`;
        if (attribution) shareMessage += `— ${attribution}\n\n`;

        shareMessage += `Discover more on Nakama Network 🎌\n${url || NAKAMA_URL}\n${HASHTAG}`;

        const result = await Share.share({
            message: shareMessage,
            url: url || NAKAMA_URL, 
            title: title || 'Nakama Network'
        });

        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                
            } else {
                
            }
        } else if (result.action === Share.dismissedAction) {
            
        }
    } catch (error) {
        console.error('Error sharing content:', error);
    }
};

export const shareAnime = async (anime) => {
    await shareContent({
        title: anime.title,
        message: anime.synopsis ? `${anime.synopsis.substring(0, 100)}...` : null,
        url: `https://nakamanetwork.com/anime/${anime.id}`,
        attribution: `Ranked #${anime.rank || 'N/A'}`
    });
};

export const shareQuote = async (quote) => {
    await shareContent({
        message: quote.quote,
        attribution: `${quote.character} (${quote.anime})`,
    });
};
