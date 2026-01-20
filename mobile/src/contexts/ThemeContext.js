import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
    dark: {
        mode: 'dark',
        
        bg: '#0f172a',
        bgSecondary: '#1e293b',
        bgCard: 'rgba(30, 41, 59, 0.6)',
        bgCardSolid: '#1e293b',
        bgInput: 'rgba(15, 23, 42, 0.6)',
        bgOverlay: 'rgba(0, 0, 0, 0.5)',

        text: '#fff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        textInverse: '#0f172a',

        border: 'rgba(255, 255, 255, 0.05)',
        borderLight: 'rgba(255, 255, 255, 0.1)',
        borderInput: '#334155',

        primary: '#6366f1',
        primaryLight: '#818cf8',
        secondary: '#8b5cf6',

        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',

        gradientPrimary: ['#6366f1', '#8b5cf6'],
        gradientSecondary: ['#3b82f6', '#6366f1'],
        gradientHeader: ['#1e1b4b', '#0f172a'],
        gradientCard: ['rgba(30, 41, 59, 0.8)', 'rgba(30, 41, 59, 0.6)'],
        
        gradientBg: ['#1e1b4b', '#312e81', '#0f172a'],

        gold: '#fbbf24',
        silver: '#94a3b8',
        bronze: '#cd7f32',
        online: '#22c55e',
        offline: '#64748b',
    },
    light: {
        mode: 'light',
        
        bg: '#fafafa', 
        bgSecondary: '#f4f4f5', 
        bgCard: '#ffffff',
        bgCardSolid: '#ffffff',
        bgInput: '#f1f5f9',
        bgOverlay: 'rgba(0, 0, 0, 0.3)',

        text: '#1c1917', 
        textSecondary: '#57534e', 
        textMuted: '#a8a29e', 
        textInverse: '#ffffff',

        border: '#e5e5e5', 
        borderLight: '#f5f5f5', 
        borderInput: '#d4d4d4', 

        primary: '#6366f1',
        primaryLight: '#818cf8',
        secondary: '#8b5cf6',

        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb',

        gradientPrimary: ['#6366f1', '#8b5cf6'],
        gradientSecondary: ['#3b82f6', '#6366f1'],
        gradientHeader: ['#f8fafc', '#f1f5f9'], 
        gradientCard: ['#ffffff', '#fafafa'],
        
        gradientBg: ['#ffffff', '#f8fafc', '#f1f5f9'], 

        gold: '#eab308',
        silver: '#64748b',
        bronze: '#a16207',
        online: '#16a34a',
        offline: '#94a3b8',
    }
};

export const accentThemes = {
    purple: { primary: '#6366f1', secondary: '#8b5cf6', gradient: ['#6366f1', '#8b5cf6'] },
    blue: { primary: '#3b82f6', secondary: '#06b6d4', gradient: ['#3b82f6', '#06b6d4'] },
    red: { primary: '#ef4444', secondary: '#f97316', gradient: ['#ef4444', '#f97316'] },
    green: { primary: '#10b981', secondary: '#22c55e', gradient: ['#10b981', '#22c55e'] },
    pink: { primary: '#ec4899', secondary: '#f472b6', gradient: ['#ec4899', '#f472b6'] },
};

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true);
    const [accentColor, setAccentColor] = useState('purple');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadThemeSettings();
    }, []);

    const loadThemeSettings = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('themeMode');
            const savedAccent = await AsyncStorage.getItem('accentTheme');

            if (savedMode !== null) {
                setIsDark(savedMode === 'dark');
            }
            if (savedAccent !== null) {
                setAccentColor(savedAccent);
            }
        } catch (e) {
            console.error('Failed to load theme settings:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDark;
        setIsDark(newMode);
        await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    };

    const setThemeMode = async (mode) => {
        const dark = mode === 'dark';
        setIsDark(dark);
        await AsyncStorage.setItem('themeMode', mode);
    };

    const setAccentTheme = async (accent) => {
        setAccentColor(accent);
        await AsyncStorage.setItem('accentTheme', accent);
    };

    const theme = {
        ...themes[isDark ? 'dark' : 'light'],
        accent: accentThemes[accentColor],
    };

    const value = {
        theme,
        isDark,
        accentColor,
        toggleTheme,
        setThemeMode,
        setAccentTheme,
        loading,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
