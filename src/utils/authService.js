
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nakama-network-api.onrender.com';

/**
 * Custom Authentication Service for Nakama Network
 * Connects to the local FastAPI backend on Render
 */
const authService = {
    /**
     * Register a new user
     */
    register: async (email, password, displayName) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, display_name: displayName })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Registration failed');

            // Store tokens
            authService.saveAuthData(data);
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    /**
     * Login an existing user
     */
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Login failed');

            // Store tokens
            authService.saveAuthData(data);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Get current user profile from token
     */
    getMe: async () => {
        const token = authService.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) authService.logout();
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch me error:', error);
            return null;
        }
    },

    /**
     * Logout and clear storage
     */
    logout: () => {
        localStorage.removeItem('nk_token');
        localStorage.removeItem('nk_refresh_token');
        localStorage.removeItem('nk_user');
    },

    /**
     * Helper to save auth data
     */
    saveAuthData: (data) => {
        if (data.tokens?.access_token) {
            localStorage.setItem('nk_token', data.tokens.access_token);
        }
        if (data.tokens?.refresh_token) {
            localStorage.setItem('nk_refresh_token', data.tokens.refresh_token);
        }
        if (data.user) {
            localStorage.setItem('nk_user', JSON.stringify(data.user));
        }
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to send reset email');
            return data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    /**
     * Reset password using token
     */
    resetPassword: async (token, newPassword) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password?token=${token}&new_password=${encodeURIComponent(newPassword)}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to reset password');
            return data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    getToken: () => localStorage.getItem('nk_token'),
    getUser: () => {
        const user = localStorage.getItem('nk_user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;
