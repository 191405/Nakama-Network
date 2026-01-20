import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { unlockAchievement } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightningIcon, TrophyIcon, SparkleIcon, BrainIcon, ChatIcon, HeartIcon, SearchIcon, MoodIcon, StarIcon, FireIcon } from '../components/Icons';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { User } from 'lucide-react-native'; 

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, subtext, color, icon: Icon, theme }) => (
    <View style={{
        flex: 1,
        backgroundColor: theme.bgCard,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.border,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${color}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
            <Icon size={20} color={color} />
        </View>
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>{value}</Text>
        <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 }}>{label}</Text>
        {subtext && <Text style={{ color: color, fontSize: 10, fontWeight: '700', marginTop: 4 }}>{subtext}</Text>}
    </View>
);

const RankCard = ({ title, rank, progress, nextRank, theme }) => (
    <LinearGradient
        colors={theme.gradientCard}
        style={{
            marginTop: 20,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.border
        }}
    >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
                <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{rank}</Text>
            </View>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: theme.highlight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.accent?.primary }}>
                <Text style={{ fontSize: 24 }}>✨</Text>
            </View>
        </View>

        <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: theme.accent?.primary || '#6366f1' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ color: theme.textMuted, fontSize: 11 }}>Progress</Text>
            <Text style={{ color: theme.text, fontSize: 11, fontWeight: '700' }}>Next: {nextRank}</Text>
        </View>
    </LinearGradient>
);

const QuickAction = ({ Icon, title, color, onPress, theme }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{ alignItems: 'center', width: (width - 60) / 4 }}
    >
        <LinearGradient
            colors={[color + '20', color + '10']}
            style={{ width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: color + '40', marginBottom: 8 }}
        >
            <Icon size={24} color={color} />
        </LinearGradient>
        <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600' }} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
);

export default function HomeScreen() {
    const { userProfile } = useAuth();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [character, setCharacter] = useState(null);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            
            if (userProfile?.uid) {
                
                const loginRes = await api.creditChakra(userProfile.uid, 'daily_login');
                
                const progressData = await api.getUserProgress(userProfile.uid);
                setProgress(progressData);
            }

            const today = new Date().toISOString().split('T')[0];
            const cached = await AsyncStorage.getItem('characterOfTheDay');
            let charData = null;

            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.date === today) charData = parsed.character;
            }

            if (!charData) {
                
                charData = await api.getCharacterOfTheDay();
                if (charData) {
                    await AsyncStorage.setItem('characterOfTheDay', JSON.stringify({ date: today, character: charData }));
                }
            }
            setCharacter(charData);

        } catch (e) {
            console.error('Home load error:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !progress) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.accent?.primary} />
            </View>
        );
    }

    const ninjaLevel = progress?.level || { title: 'Academy Student', progress: 0, next: 'Genin' };
    const netRank = progress?.rank || { title: 'Net Wanderer', progress: 0, next: 'Net Citizen' };
    const streak = progress?.streak || { current: 0 };
    const chakra = progress?.stats?.chakra || 0;

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {}
                <LinearGradient
                    colors={theme.gradientHeader || ['#1e293b', '#0f172a']}
                    style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>
                                {isDark ? 'Good Evening' : 'Welcome Back'}
                            </Text>
                            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 }}>
                                {typeof userProfile?.displayName === 'object' ? 'Shinobi' : (userProfile?.displayName || 'Shinobi')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }}
                        >
                            {userProfile?.photoURL ? (
                                <Image source={{ uri: userProfile.photoURL }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                            ) : (
                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginVertical: 2 }} />
                            )}
                            {}
                            {}
                        </TouchableOpacity>
                    </View>

                    {}
                    <RankCard
                        title="Ninja Level"
                        rank={typeof ninjaLevel.title === 'object' ? ninjaLevel.title.title || 'Academy Student' : ninjaLevel.title}
                        progress={ninjaLevel.progress}
                        nextRank={typeof ninjaLevel.next === 'object' ? 'Genin' : ninjaLevel.next}
                        theme={theme}
                    />
                </LinearGradient>

                {}
                <View style={{ flexDirection: 'row', marginTop: -30, paddingHorizontal: 20 }}>
                    <StatCard
                        label="Chakra"
                        value={chakra.toLocaleString()}
                        color="#f59e0b"
                        icon={LightningIcon}
                        theme={theme}
                    />
                    <StatCard
                        label="Streak"
                        value={`${streak.current} Days`}
                        subtext={typeof netRank.title === 'object' ? netRank.title.title || 'Net Wanderer' : netRank.title}
                        color="#ef4444"
                        icon={FireIcon}
                        theme={theme}
                    />
                    <StatCard
                        label="Episodes"
                        value={progress?.stats?.episodes || 0}
                        color="#3b82f6"
                        icon={TrophyIcon}
                        theme={theme}
                    />
                </View>

                {}
                <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>Command Center</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <QuickAction Icon={BrainIcon} title="Trivia" color="#f59e0b" theme={theme} onPress={() => navigation.navigate('Trivia')} />
                        <QuickAction Icon={SparkleIcon} title="Oracle" color="#8b5cf6" theme={theme} onPress={() => navigation.navigate('Oracle')} />
                        <QuickAction Icon={ChatIcon} title="Chat" color="#10b981" theme={theme} onPress={() => navigation.navigate('Chat', { roomId: 'global_chat', name: 'Global Chat' })} />
                        <QuickAction Icon={SearchIcon} title="Manga" color="#ef4444" theme={theme} onPress={() => navigation.navigate('Manga')} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', marginTop: 16 }}>
                        <QuickAction Icon={User} title="Characters" color="#3b82f6" theme={theme} onPress={() => navigation.navigate('Characters')} />
                    </View>
                </View>

                {}
                {character && (
                    <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
                        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Character of the Day</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CharacterDetail', { characterId: character.id })} 
                            activeOpacity={0.9}
                        >
                            <ImageBackground
                                source={{ uri: character.image }}
                                style={{ width: '100%', height: 200, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end' }}
                                imageStyle={{ borderRadius: 24 }}
                            >
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                                    style={{ padding: 20 }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
                                        {typeof character.name === 'object' ? character.name.name || 'Character' : character.name}
                                    </Text>
                                    <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600' }}>
                                        {typeof character.anime === 'object' ? character.anime.title || 'Anime' : character.anime}
                                    </Text>
                                </LinearGradient>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                )}

                {}
                <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Music')}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}
                    >
                        <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: '#ec489920', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                            <Text style={{ fontSize: 24 }}>🎵</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Nakama Music</Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Stream anime Lo-Fi & OSTs</Text>
                        </View>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.bgSecondary, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: theme.text, fontWeight: '800' }}>{'>'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}
