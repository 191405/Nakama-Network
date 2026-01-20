import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { getWatchlist } from '../utils/storage';
import { getRankForChakra } from '../utils/progression';
import { LightningIcon, TrophyIcon, CrownIcon, HeartIcon, StarIcon } from '../components/Icons';
import { Settings, Bell, LogOut, ChevronRight, BarChart3, User, Upload, Clock, Eye, Play, MessageCircle, Award, Film, Target, Zap, BookOpen, Shield } from 'lucide-react-native';
import api from '../services/api';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const MenuItem = ({ icon: Icon, customIcon: CustomIcon, title, subtitle, onPress, showBadge, danger, value, iconColor, iconBg }) => {
    const { theme, isDark } = useTheme();
    const finalIconColor = danger ? theme.error : (iconColor || theme.accent?.primaryLight);
    const finalIconBg = danger ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') : (iconBg || (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'));

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}
        >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: finalIconBg, justifyContent: 'center', alignItems: 'center' }}>
                {CustomIcon ? <CustomIcon size={20} color={finalIconColor} /> : <Icon color={finalIconColor} size={20} />}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: danger ? theme.error : theme.text, fontWeight: '600', fontSize: 15 }}>{title}</Text>
                {subtitle && <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>}
            </View>
            {value && <Text style={{ color: finalIconColor, fontWeight: 'bold', marginRight: 8, fontSize: 14 }}>{title === 'Achievements' ? value : value}</Text>}
            {showBadge && (
                <View style={{ backgroundColor: theme.error, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>!</Text>
                </View>
            )}
            <ChevronRight color={theme.textMuted} size={20} />
        </TouchableOpacity>
    );
};

const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color }) => {
    const { theme, isDark } = useTheme();
    const finalColor = color || theme.accent?.primary;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                {}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={finalColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </Svg>
        </View>
    );
};

const StatCard = ({ icon: Icon, value, label, color, bg }) => {
    const { theme } = useTheme();
    return (
        <View style={{ flex: 1, alignItems: 'center', padding: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <Icon color={color} size={18} />
            </View>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>{value}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
        </View>
    );
};

const ActivityItem = ({ icon: Icon, text, time, color }) => {
    const { theme } = useTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${color}20`, justifyContent: 'center', alignItems: 'center' }}>
                <Icon color={color} size={16} />
            </View>
            <Text style={{ flex: 1, color: theme.textSecondary, fontSize: 14, marginLeft: 12 }}>{text}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{time}</Text>
        </View>
    );
};

const BadgePreview = ({ name, icon, color, unlocked }) => {
    const { theme, isDark } = useTheme();
    return (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <LinearGradient
                colors={unlocked ? [color, `${color}CC`] : (isDark ? ['#334155', '#1e293b'] : ['#e2e8f0', '#cbd5e1'])}
                style={{ width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
            >
                <Text style={{ fontSize: 24, opacity: unlocked ? 1 : 0.3 }}>{icon}</Text>
            </LinearGradient>
            <Text style={{ color: unlocked ? theme.text : theme.textMuted, fontSize: 10, marginTop: 6, fontWeight: '500' }}>{name}</Text>
        </View>
    );
};

export default function ProfileScreen() {
    const { logout, userProfile, isGuest, refreshProfile } = useAuth();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();
    const [stats, setStats] = useState({});
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const currentChakra = userProfile?.chakra || 0;
    const ninjaLevel = userProfile?.ninjaLevel || { title: 'Academy Student', badge: '🎓', progress: 0 };
    const netRank = userProfile?.netRank || { title: 'Net Wanderer', color: '#94a3b8' };
    const streak = userProfile?.streak || { current: 0, longest: 0 };

    const chakraProgress = ninjaLevel.progress ? (ninjaLevel.progress / 100) : 0;

    const [recentActivity, setRecentActivity] = useState([]);

    const achievements = userProfile?.achievements || [];
    const badges = [
        { name: 'First Watch', icon: '🎬', color: '#6366f1', unlocked: achievements.includes('first_login') || watchlistCount > 0 },
        { name: 'Reviewer', icon: '✍️', color: '#f59e0b', unlocked: achievements.includes('first_trivia') },
        { name: 'Social', icon: '💬', color: '#22c55e', unlocked: achievements.includes('oracle_10') },
        { name: 'Elite', icon: '👑', color: '#ec4899', unlocked: currentChakra >= 500 },
    ];

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refreshProfile(); 
            getWatchlist().then(list => setWatchlistCount(list?.length || 0));
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: chakraProgress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [chakraProgress]);

    const loadData = async () => {
        try {

            if (userProfile?.uid) {
                const triviaData = await api.getTriviaStats(userProfile.uid);
                if (triviaData?.stats) {
                    setStats(prev => ({ ...prev, triviaPlayed: triviaData.stats.total_played || 0 }));
                }
            }

            const watchlist = await getWatchlist();
            setWatchlistCount(watchlist?.length || 0);

            const activities = [];
            if (watchlist && watchlist.length > 0) {
                
                const recentWatchlist = watchlist.slice(-3).reverse();
                recentWatchlist.forEach((anime, index) => {
                    activities.push({
                        icon: HeartIcon,
                        text: `Added ${anime.title || 'anime'} to watchlist`,
                        time: index === 0 ? 'Recently' : `Few days ago`, 
                        color: '#ec4899'
                    });
                });
            }

            if (streak.current > 0) {
                activities.unshift({
                    icon: Zap,
                    text: `${streak.current} Day Login Streak!`,
                    time: 'Ongoing',
                    color: '#fbbf24'
                });
            }

            setRecentActivity(activities.slice(0, 3));
        } catch (error) {
            console.error("Failed to load profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {}
                <LinearGradient
                    colors={[isDark ? (theme.bgCard || '#1e293b') : '#f8fafc', theme.background || '#ffffff']}
                    style={{ paddingBottom: 24, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 }}>
                        <TouchableOpacity
                            style={{ padding: 10, borderRadius: 12, backgroundColor: theme.bgCard }}
                            onPress={() => navigation.goBack()}
                        >
                            <ChevronRight style={{ transform: [{ rotate: '180deg' }] }} color={theme.text} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 10, borderRadius: 12, backgroundColor: theme.bgCard }}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Settings color={theme.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                        <View style={{ position: 'relative' }}>
                            <ProgressRing progress={chakraProgress} size={130} strokeWidth={8} color={theme.accent?.primary} />
                            <View style={{ position: 'absolute', top: 5, left: 5, width: 120, height: 120, borderRadius: 60, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bgCard, borderWidth: 4, borderColor: theme.background }}>
                                {userProfile?.photoURL ? (
                                    <Image source={{ uri: userProfile.photoURL }} style={{ width: 120, height: 120 }} />
                                ) : (
                                    <Text style={{ fontSize: 50 }}>{ninjaLevel.badge || '🎓'}</Text>
                                )}
                            </View>
                            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.accent?.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 3, borderColor: theme.background }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Lvl {ninjaLevel.level || 1}</Text>
                            </View>
                        </View>

                        <Text style={{ marginTop: 16, fontSize: 24, fontWeight: '800', color: theme.text }}>
                            {typeof userProfile?.displayName === 'object' ? 'Shinobi' : (userProfile?.displayName || 'Shinobi')}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: `${netRank.color}20`, borderRadius: 20 }}>
                            <CrownIcon size={14} color={netRank.color} />
                            <Text style={{ marginLeft: 6, color: netRank.color, fontWeight: '700', fontSize: 13 }}>
                                {typeof netRank.title === 'object' ? netRank.title.title || 'Net Wanderer' : netRank.title}
                            </Text>
                        </View>

                        <Text style={{ marginTop: 8, color: theme.textSecondary, fontSize: 14 }}>
                            {currentChakra} Chakra Points
                        </Text>

                        {isGuest && (
                            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('GuestUpgrade')}>
                                <LinearGradient
                                    colors={theme.accent?.gradient || ['#3b82f6', '#6366f1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>Create Account</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>

                {}
                <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: -12, backgroundColor: theme.bgCard, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                    <StatCard icon={Film} value={watchlistCount} label="Watchlist" color="#ec4899" bg={isDark ? "rgba(236, 72, 153, 0.15)" : "#fce7f3"} />
                    <View style={{ width: 1, backgroundColor: theme.border, marginVertical: 12 }} />
                    <StatCard icon={Target} value={stats.triviaPlayed || 0} label="Trivia" color="#22c55e" bg={isDark ? "rgba(34, 197, 94, 0.15)" : "#dcfce7"} />
                    <View style={{ width: 1, backgroundColor: theme.border, marginVertical: 12 }} />
                    <StatCard icon={MessageCircle} value={stats.reviewsPosted || 0} label="Reviews" color="#3b82f6" bg={isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe"} />
                </View>

                {}
                <View style={{ marginTop: 24, marginHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Achievements</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                            <Text style={{ color: theme.accent?.primary || '#6366f1', fontSize: 13, fontWeight: '600' }}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: theme.bgCard, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.border }}>
                        {badges.map((badge, index) => (
                            <BadgePreview key={index} {...badge} />
                        ))}
                    </View>
                </View>

                {}
                <View style={{ marginTop: 24, marginHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Recent Activity</Text>
                        <Clock color={theme.textMuted} size={16} />
                    </View>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
                        {recentActivity.map((activity, index) => (
                            <ActivityItem key={index} {...activity} />
                        ))}
                    </View>
                </View>

                {}
                <View style={{ marginTop: 24, marginHorizontal: 20 }}>
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 10, marginLeft: 4, letterSpacing: 1 }}>MY CONTENT</Text>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <MenuItem customIcon={HeartIcon} title="Watchlist" subtitle={`${watchlistCount} anime saved`} iconColor="#ec4899" iconBg={isDark ? "rgba(236, 72, 153, 0.15)" : "#fce7f3"} onPress={() => navigation.navigate('Watchlist')} />
                        <MenuItem customIcon={TrophyIcon} title="Achievements" subtitle="View all badges & rewards" value={`${currentChakra} pts`} iconColor="#f59e0b" iconBg={isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7"} onPress={() => navigation.navigate('Achievements')} />
                        <MenuItem icon={Upload} title="Creator Studio" subtitle="Upload your content" iconColor="#22c55e" iconBg={isDark ? "rgba(34, 197, 94, 0.15)" : "#dcfce7"} onPress={() => navigation.navigate('CreatorStudio')} />
                    </View>
                </View>

                {}
                <View style={{ marginTop: 24, marginHorizontal: 20 }}>
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 10, marginLeft: 4, letterSpacing: 1 }}>ACCOUNT</Text>
                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                        <MenuItem icon={User} title="Edit Profile" subtitle="Update your ninja info" iconColor={theme.accent?.secondary} onPress={() => navigation.navigate('EditProfile')} />
                        <MenuItem icon={Settings} title="Settings" subtitle="Theme, notifications & more" iconColor={theme.textSecondary} onPress={() => navigation.navigate('Settings')} />
                        <MenuItem icon={LogOut} title="Log Out" danger onPress={handleLogout} />
                    </View>
                </View>

                {}
                <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 24 }}> Nakama Network v1.0.0</Text>
            </ScrollView>
        </View>
    );
}
