import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { BrainIcon, SparkleIcon, ChatIcon, MoodIcon, TrophyIcon, CrownIcon } from '../components/Icons';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const GAMES = [
    { id: 1, title: 'Anime Trivia', description: 'Test your knowledge', Icon: BrainIcon, colors: ['#f59e0b', '#f97316'], screen: 'Trivia' },
    { id: 2, title: 'The Oracle', description: 'Get recommendations', Icon: SparkleIcon, colors: ['#8b5cf6', '#6366f1'], screen: 'Oracle' },
    { id: 3, title: 'Mood Matcher', description: 'Find your next watch', Icon: MoodIcon, colors: ['#ec4899', '#f472b6'], screen: 'MoodPicker' },
    { id: 4, title: 'Quote Generator', description: 'Anime wisdom', Icon: ChatIcon, colors: ['#10b981', '#059669'], screen: 'Quote' },
];

export default function GameScreen() {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const [games, setGames] = useState(GAMES);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePlayers, setActivePlayers] = useState(0); 

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); 
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            
            const leaderboardData = await api.safeRequest('/interaction/leaderboard', {}, []);
            setLeaderboard(leaderboardData);

            const quickGamesData = await api.getQuickGames();

            if (quickGamesData && quickGamesData.games) {
                
                const updatedGames = GAMES.map(game => {

                    let backendId = '';
                    if (game.id === 1) backendId = 'trivia';
                    if (game.id === 2) backendId = 'oracle'; 
                    if (game.id === 3) backendId = 'match'; 

                    const backendGame = quickGamesData.games.find(g => g.id === backendId);
                    return {
                        ...game,
                        onlineCount: backendGame ? backendGame.online : 0
                    };
                });
                setGames(updatedGames);
                setActivePlayers(quickGamesData.total_online || 0);
            }

        } catch (e) {
            console.error('Failed to load game data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleGamePress = (game) => {
        if (game.screen) {
            navigation.navigate(game.screen);
        }
    };

    const formatPlayerCount = (count) => {
        if (!count) return '0';
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {}
                <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }}>
                    <Text style={{ color: theme.text, fontSize: 28, fontWeight: '800' }}>Arcade</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Play games, earn rewards</Text>
                </View>

                {}
                <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Trivia')}>
                        <LinearGradient
                            colors={['#7c3aed', '#6366f1', '#4f46e5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 24, padding: 24, height: 180, justifyContent: 'flex-end', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 }}
                        >
                            <View style={{ position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>🔥 HOT</Text>
                            </View>
                            <View style={{ position: 'absolute', top: 20, left: 20, opacity: 0.3 }}>
                                <CrownIcon size={80} color="#fff" />
                            </View>
                            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Daily Challenge</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>Win 500 Chakra points today!</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {}
                <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Quick Games</Text>
                    {games.map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            activeOpacity={0.8}
                            onPress={() => handleGamePress(game)}
                            style={{ backgroundColor: theme.bgCard, borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border }}
                        >
                            <LinearGradient
                                colors={game.colors}
                                style={{ width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <game.Icon size={28} color="#fff" />
                            </LinearGradient>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{game.title}</Text>
                                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{game.description}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: (game.onlineCount > 0) ? theme.success : theme.textMuted, fontWeight: '600', fontSize: 13 }}>
                                    {formatPlayerCount(game.onlineCount)}
                                </Text>
                                <Text style={{ color: theme.textMuted, fontSize: 11 }}>online</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {}
                <View style={{ paddingHorizontal: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TrophyIcon size={22} color={theme.gold} />
                            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginLeft: 10 }}>Leaderboard</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 14 }}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 24, padding: 4, borderWidth: 1, borderColor: theme.border }}>
                        {loading ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <ActivityIndicator color={theme.primary} />
                            </View>
                        ) : leaderboard.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <TrophyIcon size={48} color={theme.textMuted} />
                                <Text style={{ color: theme.textSecondary, marginTop: 16, fontSize: 14 }}>No players yet</Text>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>Be the first to play!</Text>
                            </View>
                        ) : (
                            leaderboard.slice(0, 5).map((player, index) => (
                                <View
                                    key={player.user_id || index}
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: index < leaderboard.length - 1 ? 1 : 0, borderBottomColor: theme.border }}
                                >
                                    <View style={{ width: 32, alignItems: 'center' }}>
                                        {index < 3 ? (
                                            <Text style={{ fontSize: 22 }}>{['🥇', '🥈', '🥉'][index]}</Text>
                                        ) : (
                                            <Text style={{ color: theme.textSecondary, fontWeight: 'bold', fontSize: 16 }}>{index + 1}</Text>
                                        )}
                                    </View>
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 14,
                                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : theme.textMuted,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginLeft: 12
                                    }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{(player.display_name || 'U')[0].toUpperCase()}</Text>
                                    </View>
                                    <Text style={{ flex: 1, color: theme.text, fontWeight: '600', fontSize: 15, marginLeft: 12 }}>
                                        {player.display_name || `User_${player.user_id?.substring(0, 6)}`}
                                    </Text>
                                    <Text style={{ color: theme.gold, fontWeight: 'bold', fontSize: 15 }}>
                                        {(player.xp || 0).toLocaleString()}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
