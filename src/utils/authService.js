
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

            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Network error. The Network is currently experiencing heavy traffic. Please try again.');
            }
            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || data.detail || 'Registration failed');
            }

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

            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Network error. The Network is currently experiencing heavy traffic. Please try again.');
            }
            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || data.detail || 'Login failed');
            }

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

            const data = await response.json();
            if (!response.ok || data.status === 'error') {
                if (response.status === 401 || (data.error && data.error.code === 'UNAUTHORIZED')) {
                    authService.logout();
                }
                return null;
            }

            return data;
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
        // Handle standard api_response structure
        const actualData = data.data || data;
        
        if (actualData.tokens?.access_token) {
            localStorage.setItem('nk_token', actualData.tokens.access_token);
        }
        if (actualData.tokens?.refresh_token) {
            localStorage.setItem('nk_refresh_token', actualData.tokens.refresh_token);
        }
        if (actualData.user) {
            localStorage.setItem('nk_user', JSON.stringify(actualData.user));
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
            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || data.detail || 'Failed to send reset email');
            }
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
            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || data.detail || 'Failed to reset password');
            }
            return data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    /**
     * Send announcement email via backend
     */
    sendAnnouncement: async (email, displayName, subject, message) => {
        const response = await fetch(`${API_BASE_URL}/auth/announcement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, display_name: displayName, subject, message })
        });
        const data = await response.json();
        if (!response.ok || data.status === 'error') {
            throw new Error(data.message || 'Failed to send announcement');
        }
        return data;
    },

    getToken: () => localStorage.getItem('nk_token'),
    getUser: () => {
        const user = localStorage.getItem('nk_user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;
