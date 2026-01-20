import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, Trophy, Lock, Zap } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const AchievementCard = ({ achievement, theme, isDark }) => (
    <View style={{
        backgroundColor: achievement.unlocked
            ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)')
            : (isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(0,0,0,0.03)'),
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: achievement.unlocked
            ? (isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)')
            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
        opacity: achievement.unlocked ? 1 : 0.6
    }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: achievement.unlocked ? theme.primary : (isDark ? '#334155' : '#e2e8f0'),
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {achievement.unlocked ? (
                    <Text style={{ fontSize: 28 }}>{achievement.icon}</Text>
                ) : (
                    <Lock color={theme.textMuted} size={24} />
                )}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: achievement.unlocked ? theme.text : theme.textSecondary, fontWeight: '700', fontSize: 16 }}>
                    {achievement.name}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                    {achievement.description}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Trophy color={theme.gold} size={14} />
                    <Text style={{ color: theme.gold, fontWeight: 'bold', marginLeft: 4 }}>{achievement.points}</Text>
                </View>
                {achievement.unlocked && (
                    <Text style={{ color: theme.success, fontSize: 11, marginTop: 2 }}>Unlocked!</Text>
                )}
            </View>
        </View>
    </View>
);

export default function AchievementsScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const { userProfile } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [unlockedCount, setUnlockedCount] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievements();
    }, [userProfile?.uid]);

    const loadAchievements = async () => {
        setLoading(true);
        try {
            if (userProfile?.uid) {
                const result = await api.getUserAchievements(userProfile.uid);
                setAchievements(result.achievements || []);
                setTotalPoints(result.total_points || 0);
                setUnlockedCount(result.unlocked_count || 0);
            } else {
                
                const result = await api.getAllAchievements();
                setAchievements((result.achievements || []).map(a => ({ ...a, unlocked: false })));
            }
        } catch (error) {
            console.error('Failed to load achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', 'beginner', 'trivia', 'social', 'collector', 'dedication', 'special'];

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginTop: 16 }}>Loading achievements...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            {isDark && (
                <LinearGradient
                    colors={['#1e1b4b', theme.bg]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />
            )}

            {}
            <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <X color={theme.textSecondary} size={24} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>Achievements</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            {}
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                <LinearGradient
                    colors={theme.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-around' }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{unlockedCount}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Unlocked</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{achievements.length}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Total</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Zap color="#fbbf24" size={20} />
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginLeft: 4 }}>{totalPoints}</Text>
                        </View>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Points</Text>
                    </View>
                </LinearGradient>
            </View>

            {}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, marginBottom: 16 }}
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            backgroundColor: selectedCategory === cat
                                ? theme.primary
                                : (isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(0,0,0,0.05)'),
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: selectedCategory === cat
                                ? theme.primary
                                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                        }}
                    >
                        <Text style={{
                            color: selectedCategory === cat ? '#fff' : theme.textSecondary,
                            fontWeight: '600',
                            fontSize: 13,
                            textTransform: 'capitalize'
                        }}>
                            {cat === 'all' ? 'All' : cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
                {filteredAchievements.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingTop: 40 }}>
                        <Trophy color={theme.textMuted} size={48} />
                        <Text style={{ color: theme.textMuted, marginTop: 16, textAlign: 'center' }}>
                            No achievements in this category yet
                        </Text>
                    </View>
                ) : (
                    filteredAchievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            theme={theme}
                            isDark={isDark}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
