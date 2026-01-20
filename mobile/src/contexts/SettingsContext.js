import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { userProfile, isGuest } = useAuth();
    const { isDark, accentColor } = useTheme(); 

    const [notifications, setNotifications] = useState({
        pushEnabled: true,
        episodeAlerts: true,
        clanMessages: true,
        dailyProphecy: false,
        weeklyDigest: true
    });

    const [privacy, setPrivacy] = useState({
        onlineStatus: true,
        profilePublic: true,
        activitySharing: true
    });

    const [preferences, setPreferences] = useState({
        autoPlayVideos: true,
        dataSaver: false,
        soundEffects: true,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (!isGuest && userProfile?.uid) {
            syncFromBackend(userProfile.uid);
        }
    }, [isGuest, userProfile?.uid]);

    const loadSettings = async () => {
        try {
            const savedNotifs = await AsyncStorage.getItem('notificationSettings');
            const savedPrivacy = await AsyncStorage.getItem('privacySettings');
            const savedPrefs = await AsyncStorage.getItem('appPreferences');

            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
            if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
            if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
            console.error('Failed to load local settings:', e);
        } finally {
            setLoading(false);
        }
    };

    const syncFromBackend = async (uid) => {
        try {
            const remoteSettings = await api.safeRequest(`/users/${uid}/settings`, {}, null);

        } catch (e) {
            console.log("Failed to fetch remote settings");
        }
    };

    const syncToBackend = async (category, data) => {
        if (isGuest || !userProfile?.uid) return;
        try {
            let payload = {};
            if (category === 'notifications') payload = { ...notifications, ...data };
            if (category === 'privacy') payload = { ...privacy, ...data };
            if (category === 'preferences') payload = { ...preferences, ...data };

            await api.request(`/users/${userProfile.uid}/settings`, {
                method: 'PUT',
                body: JSON.stringify({ category, settings: payload })
            }, { silent: true });
        } catch (e) {
            console.log("Failed to sync settings to backend (background)");
        }
    };

    const updateNotification = async (key, value) => {
        const updated = { ...notifications, [key]: value };
        setNotifications(updated);
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(updated));
        syncToBackend('notifications', { [key]: value });
    };

    const updatePrivacy = async (key, value) => {
        const updated = { ...privacy, [key]: value };
        setPrivacy(updated);
        await AsyncStorage.setItem('privacySettings', JSON.stringify(updated));
        syncToBackend('privacy', { [key]: value });
    };

    const updatePreference = async (key, value) => {
        const updated = { ...preferences, [key]: value };
        setPreferences(updated);
        await AsyncStorage.setItem('appPreferences', JSON.stringify(updated));
        syncToBackend('preferences', { [key]: value });
    };

    const value = {
        notifications,
        privacy,
        preferences,
        loading,
        updateNotification,
        updatePrivacy,
        updatePreference
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
