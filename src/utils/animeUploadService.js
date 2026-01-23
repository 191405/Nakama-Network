

import { collection, doc, setDoc, addDoc, getDocs, getDoc, query, where, orderBy, limit, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export const MAX_FILE_SIZE_MB = 350;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/x-matroska'];
export const QUALITY_OPTIONS = ['1080p', '720p', '480p'];

export const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export const validateVideoFile = (file) => {
    const errors = [];

    if (!file) {
        errors.push('No file selected');
        return { valid: false, errors };
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        errors.push(`Invalid file type. Allowed: MP4, WebM, MKV`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// UPDATED: Now uses backend API (IONOS SFTP) instead of Firebase Storage
export const uploadEpisodeVideo = async (file, animeId, episodeNumber, quality, onProgress = () => { }) => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
    }

    // Use backend API for video upload (routes to IONOS SFTP)
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('anime_id', animeId);
    formData.append('anime_title', `Anime ${animeId}`);
    formData.append('episode_number', episodeNumber);
    formData.append('quality', quality);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.video_url);
                } catch (e) {
                    reject(new Error('Invalid response from server'));
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `${API_BASE_URL}/episodes/upload`);
        xhr.send(formData);
    });
};

export const createAnimeEntry = async (animeData, userId) => {
    const slug = animeData.id || generateSlug(animeData.title);

    const animeDoc = {
        id: slug,
        malId: animeData.malId || null,
        title: animeData.title,
        titleJapanese: animeData.titleJapanese || '',
        titleEnglish: animeData.titleEnglish || '',
        coverImage: animeData.coverImage || '',
        bannerImage: animeData.bannerImage || '',
        synopsis: animeData.synopsis || '',
        genres: animeData.genres || [],
        status: 'published',
        totalEpisodes: animeData.totalEpisodes || 0,
        uploadedBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'anime', slug), animeDoc, { merge: true });
    return slug;
};

export const addEpisode = async (animeId, episodeData, userId) => {
    const episodeId = `ep-${String(episodeData.number).padStart(3, '0')}`;

    const episodeDoc = {
        id: episodeId,
        number: episodeData.number,
        title: episodeData.title || `Episode ${episodeData.number}`,
        thumbnail: episodeData.thumbnail || '',
        videos: episodeData.videos || {},
        duration: episodeData.duration || 0,
        uploadedBy: userId,
        createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'anime', animeId, 'episodes', episodeId), episodeDoc);

    const animeRef = doc(db, 'anime', animeId);
    const animeSnap = await getDoc(animeRef);
    if (animeSnap.exists()) {
        const currentCount = animeSnap.data().uploadedEpisodes || 0;
        await updateDoc(animeRef, {
            uploadedEpisodes: currentCount + 1,
            updatedAt: serverTimestamp()
        });
    }

    return episodeId;
};

export const getAllAnime = async (limitCount = 20) => {
    const animeRef = collection(db, 'anime');
    const q = query(animeRef, where('status', '==', 'published'), orderBy('updatedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const getAnimeWithEpisodes = async (animeId) => {
    const animeRef = doc(db, 'anime', animeId);
    const animeSnap = await getDoc(animeRef);

    if (!animeSnap.exists()) return null;

    const anime = { id: animeSnap.id, ...animeSnap.data() };

    const episodesRef = collection(db, 'anime', animeId, 'episodes');
    const episodesSnap = await getDocs(query(episodesRef, orderBy('number', 'asc')));

    anime.episodes = episodesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return anime;
};

export const getEpisode = async (animeId, episodeId) => {
    const episodeRef = doc(db, 'anime', animeId, 'episodes', episodeId);
    const episodeSnap = await getDoc(episodeRef);

    if (!episodeSnap.exists()) return null;

    return { id: episodeSnap.id, ...episodeSnap.data() };
};

export const searchAnime = async (searchTerm) => {
    const all = await getAllAnime(100);
    const lowerSearch = searchTerm.toLowerCase();

    return all.filter(anime =>
        anime.title?.toLowerCase().includes(lowerSearch) ||
        anime.titleEnglish?.toLowerCase().includes(lowerSearch) ||
        anime.titleJapanese?.includes(searchTerm)
    );
};

export const saveWatchProgress = async (userId, animeId, episodeId, timestamp) => {
    const progressRef = doc(db, 'users', userId, 'watchHistory', `${animeId}-${episodeId}`);
    await setDoc(progressRef, {
        animeId,
        episodeId,
        timestamp,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const getWatchProgress = async (userId, animeId, episodeId) => {
    const progressRef = doc(db, 'users', userId, 'watchHistory', `${animeId}-${episodeId}`);
    const snap = await getDoc(progressRef);
    return snap.exists() ? snap.data().timestamp : 0;
};

export default {
    uploadEpisodeVideo,
    createAnimeEntry,
    addEpisode,
    getAllAnime,
    getAnimeWithEpisodes,
    getEpisode,
    searchAnime,
    saveWatchProgress,
    getWatchProgress,
    validateVideoFile,
    generateSlug,
    MAX_FILE_SIZE_MB,
    QUALITY_OPTIONS
};
