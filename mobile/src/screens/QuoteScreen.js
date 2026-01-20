import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, ActivityIndicator, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, RefreshCw, Heart, Share2 } from 'lucide-react-native';
import { shareQuote } from '../utils/share';
import { generateAnimeQuote } from '../utils/gemini';
import { saveQuote } from '../utils/storage';

const { width } = Dimensions.get('window');

const THEMES = [
    { id: 'motivation', label: '💪 Motivation', color: '#f59e0b' },
    { id: 'love', label: '❤️ Love', color: '#ec4899' },
    { id: 'friendship', label: '🤝 Friendship', color: '#3b82f6' },
    { id: 'courage', label: '⚔️ Courage', color: '#ef4444' },
    { id: 'wisdom', label: '🧠 Wisdom', color: '#8b5cf6' },
    { id: 'hope', label: '✨ Hope', color: '#22c55e' },
];

export default function QuoteScreen({ navigation }) {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('motivation');

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const animateQuote = () => {
        fadeAnim.setValue(0);
        Animated.spring(fadeAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    };

    const generateNewQuote = async (theme = selectedTheme) => {
        setLoading(true);
        setSaved(false);

        try {
            const result = await generateAnimeQuote(theme);
            if (result) {
                setQuote(result);
                animateQuote();
            }
        } catch (e) {
            console.error('Failed to generate quote:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (quote) {
            await saveQuote({ text: quote.quote, attribution: quote.attribution });
            setSaved(true);
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
            ]).start();
        }
    };

    const handleShare = async () => {
        if (quote) {
            await shareQuote(quote);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#312e81', '#0f172a']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color="#94a3b8" size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Quote Generator</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Anime inspiration</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 24, marginBottom: 24 }}>
                {THEMES.map((theme) => (
                    <TouchableOpacity
                        key={theme.id}
                        onPress={() => {
                            setSelectedTheme(theme.id);
                            generateNewQuote(theme.id);
                        }}
                        style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 20,
                            backgroundColor: selectedTheme === theme.id ? `${theme.color}30` : 'rgba(30, 41, 59, 0.8)',
                            borderWidth: 1,
                            borderColor: selectedTheme === theme.id ? theme.color : 'rgba(255,255,255,0.05)',
                            margin: 4
                        }}
                    >
                        <Text style={{ color: selectedTheme === theme.id ? theme.color : '#94a3b8', fontWeight: '600', fontSize: 13 }}>
                            {theme.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {}
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
                {loading ? (
                    <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={{ color: '#94a3b8', marginTop: 16 }}>Finding the perfect quote...</Text>
                    </View>
                ) : quote ? (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.15)']}
                            style={{ borderRadius: 28, padding: 28, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                        >
                            <Text style={{ color: '#fff', fontSize: 22, fontStyle: 'italic', lineHeight: 34, textAlign: 'center', fontWeight: '500' }}>
                                "{quote.quote}"
                            </Text>
                            <Text style={{ color: '#818cf8', fontSize: 14, textAlign: 'center', marginTop: 20, fontWeight: '600' }}>
                                — {quote.attribution}
                            </Text>
                        </LinearGradient>
                    </Animated.View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#64748b', fontSize: 16, textAlign: 'center' }}>Select a theme to discover inspirational anime quotes</Text>
                    </View>
                )}
            </View>

            {}
            {quote && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 40, paddingHorizontal: 24 }}>
                    <TouchableOpacity onPress={handleSave} style={{ alignItems: 'center', marginHorizontal: 20 }}>
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: saved ? '#ec4899' : 'rgba(30, 41, 59, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Heart color={saved ? '#fff' : '#ec4899'} size={24} fill={saved ? '#fff' : 'transparent'} />
                            </View>
                        </Animated.View>
                        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleShare} style={{ alignItems: 'center', marginHorizontal: 20 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(30, 41, 59, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Share2 color="#3b82f6" size={24} />
                        </View>
                        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => generateNewQuote()} style={{ alignItems: 'center', marginHorizontal: 20 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(30, 41, 59, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <RefreshCw color="#22c55e" size={24} />
                        </View>
                        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>New</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
