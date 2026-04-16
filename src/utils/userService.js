const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nakama-network-api.onrender.com';
import authService from './authService';

/**
 * User Service for Nakama Network
 * Handles profile updates, avatars, and social stats
 */
const userService = {
    /**
     * Update user profile (display name, bio, etc.)
     */
    updateProfile: async (user_id, profileData) => {
        const token = authService.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}/users/${user_id}/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            if (!response.ok || data.status === 'error') throw new Error(data.message || 'Update failed');
            return data;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    },

    /**
     * Set an anime character from Jikan as avatar
     */
    setAnimeAvatar: async (avatarUrl) => {
        const token = authService.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/avatar/selection`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar_url: avatarUrl })
            });

            const data = await response.json();
            if (!response.ok || data.status === 'error') throw new Error(data.message || 'Avatar selection failed');
            return data;
        } catch (error) {
            console.error('Avatar selection error:', error);
            throw error;
        }
    },

    /**
     * Upload a custom image file as avatar
     */
    uploadAvatar: async (file) => {
        const token = authService.getToken();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/users/me/avatar/upload`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok || data.status === 'error') throw new Error(data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Avatar upload error:', error);
            throw error;
        }
    },

    /**
     * Get user progress (rank, chakra, etc.)
     */
    getProgress: async (user_id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${user_id}/progress`);
            const data = await response.json();
            return data.data || data;
        } catch (error) {
            console.error('Fetch progress error:', error);
            return null;
        }
    }
};

export default userService;
