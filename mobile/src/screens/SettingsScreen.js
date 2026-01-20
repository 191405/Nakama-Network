import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, Palette, Bell, Shield, Trash2, Info, ChevronRight, User, Globe, Wifi, WifiOff, Eye, EyeOff, Database, Star, MessageCircle, Download, HelpCircle, Mail, Lock, Volume2, VolumeX, Play, Moon, Sun, LogOut, Edit3 } from 'lucide-react-native';
import { getTheme, setTheme as saveTheme } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import api from '../services/api';

const THEMES = [
    { id: 'purple', name: 'Royal', colors: ['#6366f1', '#8b5cf6'] },
    { id: 'blue', name: 'Ocean', colors: ['#3b82f6', '#06b6d4'] },
    { id: 'red', name: 'Crimson', colors: ['#ef4444', '#f97316'] },
    { id: 'green', name: 'Emerald', colors: ['#10b981', '#22c55e'] },
    { id: 'pink', name: 'Sakura', colors: ['#ec4899', '#f472b6'] },
];

export default function SettingsScreen({ navigation }) {
    const { userProfile, isGuest, logout } = useAuth();
    const { theme, isDark, toggleTheme, accentColor, setAccentTheme } = useTheme();
    const { notifications, privacy, preferences, loading: settingsLoading, updateNotification, updatePrivacy, updatePreference } = useSettings();

    const [currentTheme, setCurrentTheme] = useState(accentColor || 'purple');
    const [isOnline, setIsOnline] = useState(true);
    const [cacheSize, setCacheSize] = useState('0 MB');

    useEffect(() => {
        checkConnectivity();
        calculateCacheSize();
    }, []);

    const checkConnectivity = async () => {
        try {
            const online = await api.ping();
            setIsOnline(online);
        } catch {
            setIsOnline(false);
        }
    };

    const calculateCacheSize = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            let size = 0;
            for (const key of keys) {
                const item = await AsyncStorage.getItem(key);
                if (item) size += item.length * 2; 
            }
            setCacheSize((size / (1024 * 1024)).toFixed(2) + ' MB');
        } catch {
            setCacheSize('Unknown');
        }
    };

    const handleThemeChange = async (themeId) => {
        setCurrentTheme(themeId);
        await saveTheme(themeId);
        await setAccentTheme(themeId);
        
    };

    const handleClearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will clear cached data but keep your account and settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear', onPress: async () => {
                        const keys = await AsyncStorage.getAllKeys();
                        const keysToRemove = keys.filter(k => !k.includes('Settings') && !k.includes('theme') && !k.includes('user'));
                        await AsyncStorage.multiRemove(keysToRemove);
                        calculateCacheSize();
                        Alert.alert('Done', 'Cache cleared successfully.');
                    }
                }
            ]
        );
    };

    const handleClearAllData = () => {
        Alert.alert(
            'Delete All Data',
            'This will permanently delete your watchlist, achievements, chakra, and all saved data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything', style: 'destructive', onPress: async () => {
                        try {
                            
                            await AsyncStorage.clear();

                            if (userProfile?.uid) {
                                await api.updateUserProfile(userProfile.uid, {
                                    chakra: 0,
                                    achievements: [],
                                    rank: 'Academy Student'
                                });
                            }

                            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
                            
                            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
                        } catch (error) {
                            console.error('Failed to clear all data:', error);
                            Alert.alert('Error', 'Failed to clear data. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out', style: 'destructive', onPress: async () => {
                        await logout();
                        
                    }
                }
            ]
        );
    };

    const handleRateApp = () => {
        Alert.alert(
            'Rate Nakama Network',
            'Enjoying the app? Leave us a review!',
            [
                { text: 'Later', style: 'cancel' },
                { text: 'Rate Now', onPress: () => Linking.openURL('market://details?id=com.nakama.network') }
            ]
        );
    };

    const handleFeedback = () => {
        Linking.openURL('mailto:nakamanetworkonline@gmail.com?subject=App Feedback');
    };

    if (settingsLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.accent?.primary || '#6366f1'} />
            </View>
        );
    }

    const SettingRow = ({ icon: Icon, title, subtitle, onPress, rightElement, iconColor = theme.accent?.primaryLight, iconBg = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress && !rightElement}
            activeOpacity={onPress ? 0.7 : 1}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}
        >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: iconBg, justifyContent: 'center', alignItems: 'center' }}>
                <Icon color={iconColor} size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>{title}</Text>
                {subtitle && <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>}
            </View>
            {rightElement || (onPress && <ChevronRight color={theme.textMuted} size={20} />)}
        </TouchableOpacity>
    );

    const SectionTitle = ({ children }) => (
        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 10, marginLeft: 4, letterSpacing: 1 }}>{children}</Text>
    );

    const ToggleRow = ({ icon: Icon, title, subtitle, value, onValueChange, iconColor = theme.accent?.primaryLight, iconBg = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }) => (
        <SettingRow
            icon={Icon}
            title={title}
            subtitle={subtitle}
            iconColor={iconColor}
            iconBg={iconBg}
            rightElement={
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: isDark ? '#334155' : '#cbd5e1', true: theme.accent?.primary }}
                    thumbColor="#fff"
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                />
            }
        />
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                        <X color={theme.textSecondary} size={24} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginLeft: 16 }}>Settings</Text>
                    <View style={{ flex: 1 }} />
                    {}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isOnline ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2'), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        {isOnline ? <Wifi color={theme.success} size={14} /> : <WifiOff color={theme.error} size={14} />}
                        <Text style={{ color: isOnline ? theme.success : theme.error, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>{isOnline ? 'Online' : 'Offline'}</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {}
                {!isGuest && (
                    <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
                        <SectionTitle>ACCOUNT</SectionTitle>
                        <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                            <SettingRow
                                icon={Edit3}
                                title="Edit Profile"
                                subtitle="Change name, bio, and avatar"
                                iconColor={theme.primary}
                                iconBg={isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff"}
                                onPress={() => navigation.navigate('EditProfile')}
                            />
                            <SettingRow
                                icon={LogOut}
                                title="Sign Out"
                                subtitle="Log out of your account"
                                iconColor={theme.error}
                                iconBg={isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2"}
                                onPress={handleLogout}
                            />
                        </View>
                    </View>
                )}

                {}
                <View style={{ paddingHorizontal: 20, paddingTop: isGuest ? 20 : 10, paddingBottom: 16 }}>
                    <SectionTitle>APPEARANCE</SectionTitle>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border }}>
                        {THEMES.map((t) => (
                            <TouchableOpacity
                                key={t.id}
                                onPress={() => handleThemeChange(t.id)}
                                style={{ alignItems: 'center' }}
                            >
                                <LinearGradient
                                    colors={t.colors}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        borderWidth: currentTheme === t.id ? 3 : 0,
                                        borderColor: theme.text
                                    }}
                                />
                                <Text style={{ color: currentTheme === t.id ? theme.text : theme.textMuted, fontSize: 10, marginTop: 6, fontWeight: '600' }}>{t.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {}
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginTop: 12 }}>
                        <ToggleRow
                            icon={isDark ? Moon : Sun}
                            title="Dark Mode"
                            subtitle={isDark ? "Currently using dark theme" : "Currently using light theme"}
                            value={isDark}
                            onValueChange={toggleTheme}
                            iconColor={isDark ? theme.accent?.secondary : '#f59e0b'}
                            iconBg={isDark ? `rgba(139, 92, 246, 0.15)` : `rgba(245, 158, 11, 0.15)`}
                        />
                    </View>
                </View>

                {}
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <SectionTitle>PREFERENCES</SectionTitle>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <ToggleRow icon={Play} title="Auto-play Videos" subtitle="Play trailers automatically" value={preferences.autoPlayVideos} onValueChange={(v) => updatePreference('autoPlayVideos', v)} iconColor={theme.info} iconBg={isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe"} />
                        <ToggleRow icon={Download} title="Data Saver" subtitle="Lower quality for less data" value={preferences.dataSaver} onValueChange={(v) => updatePreference('dataSaver', v)} iconColor={theme.success} iconBg={isDark ? "rgba(34, 197, 94, 0.15)" : "#dcfce7"} />
                        <ToggleRow icon={Volume2} title="Sound Effects" subtitle="UI interactions & notifications" value={preferences.soundEffects} onValueChange={(v) => updatePreference('soundEffects', v)} iconColor={theme.warning} iconBg={isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7"} />
                    </View>
                </View>

                {}
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <SectionTitle>NOTIFICATIONS</SectionTitle>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <ToggleRow icon={Bell} title="Push Notifications" subtitle="Enable all notifications" value={notifications.pushEnabled} onValueChange={(v) => updateNotification('pushEnabled', v)} iconColor={theme.accent?.primary} />
                        <ToggleRow icon={Play} title="Episode Alerts" subtitle="New episodes from watchlist" value={notifications.episodeAlerts} onValueChange={(v) => updateNotification('episodeAlerts', v)} iconColor="#ec4899" iconBg={isDark ? "rgba(236, 72, 153, 0.15)" : "#fce7f3"} />
                        <ToggleRow icon={MessageCircle} title="Clan Messages" subtitle="Chat & clan activity" value={notifications.clanMessages} onValueChange={(v) => updateNotification('clanMessages', v)} iconColor={theme.accent?.secondary} iconBg={isDark ? "rgba(139, 92, 246, 0.15)" : "#ede9fe"} />
                        <ToggleRow icon={Star} title="Daily Prophecy" subtitle="Morning fortune notification" value={notifications.dailyProphecy} onValueChange={(v) => updateNotification('dailyProphecy', v)} iconColor={theme.gold} iconBg={isDark ? "rgba(251, 191, 36, 0.15)" : "#fef3c7"} />
                    </View>
                </View>

                {}
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <SectionTitle>PRIVACY</SectionTitle>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <ToggleRow icon={Eye} title="Online Status" subtitle="Show when you're active" value={privacy.onlineStatus} onValueChange={(v) => updatePrivacy('onlineStatus', v)} iconColor={theme.success} iconBg={isDark ? "rgba(34, 197, 94, 0.15)" : "#dcfce7"} />
                        <ToggleRow icon={Globe} title="Public Profile" subtitle="Allow others to see your profile" value={privacy.profilePublic} onValueChange={(v) => updatePrivacy('profilePublic', v)} iconColor={theme.info} iconBg={isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe"} />
                        <ToggleRow icon={User} title="Activity Sharing" subtitle="Show watch history & reviews" value={privacy.activitySharing} onValueChange={(v) => updatePrivacy('activitySharing', v)} iconColor={theme.warning} iconBg={isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7"} />
                    </View>
                </View>

                {}
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <SectionTitle>STORAGE & DATA</SectionTitle>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <SettingRow icon={Database} title="Cache Size" subtitle={cacheSize} iconColor={theme.textMuted} iconBg={isDark ? "rgba(100, 116, 139, 0.15)" : "#f1f5f9"} />
                        <SettingRow icon={Trash2} title="Clear Cache" subtitle="Free up storage space" iconColor={theme.warning} iconBg={isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7"} onPress={handleClearCache} />
                        <SettingRow icon={Trash2} title="Delete All Data" subtitle="Remove everything permanently" iconColor={theme.error} iconBg={isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2"} onPress={handleClearAllData} />
                    </View>
                </View>

                {}
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <SectionTitle>ABOUT</SectionTitle>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <SettingRow icon={Star} title="Rate Nakama Network" subtitle="Love the app? Let us know!" iconColor={theme.gold} iconBg={isDark ? "rgba(251, 191, 36, 0.15)" : "#fef3c7"} onPress={handleRateApp} />
                        <SettingRow icon={Mail} title="Send Feedback" subtitle="Report bugs or suggest features" iconColor={theme.info} iconBg={isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe"} onPress={handleFeedback} />
                        <SettingRow icon={Shield} title="Privacy Policy" iconColor={theme.textMuted} iconBg={isDark ? "rgba(100, 116, 139, 0.15)" : "#f1f5f9"} onPress={() => Linking.openURL('https://nakamanetwork.app/privacy')} />
                        <SettingRow icon={Info} title="Version" rightElement={<Text style={{ color: theme.textSecondary, fontSize: 14 }}>1.0.0 (Build 1)</Text>} iconColor={theme.textMuted} iconBg={isDark ? "rgba(100, 116, 139, 0.15)" : "#f1f5f9"} />
                    </View>
                </View>

                {}
                <View style={{ alignItems: 'center', marginTop: 10, paddingHorizontal: 20 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>Made with ❤️ for anime fans</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>© 2026 Nakama Network</Text>
                </View>
            </ScrollView>
        </View>
    );
}
