import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, Send, Sparkles } from 'lucide-react-native';
import { askTheOracle } from '../utils/gemini';
import GuestGuard from '../components/GuestGuard';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const MessageBubble = ({ message, isUser }) => {
    const { theme, isDark } = useTheme();
    return (
        <View style={{
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            marginBottom: 12
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                flexDirection: isUser ? 'row-reverse' : 'row'
            }}>
                {!isUser && (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                        <Sparkles color="#fff" size={16} />
                    </View>
                )}
                <View style={{
                    backgroundColor: isUser ? theme.primary : theme.bgCard,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 20,
                    borderBottomRightRadius: isUser ? 4 : 20,
                    borderBottomLeftRadius: isUser ? 20 : 4,
                    borderWidth: isUser ? 0 : 1,
                    borderColor: theme.border
                }}>
                    <Text style={{ color: isUser ? '#fff' : theme.text, fontSize: 15, lineHeight: 22 }}>{message.content}</Text>
                </View>
            </View>
        </View>
    );
};

export default function OracleScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: "Welcome, seeker. I am The Oracle. Ask me anything about anime, and I shall illuminate your path. What wisdom do you seek today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef();

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { id: Date.now(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await askTheOracle(userMessage.content, messages.slice(-6));
            if (response) {
                setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: response }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "The mists of fate cloud my vision... Try again, seeker." }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "A disturbance in the chakra... The spirits cannot answer now." }]);
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        "Recommend an anime for me",
        "What's trending right now?",
        "Most iconic anime villain?",
    ];

    return (
        <GuestGuard feature="The Oracle">
            <View style={{ flex: 1, backgroundColor: theme.bg }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                {}
                <LinearGradient
                    colors={isDark ? ['#1e1b4b', theme.bg] : [theme.bg, theme.bg]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />

                {}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <X color={theme.textSecondary} size={24} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Sparkles color={theme.gold} size={20} />
                            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginLeft: 8 }}>The Oracle</Text>
                        </View>
                        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>Your Anime Guide</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                {}
                <ScrollView
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} isUser={message.role === 'user'} />
                    ))}

                    {loading && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                                <Sparkles color="#fff" size={16} />
                            </View>
                            <View style={{ backgroundColor: theme.bgCard, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                                <ActivityIndicator size="small" color={theme.primary} />
                            </View>
                        </View>
                    )}

                    {}
                    {messages.length === 1 && (
                        <View style={{ marginTop: 24 }}>
                            <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>Quick questions:</Text>
                            {quickQuestions.map((q, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setInput(q)}
                                    style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.05)', borderWidth: 1, borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }}
                                >
                                    <Text style={{ color: theme.primary, fontSize: 14 }}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
                >
                    <View style={{ padding: 16, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Ask The Oracle..."
                                placeholderTextColor={theme.textMuted}
                                style={{ flex: 1, color: theme.text, fontSize: 16, paddingVertical: 14 }}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={!input.trim() || loading}
                                style={{ opacity: input.trim() && !loading ? 1 : 0.5 }}
                            >
                                <LinearGradient
                                    colors={theme.gradientPrimary}
                                    style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Send color="#fff" size={18} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </GuestGuard>
    );
}
