import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
    appearance: {
        darkMode: true,
        accentColor: 'gold'
    },
    preferences: {
        autoPlayVideos: true,
        dataSaver: false,
        soundEffects: true
    },
    notifications: {
        push: true,
        episodeAlerts: true,
        clanMessages: true,
        dailyProphecy: false,
        weeklyDigest: true
    },
    privacy: {
        onlineStatus: true,
        publicProfile: true,
        activitySharing: true
    }
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { currentUser, isGuest } = useAuth();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);

            if (isGuest) {
                
                const saved = localStorage.getItem('nakama_guest_settings');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        
                        setSettings(prev => ({
                            ...prev,
                            appearance: parsed.appearance || prev.appearance
                        }));
                    } catch (e) {
                        console.error('Failed to parse guest settings:', e);
                    }
                }
                setLoading(false);
                return;
            }

            if (currentUser?.uid) {
                
                try {
                    const response = await fetch(`${API_BASE}/users/${currentUser.uid}/settings`);
                    if (response.ok) {
                        const data = await response.json();
                        setSettings(data);
                        setLastSynced(new Date());
                    } else {
                        
                        console.warn('Could not fetch settings, using defaults');
                    }
                } catch (error) {
                    console.error('Settings fetch error:', error);
                    
                    const saved = localStorage.getItem(`nakama_settings_${currentUser.uid}`);
                    if (saved) {
                        try {
                            setSettings(JSON.parse(saved));
                        } catch (e) { }
                    }
                }
            }

            setLoading(false);
        };

        loadSettings();
    }, [currentUser?.uid, isGuest]);

    const saveSettings = useCallback(async (newSettings) => {
        setSettings(newSettings);

        if (isGuest) {
            
            localStorage.setItem('nakama_guest_settings', JSON.stringify({
                appearance: newSettings.appearance
            }));
            return true;
        }

        if (!currentUser?.uid) return false;

        localStorage.setItem(`nakama_settings_${currentUser.uid}`, JSON.stringify(newSettings));

        setSyncing(true);
        try {
            const response = await fetch(`${API_BASE}/users/${currentUser.uid}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dark_mode: newSettings.appearance.darkMode ? 1 : 0,
                    accent_color: newSettings.appearance.accentColor,
                    auto_play_videos: newSettings.preferences.autoPlayVideos ? 1 : 0,
                    data_saver: newSettings.preferences.dataSaver ? 1 : 0,
                    sound_effects: newSettings.preferences.soundEffects ? 1 : 0,
                    push_notifications: newSettings.notifications.push ? 1 : 0,
                    episode_alerts: newSettings.notifications.episodeAlerts ? 1 : 0,
                    clan_messages: newSettings.notifications.clanMessages ? 1 : 0,
                    daily_prophecy: newSettings.notifications.dailyProphecy ? 1 : 0,
                    weekly_digest: newSettings.notifications.weeklyDigest ? 1 : 0,
                    online_status: newSettings.privacy.onlineStatus ? 1 : 0,
                    public_profile: newSettings.privacy.publicProfile ? 1 : 0,
                    activity_sharing: newSettings.privacy.activitySharing ? 1 : 0
                })
            });

            if (response.ok) {
                setLastSynced(new Date());
                return true;
            }
        } catch (error) {
            console.error('Settings sync error:', error);
        } finally {
            setSyncing(false);
        }

        return false;
    }, [currentUser?.uid, isGuest]);

    const updateCategory = useCallback((category, updates) => {
        const newSettings = {
            ...settings,
            [category]: {
                ...settings[category],
                ...updates
            }
        };
        return saveSettings(newSettings);
    }, [settings, saveSettings]);

    const updateNotifications = useCallback(async (updates) => {
        const newNotifications = { ...settings.notifications, ...updates };

        if (!isGuest && currentUser?.uid) {
            try {
                await fetch(`${API_BASE}/users/${currentUser.uid}/notifications`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        push_notifications: newNotifications.push ? 1 : 0,
                        episode_alerts: newNotifications.episodeAlerts ? 1 : 0,
                        clan_messages: newNotifications.clanMessages ? 1 : 0,
                        daily_prophecy: newNotifications.dailyProphecy ? 1 : 0,
                        weekly_digest: newNotifications.weeklyDigest ? 1 : 0
                    })
                });
            } catch (e) {
                console.error('Notification update error:', e);
            }
        }

        setSettings(prev => ({
            ...prev,
            notifications: newNotifications
        }));
    }, [settings.notifications, currentUser?.uid, isGuest]);

    const updatePrivacy = useCallback(async (updates) => {
        const newPrivacy = { ...settings.privacy, ...updates };

        if (!isGuest && currentUser?.uid) {
            try {
                await fetch(`${API_BASE}/users/${currentUser.uid}/privacy`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        online_status: newPrivacy.onlineStatus ? 1 : 0,
                        public_profile: newPrivacy.publicProfile ? 1 : 0,
                        activity_sharing: newPrivacy.activitySharing ? 1 : 0
                    })
                });
            } catch (e) {
                console.error('Privacy update error:', e);
            }
        }

        setSettings(prev => ({
            ...prev,
            privacy: newPrivacy
        }));
    }, [settings.privacy, currentUser?.uid, isGuest]);

    const toggleDarkMode = useCallback(() => {
        return updateCategory('appearance', { darkMode: !settings.appearance.darkMode });
    }, [settings.appearance.darkMode, updateCategory]);

    const toggleSound = useCallback(() => {
        return updateCategory('preferences', { soundEffects: !settings.preferences.soundEffects });
    }, [settings.preferences.soundEffects, updateCategory]);

    const setAccentColor = useCallback((color) => {
        return updateCategory('appearance', { accentColor: color });
    }, [updateCategory]);

    const resetSettings = useCallback(() => {
        return saveSettings(DEFAULT_SETTINGS);
    }, [saveSettings]);

    const value = {
        settings,
        loading,
        syncing,
        lastSynced,

        saveSettings,
        updateCategory,
        resetSettings,

        updateNotifications,
        updatePrivacy,

        toggleDarkMode,
        toggleSound,
        setAccentColor,

        isDarkMode: settings.appearance.darkMode,
        accentColor: settings.appearance.accentColor,
        soundEnabled: settings.preferences.soundEffects
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
