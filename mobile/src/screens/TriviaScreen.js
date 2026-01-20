import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Trophy, Zap, X, CheckCircle, XCircle, ArrowRight, Eye, ChevronLeft } from 'lucide-react-native';
import { generateTriviaQuestion } from '../utils/gemini';
import { useAuth } from '../contexts/AuthContext';
import { CHAKRA_REWARDS, getRankForChakra } from '../utils/progression';
import GuestGuard from '../components/GuestGuard';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

export default function TriviaScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();
    const { userProfile, updateProfile } = useAuth();
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [history, setHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showHint, setShowHint] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        loadQuestion();
    }, []);

    const animateIn = () => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
        ]).start();
    };

    const loadQuestion = async (isNext = true) => {
        setLoading(true);
        setShowResult(false);
        setShowHint(false);

        if (!isNext && currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            const prevData = history[prevIndex];
            setQuestion(prevData.question);
            setSelectedAnswer(prevData.selectedAnswer);
            setShowResult(true);
            setCurrentIndex(prevIndex);
            setLoading(false);
            return;
        }

        if (isNext && currentIndex < history.length - 1) {
            const nextIndex = currentIndex + 1;
            const nextData = history[nextIndex];
            setQuestion(nextData.question);
            setSelectedAnswer(nextData.selectedAnswer);
            setShowResult(true);
            setCurrentIndex(nextIndex);
            setLoading(false);
            return;
        }

        setSelectedAnswer(null);
        try {
            const difficulty = score < 3 ? 'easy' : score < 7 ? 'medium' : 'hard';
            const newQuestion = await generateTriviaQuestion(difficulty);
            setQuestion(newQuestion);
            setCurrentIndex(prev => prev + 1);
            animateIn();
        } catch (e) {
            console.error('Failed to load question:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (index) => {
        if (showResult) return;

        setSelectedAnswer(index);
        setShowResult(true);
        setQuestionCount(prev => prev + 1);

        const isCorrect = index === question.correct;
        const newStreak = isCorrect ? streak + 1 : 0;

        const newHistoryItem = {
            question: question,
            selectedAnswer: index,
            isCorrect: isCorrect
        };
        setHistory(prev => [...prev, newHistoryItem]);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setStreak(newStreak);
        } else {
            setStreak(0);
        }

        if (userProfile && !userProfile.isGuest && userProfile.uid) {
            const syncWithServer = async () => {
                try {
                    const difficulty = score < 3 ? 'easy' : score < 7 ? 'medium' : 'hard';
                    const userId = String(userProfile.uid);

                    const result = await api.submitTriviaAnswer(
                        userId,
                        isCorrect,
                        difficulty,
                        newStreak
                    );

                    if (result && result.chakra_earned > 0) {
                        updateProfile({
                            chakra: result.total_chakra,
                            rank: getRankForChakra(result.total_chakra)
                        });
                    }

                    if (result && result.unlocked_achievements?.length > 0) {
                        const achievementNames = result.unlocked_achievements.join(', ');
                        Alert.alert(
                            "🏆 Achievement Unlocked!",
                            `You earned: ${achievementNames}`,
                            [{ text: "Awesome!" }]
                        );
                    }
                } catch (error) {
                    console.log('Server sync failed (offline mode):', error.message);
                    
                }
            };

            syncWithServer();
        }
    };

    const getOptionStyle = (index) => {
        if (!showResult) {
            return selectedAnswer === index
                ? { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)', borderColor: theme.primary }
                : { backgroundColor: theme.bgCard, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' };
        }

        if (index === question.correct) {
            return { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', borderColor: theme.success };
        }

        if (selectedAnswer === index && index !== question.correct) {
            return { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', borderColor: theme.error };
        }

        return { backgroundColor: theme.bgCard, borderColor: theme.border };
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginTop: 16, fontSize: 16 }}>Loading question...</Text>
            </View>
        );
    }

    return (
        <GuestGuard feature="Trivia">
            <View style={{ flex: 1, backgroundColor: theme.bg }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <LinearGradient
                    colors={theme.isDark ? ['#1e1b4b', theme.bg] : [theme.bg, theme.bg]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />

                {}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <X color={theme.textSecondary} size={24} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(251, 191, 36, 0.2)' : '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                            <Trophy color={theme.gold} size={16} />
                            <Text style={{ color: theme.gold, fontWeight: 'bold', marginLeft: 6 }}>{score}</Text>
                        </View>
                        {streak > 1 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 8 }}>
                                <Zap color={theme.error} size={16} />
                                <Text style={{ color: theme.error, fontWeight: 'bold', marginLeft: 4 }}>{streak}x</Text>
                            </View>
                        )}
                    </View>
                </View>

                {}
                <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Question {questionCount + 1}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{Math.round((score / Math.max(questionCount, 1)) * 100)}% correct</Text>
                    </View>
                    <View style={{ height: 4, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                        <View style={{ width: `${(questionCount % 10) * 10}%`, height: '100%', backgroundColor: theme.primary, borderRadius: 2 }} />
                    </View>
                </View>

                {}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                        <View style={{ backgroundColor: theme.bgCard, borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.border }}>
                            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', lineHeight: 30 }}>
                                {question?.question}
                            </Text>

                            {!showResult && question?.hint && (
                                <TouchableOpacity
                                    onPress={() => setShowHint(!showHint)}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
                                >
                                    <Eye size={16} color={theme.textMuted} />
                                    <Text style={{ color: theme.textMuted, marginLeft: 6, fontSize: 13 }}>
                                        {showHint ? question.hint : "Tap for a hint"}
                                    </Text>
                                </TouchableOpacity>
                            )}

                        </View>

                        {}
                        <View style={{ marginBottom: 24 }}>
                            {question?.options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleAnswer(index)}
                                    disabled={showResult}
                                    activeOpacity={0.8}
                                    style={{ marginBottom: 12 }}
                                >
                                    <View style={[
                                        { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 2 },
                                        getOptionStyle(index)
                                    ]}>
                                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>{String.fromCharCode(65 + index)}</Text>
                                        </View>
                                        <Text style={{ flex: 1, color: theme.text, fontSize: 16, fontWeight: '500' }}>{option}</Text>
                                        {showResult && index === question.correct && <CheckCircle color={theme.success} size={22} />}
                                        {showResult && selectedAnswer === index && index !== question.correct && <XCircle color={theme.error} size={22} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {}
                        {showResult && (
                            <Animated.View style={{ marginBottom: 24 }}>
                                <View style={{ backgroundColor: selectedAnswer === question.correct ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2'), borderRadius: 16, padding: 16, borderWidth: 1, borderColor: selectedAnswer === question.correct ? (isDark ? 'rgba(34, 197, 94, 0.3)' : '#86efac') : (isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5') }}>
                                    <Text style={{ color: selectedAnswer === question.correct ? theme.success : theme.error, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                                        {selectedAnswer === question.correct ? '🎉 Correct!' : '❌ Wrong!'}
                                    </Text>
                                    <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 22 }}>{question?.explanation}</Text>
                                </View>
                            </Animated.View>
                        )}

                        {}
                        {showResult && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                {currentIndex > 0 && (
                                    <TouchableOpacity
                                        onPress={() => loadQuestion(false)}
                                        activeOpacity={0.8}
                                        style={{ padding: 16, backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}
                                    >
                                        <ChevronLeft color={theme.text} size={24} />
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    onPress={() => loadQuestion(true)}
                                    activeOpacity={0.8}
                                    style={{ flex: 1, marginLeft: currentIndex > 0 ? 12 : 0 }}
                                >
                                    <LinearGradient
                                        colors={theme.gradientPrimary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, marginRight: 8 }}>
                                            {currentIndex < history.length - 1 ? "Next (Review)" : "Next Question"}
                                        </Text>
                                        <ArrowRight color="#fff" size={20} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </View>
        </GuestGuard>
    );
}
