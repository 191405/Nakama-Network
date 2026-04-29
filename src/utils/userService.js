import { updateUserProfile, uploadProfilePicture, getUserProfile } from './firebase';

/**
 * User Service for Nakama Network
 * Handles profile updates, avatars, and social stats by directly bridging to Firebase
 */
const userService = {
    /**
     * Update user profile (display name, bio, etc.)
     */
    updateProfile: async (user_id, profileData) => {
        try {
            await updateUserProfile(user_id, profileData);
            return { status: 'success', message: 'Profile updated gracefully' };
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    },

    /**
     * Set an anime character from Jikan as avatar
     */
    setAnimeAvatar: async (userId, avatarUrl) => {
        try {
            await updateUserProfile(userId, { avatar_url: avatarUrl });
            return { status: 'success', message: 'Avatar assigned securely' };
        } catch (error) {
            console.error('Avatar selection error:', error);
            throw error;
        }
    },

    /**
     * Upload a custom image file as avatar
     */
    uploadAvatar: async (userId, file) => {
        try {
            const url = await uploadProfilePicture(userId, file);
            await updateUserProfile(userId, { avatar_url: url });
            return { status: 'success', data: { avatar_url: url } };
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
            const profile = await getUserProfile(user_id);
            return profile || null;
        } catch (error) {
            console.error('Fetch progress error:', error);
            return null;
        }
    }
};

export default userService;
