import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, AppState } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeftIcon, SendIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import UserProfileModal from '../components/UserProfileModal';
import { api, API_BASE_URL } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const WS_CONFIG = {
    getUrl: () => {
        const httpUrl = API_BASE_URL || 'http://192.168.1.113:8001';
        return httpUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
    },
    RECONNECT_DELAY_MS: 2000,
    MAX_RECONNECT_ATTEMPTS: 15,
    HEARTBEAT_INTERVAL_MS: 20000,
    CONNECTION_TIMEOUT_MS: 8000,
};

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const { userProfile } = useAuth();
    const { roomId = 'general', name = 'General Chat' } = route.params || {};

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [profileModal, setProfileModal] = useState({ visible: false, userId: null, userName: null });

    const ws = useRef(null);
    const flatListRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimeout = useRef(null);
    const heartbeatInterval = useRef(null);
    const isUnmounting = useRef(false);
    const appState = useRef(AppState.currentState);

    const userName = typeof userProfile?.displayName === 'string' ? userProfile.displayName : 'Guest_Ninja';

    const cleanup = useCallback(() => {

        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
        }

        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
        }

        if (ws.current) {
            try {
                ws.current.onopen = null;
                ws.current.onmessage = null;
                ws.current.onerror = null;
                ws.current.onclose = null;

                if (ws.current.readyState === WebSocket.OPEN ||
                    ws.current.readyState === WebSocket.CONNECTING) {
                    ws.current.close(1000, 'User left');
                }
            } catch (e) {
                console.log('Cleanup error:', e);
            }
            ws.current = null;
        }
    }, []);

    const startHeartbeat = useCallback(() => {

        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
        }

        heartbeatInterval.current = setInterval(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                try {
                    ws.current.send(JSON.stringify({ type: 'ping' }));
                } catch (e) {
                    console.log('Heartbeat send failed:', e);
                }
            }
        }, WS_CONFIG.HEARTBEAT_INTERVAL_MS);
    }, []);

    const connectWebSocket = useCallback(() => {
        if (isUnmounting.current) return;
        if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

        cleanup();

        setIsConnecting(true);
        setConnectionError(null);

        const wsUrl = `${WS_CONFIG.getUrl()}/${roomId}/${encodeURIComponent(userName)}`;
        console.log('Connecting to WebSocket:', wsUrl);

        try {
            ws.current = new WebSocket(wsUrl);

            const connectionTimeout = setTimeout(() => {
                if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
                    console.log('Connection timeout');
                    ws.current.close();
                    handleReconnect();
                }
            }, WS_CONFIG.CONNECTION_TIMEOUT_MS);

            ws.current.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('✅ WebSocket Connected');
                setIsConnected(true);
                setIsConnecting(false);
                setConnectionError(null);
                reconnectAttempts.current = 0;

                startHeartbeat();
            };

            ws.current.onmessage = (e) => {
                try {
                    const message = JSON.parse(e.data);

                    switch (message.type) {
                        case 'pong':

                            break;

                        case 'connected':

                            if (message.room_stats) {
                                setOnlineCount(message.room_stats.clients || 0);
                            }
                            break;

                        case 'error':
                            console.warn('Server error:', message.message);
                            if (message.message?.includes('Rate limit')) {
                                setConnectionError('Slow down! Rate limit exceeded.');
                                setTimeout(() => setConnectionError(null), 3000);
                            }
                            break;

                        case 'timeout':
                            console.log('Connection timeout from server');
                            handleReconnect();
                            break;

                        case 'system':

                            setMessages(prev => [...prev, message]);
                            if (message.room_stats) {
                                setOnlineCount(message.room_stats.clients || 0);
                            }
                            break;

                        case 'typing':

                            break;

                        case 'message':
                        default:

                            setMessages(prev => [...prev, message]);
                            break;
                    }
                } catch (err) {
                    console.error('Failed to parse message:', err);
                }
            };

            ws.current.onerror = (e) => {
                console.error('WebSocket error:', e.message || 'Unknown error');
                clearTimeout(connectionTimeout);
            };

            ws.current.onclose = (e) => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket closed:', e.code, e.reason);
                setIsConnected(false);
                setIsConnecting(false);

                if (heartbeatInterval.current) {
                    clearInterval(heartbeatInterval.current);
                    heartbeatInterval.current = null;
                }

                if (!isUnmounting.current && e.code !== 1000) {
                    handleReconnect();
                }
            };

        } catch (e) {
            console.error('WebSocket connection failed:', e);
            setIsConnecting(false);
            setConnectionError('Failed to connect');
            handleReconnect();
        }
    }, [roomId, userName, cleanup, startHeartbeat]);

    const handleReconnect = useCallback(() => {
        if (isUnmounting.current) return;

        if (reconnectAttempts.current >= WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
            setConnectionError('Unable to connect. Please check your connection.');
            return;
        }

        reconnectAttempts.current += 1;
        const delay = WS_CONFIG.RECONNECT_DELAY_MS * Math.min(reconnectAttempts.current, 5);

        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
        setConnectionError(`Reconnecting... (${reconnectAttempts.current}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS})`);

        reconnectTimeout.current = setTimeout(() => {
            if (!isUnmounting.current) {
                connectWebSocket();
            }
        }, delay);
    }, [connectWebSocket]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {

                console.log('App active - checking WebSocket');
                if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
                    reconnectAttempts.current = 0;
                    connectWebSocket();
                }
            } else if (nextAppState.match(/inactive|background/)) {

                if (heartbeatInterval.current) {
                    clearInterval(heartbeatInterval.current);
                    heartbeatInterval.current = null;
                }
            }
            appState.current = nextAppState;
        });

        return () => subscription?.remove();
    }, [connectWebSocket]);

    useEffect(() => {
        isUnmounting.current = false;
        loadHistory();
        connectWebSocket();

        return () => {
            isUnmounting.current = true;
            cleanup();
        };
    }, []);

    const loadHistory = async () => {
        try {
            const history = await api.getChatHistory(roomId);
            if (history) {
                setMessages(history);
            }
        } catch (err) {
            console.error("Failed to load chat history", err);
        }
    };

    const sendMessage = useCallback(() => {
        if (!inputText.trim()) return;

        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            setConnectionError('Not connected. Reconnecting...');
            handleReconnect();
            return;
        }

        const message = {
            type: 'message',
            text: inputText.trim(),
            avatar: userProfile?.photoURL || null,
        };

        try {
            ws.current.send(JSON.stringify(message));
            setInputText('');
        } catch (e) {
            console.error('Failed to send message:', e);
            setConnectionError('Failed to send message');
        }
    }, [inputText, userProfile, handleReconnect]);

    const manualReconnect = useCallback(() => {
        reconnectAttempts.current = 0;
        setConnectionError(null);
        connectWebSocket();
    }, [connectWebSocket]);

    const renderItem = ({ item }) => {
        if (item.type === 'system') {
            return (
                <View style={{ alignItems: 'center', marginVertical: 12, opacity: 0.7 }}>
                    <Text style={{ color: theme.textMuted, fontSize: 11, fontStyle: 'italic' }}>
                        {typeof item.message === 'object' ? (item.message.text || JSON.stringify(item.message)) : item.message}
                    </Text>
                </View>
            );
        }

        const safeUserName = (item.user && typeof item.user === 'object')
            ? (item.user.name || item.user.user_name || item.user.title || 'User')
            : (item.user || 'User');
        const safeMyName = typeof userName === 'object' && userName ? (userName.name || userName.user_name || userName.title || 'Guest_Ninja') : userName;
        const isMe = safeUserName === safeMyName;
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={{ marginBottom: 16, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', paddingHorizontal: 4 }}>
                { }
                <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: isMe ? theme.primary : theme.bgSecondary,
                    marginRight: isMe ? 0 : 8, marginLeft: isMe ? 8 : 0,
                    borderWidth: 2, borderColor: theme.border,
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                    ) : (
                        <Text style={{ color: isMe ? '#fff' : theme.textSecondary, fontSize: 14, fontWeight: 'bold' }}>
                            {(typeof safeUserName === 'string' ? safeUserName : 'U')[0]?.toUpperCase()}
                        </Text>
                    )}
                </View>

                { }
                <View style={{ maxWidth: '75%' }}>
                    {!isMe && (
                        <TouchableOpacity onPress={() => setProfileModal({ visible: true, userId: item.user_id || safeUserName, userName: safeUserName })}>
                            <Text style={{ color: theme.primaryLight, fontSize: 10, marginBottom: 4, marginLeft: 4, fontWeight: '600' }}>{safeUserName}</Text>
                        </TouchableOpacity>
                    )}
                    <View
                        style={{
                            backgroundColor: isMe ? theme.primary : (isDark ? '#334155' : '#e2e8f0'),
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 18,
                            borderBottomRightRadius: isMe ? 4 : 18,
                            borderBottomLeftRadius: isMe ? 18 : 4,
                            shadowColor: theme.shadow || '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2
                        }}
                    >
                        <Text style={{ color: isMe ? '#fff' : theme.text, fontSize: 15, lineHeight: 20 }}>{item.text}</Text>
                    </View>
                    <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 4, textAlign: isMe ? 'right' : 'left', opacity: 0.8 }}>{time}</Text>
                </View>
            </View>
        );
    };

    const renderConnectionStatus = () => {
        if (connectionError) {
            return (
                <TouchableOpacity
                    onPress={manualReconnect}
                    style={{
                        backgroundColor: '#ef4444',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 12, marginRight: 8 }}>{connectionError}</Text>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Tap to retry</Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            { }
            <View style={{ paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgSecondary, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
                    <ArrowLeftIcon size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            width: 8, height: 8, borderRadius: 4,
                            backgroundColor: isConnected ? theme.online : (isConnecting ? '#f59e0b' : theme.offline),
                            marginRight: 6
                        }} />
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                            {isConnected ? `${onlineCount} online` : (isConnecting ? 'Connecting...' : 'Disconnected')}
                        </Text>
                    </View>
                </View>
            </View>

            { }
            {renderConnectionStatus()}

            { }
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            { }
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.bgSecondary }}>
                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.textMuted}
                        style={{ flex: 1, backgroundColor: theme.bgInput, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: theme.text, fontSize: 16, marginRight: 12 }}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                        editable={isConnected}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        style={{
                            width: 48, height: 48, borderRadius: 24,
                            backgroundColor: isConnected && inputText.trim() ? theme.primary : (isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)'),
                            alignItems: 'center', justifyContent: 'center'
                        }}
                        disabled={!isConnected || !inputText.trim()}
                    >
                        {isConnecting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <SendIcon size={20} color={isConnected ? "#fff" : theme.textMuted} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            { }
            <UserProfileModal
                visible={profileModal.visible}
                onClose={() => setProfileModal({ visible: false, userId: null, userName: null })}
                userId={profileModal.userId}
                userName={profileModal.userName}
            />
        </View>
    );
}
