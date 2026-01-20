import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, ChevronRight, Sparkles } from 'lucide-react-native';
import { getMoodRecommendations } from '../utils/gemini';

const { width } = Dimensions.get('window');

const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24', gradient: ['#fbbf24', '#f59e0b'] },
    { id: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa', gradient: ['#60a5fa', '#3b82f6'] },
    { id: 'excited', emoji: '🤩', label: 'Excited', color: '#f472b6', gradient: ['#f472b6', '#ec4899'] },
    { id: 'chill', emoji: '😌', label: 'Chill', color: '#34d399', gradient: ['#34d399', '#10b981'] },
    { id: 'adventurous', emoji: '⚔️', label: 'Adventurous', color: '#f97316', gradient: ['#f97316', '#ea580c'] },
    { id: 'romantic', emoji: '💕', label: 'Romantic', color: '#fb7185', gradient: ['#fb7185', '#f43f5e'] },
    { id: 'scared', emoji: '👻', label: 'Scared', color: '#a78bfa', gradient: ['#a78bfa', '#8b5cf6'] },
    { id: 'nostalgic', emoji: '🌸', label: 'Nostalgic', color: '#c084fc', gradient: ['#c084fc', '#a855f7'] },
    { id: 'motivated', emoji: '💪', label: 'Motivated', color: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'] },
];

const MoodButton = ({ mood, onPress, selected }) => (
    <TouchableOpacity
        onPress={() => onPress(mood)}
        activeOpacity={0.8}
        style={{ width: (width - 64) / 3, alignItems: 'center', marginBottom: 16 }}
    >
        <LinearGradient
            colors={selected ? mood.gradient : ['rgba(30, 41, 59, 0.8)', 'rgba(30, 41, 59, 0.6)']}
            style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: selected ? 0 : 1,
                borderColor: 'rgba(255,255,255,0.1)'
            }}
        >
            <Text style={{ fontSize: 32 }}>{mood.emoji}</Text>
        </LinearGradient>
        <Text style={{ color: selected ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: '600', marginTop: 8 }}>{mood.label}</Text>
    </TouchableOpacity>
);

const RecommendationCard = ({ anime, index }) => (
    <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{anime.title}</Text>
                <Text style={{ color: '#6366f1', fontSize: 12, marginTop: 2 }}>{anime.genre}</Text>
            </View>
        </View>
        <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 12, lineHeight: 22 }}>{anime.reason}</Text>
    </View>
);

export default function MoodPickerScreen({ navigation }) {
    const [selectedMood, setSelectedMood] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleMoodSelect = async (mood) => {
        setSelectedMood(mood);
        setLoading(true);
        setRecommendations([]);

        try {
            const result = await getMoodRecommendations(mood.label);
            if (result?.recommendations) {
                setRecommendations(result.recommendations);
            }
        } catch (e) {
            console.error('Failed to get recommendations:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color="#94a3b8" size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>How are you feeling?</Text>
                    <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Get personalized picks</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
                    {MOODS.map((mood) => (
                        <MoodButton
                            key={mood.id}
                            mood={mood}
                            selected={selectedMood?.id === mood.id}
                            onPress={handleMoodSelect}
                        />
                    ))}
                </View>

                {}
                {loading && (
                    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 15 }}>Finding perfect anime for you...</Text>
                    </View>
                )}

                {}
                {!loading && recommendations.length > 0 && (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Sparkles color="#fbbf24" size={20} />
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
                                Perfect for {selectedMood?.label}
                            </Text>
                        </View>
                        {recommendations.map((anime, index) => (
                            <RecommendationCard key={index} anime={anime} index={index} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
