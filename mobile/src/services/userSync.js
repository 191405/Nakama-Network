

import { db, auth } from '../utils/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { getWatchlist, getStats, getUnlockedAchievements, getSavedQuotes } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCurrentUserId = () => auth.currentUser?.uid;

export const uploadWatchlist = async () => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const localWatchlist = await getWatchlist();
        await setDoc(doc(db, 'users', userId), {
            watchlist: localWatchlist,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Failed to upload watchlist:', error);
        return false;
    }
};

export const downloadWatchlist = async () => {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
            return docSnap.data().watchlist || [];
        }
        return [];
    } catch (error) {
        console.error('Failed to download watchlist:', error);
        return null;
    }
};

export const addToCloudWatchlist = async (anime) => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        await updateDoc(doc(db, 'users', userId), {
            watchlist: arrayUnion({
                ...anime,
                addedAt: new Date().toISOString(),
            }),
        });
        return true;
    } catch (error) {
        console.error('Failed to add to cloud watchlist:', error);
        return false;
    }
};

export const removeFromCloudWatchlist = async (animeId) => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const watchlist = await downloadWatchlist();
        const updatedList = watchlist.filter(a => a.id !== animeId);
        await setDoc(doc(db, 'users', userId), {
            watchlist: updatedList,
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Failed to remove from cloud watchlist:', error);
        return false;
    }
};

export const uploadStats = async () => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const localStats = await getStats();
        await setDoc(doc(db, 'users', userId), {
            stats: localStats,
            statsUpdatedAt: new Date().toISOString(),
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Failed to upload stats:', error);
        return false;
    }
};

export const downloadStats = async () => {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
            return docSnap.data().stats || {};
        }
        return {};
    } catch (error) {
        console.error('Failed to download stats:', error);
        return null;
    }
};

export const uploadAchievements = async () => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const localAchievements = await getUnlockedAchievements();
        await setDoc(doc(db, 'users', userId), {
            achievements: localAchievements,
            achievementsUpdatedAt: new Date().toISOString(),
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Failed to upload achievements:', error);
        return false;
    }
};

export const downloadAchievements = async () => {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
            return docSnap.data().achievements || [];
        }
        return [];
    } catch (error) {
        console.error('Failed to download achievements:', error);
        return null;
    }
};

export const syncToCloud = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('No user logged in, skipping cloud sync');
        return false;
    }

    try {
        await Promise.all([
            uploadWatchlist(),
            uploadStats(),
            uploadAchievements(),
        ]);
        console.log('Cloud sync complete');
        return true;
    } catch (error) {
        console.error('Cloud sync failed:', error);
        return false;
    }
};

export const syncFromCloud = async () => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const [watchlist, stats, achievements] = await Promise.all([
            downloadWatchlist(),
            downloadStats(),
            downloadAchievements(),
        ]);

        if (watchlist) {
            await AsyncStorage.setItem('@nakama_watchlist', JSON.stringify(watchlist));
        }
        if (stats) {
            await AsyncStorage.setItem('@nakama_stats', JSON.stringify(stats));
        }
        if (achievements) {
            await AsyncStorage.setItem('@nakama_achievements', JSON.stringify(achievements));
        }

        console.log('Local sync from cloud complete');
        return true;
    } catch (error) {
        console.error('Failed to sync from cloud:', error);
        return false;
    }
};

export const subscribeToUserData = (callback) => {
    const userId = getCurrentUserId();
    if (!userId) return null;

    return onSnapshot(doc(db, 'users', userId), (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};
