import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Users, Search, Send, Circle, Plus, Shield } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { api, getClans, createClan, joinClan, getUserClan } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import GuestGuard from '../components/GuestGuard';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const ChatItem = ({ chat }) => {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { roomId: chat.id, name: chat.name })}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: chat.unread > 0 ? (isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff') : 'transparent', borderBottomWidth: 1, borderBottomColor: theme.border }}
        >
            <View style={{ position: 'relative' }}>
                <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{chat.name[0]}</Text>
                </View>
                {chat.online && (
                    <View style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: theme.success, borderWidth: 2, borderColor: theme.bg }} />
                )}
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16 }}>{chat.name}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>{chat.time}</Text>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }} numberOfLines={1}>{chat.message}</Text>
            </View>

            {chat.unread > 0 && (
                <View style={{ marginLeft: 12, backgroundColor: theme.primary, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{chat.unread}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default function SocialScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('chats');
    const { userProfile } = useAuth();
    const { theme, isDark } = useTheme();

    const [clans, setClans] = useState([]);
    const [myClan, setMyClan] = useState(null);
    const [loading, setLoading] = useState(false);

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newClanName, setNewClanName] = useState('');
    const [newClanDesc, setNewClanDesc] = useState('');

    const [chats, setChats] = useState([]);

    React.useEffect(() => {
        if (activeTab === 'chats') {
            loadChats();
        } else if (activeTab === 'clans') {
            loadClansData();
        }
    }, [activeTab]);

    const loadChats = async () => {
        try {
            const data = await api.getRecentChats(userProfile?.displayName || '');
            setChats(data || []);
        } catch (e) {
            console.error("Failed to load chats", e);
        }
    };

    const loadClansData = async () => {
        setLoading(true);
        try {
            const [allClans, userClan] = await Promise.all([
                getClans(),
                userProfile?.uid ? getUserClan(userProfile.uid) : null
            ]);
            setClans(allClans || []);
            setMyClan(userClan);
        } catch (e) {
            console.error("Failed to load clans", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClan = async () => {
        if (!userProfile?.uid) return;
        try {
            await createClan({
                name: newClanName,
                description: newClanDesc,
                leader_id: userProfile.uid
            });
            Alert.alert("Success", "Clan created!");
            setCreateModalVisible(false);
            setNewClanName('');
            loadClansData();
        } catch (e) {
            Alert.alert("Error", "Failed to create clan. Name might be taken.");
        }
    };

    const handleJoin = async (clanId) => {
        if (!userProfile?.uid) {
            Alert.alert("Sign In Needed", "Please sign in to join a clan.");
            return;
        }
        try {
            await joinClan(clanId, userProfile.uid);
            Alert.alert("Welcome", "You have joined the clan!");
            loadClansData();
        } catch (e) {
            Alert.alert("Error", "Could not join clan.");
        }
    };

    return (
        <GuestGuard feature="Social & Clans">
            <View style={{ flex: 1, backgroundColor: theme.bg }}>
                <StatusBar style={isDark ? "light" : "dark"} />

                {}
                <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>
                    <Text style={{ color: theme.text, fontSize: 28, fontWeight: '800' }}>Social</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>Connect with your nakama</Text>
                </View>

                {}
                <View style={{ flexDirection: 'row', marginHorizontal: 24, marginBottom: 16, backgroundColor: theme.bgCard, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: theme.border }}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('chats')}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: activeTab === 'chats' ? (isDark ? '#3b82f6' : '#e0e7ff') : 'transparent', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <MessageCircle color={activeTab === 'chats' ? (isDark ? '#fff' : '#4338ca') : theme.textMuted} size={18} />
                        <Text style={{ color: activeTab === 'chats' ? (isDark ? '#fff' : '#4338ca') : theme.textMuted, fontWeight: '600', marginLeft: 8 }}>Chats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('clans')}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: activeTab === 'clans' ? (isDark ? '#3b82f6' : '#e0e7ff') : 'transparent', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Users color={activeTab === 'clans' ? (isDark ? '#fff' : '#4338ca') : theme.textMuted} size={18} />
                        <Text style={{ color: activeTab === 'clans' ? (isDark ? '#fff' : '#4338ca') : theme.textMuted, fontWeight: '600', marginLeft: 8 }}>Clans</Text>
                    </TouchableOpacity>
                </View>

                {}
                <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.border }}>
                        <Search color={theme.textMuted} size={18} />
                        <TextInput
                            placeholder={activeTab === 'chats' ? 'Search messages...' : 'Find a clan...'}
                            placeholderTextColor={theme.textMuted}
                            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: theme.text, fontSize: 15 }}
                        />
                    </View>
                </View>

                {}
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {activeTab === 'chats' ? (
                        chats.length > 0 ? (
                            chats.map((chat) => <ChatItem key={chat.id} chat={chat} />)
                        ) : (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <MessageCircle color={theme.textMuted} size={48} />
                                <Text style={{ color: theme.textSecondary, marginTop: 16 }}>No recent chats</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Chat', { roomId: 'global_chat', name: 'Global Chat' })}
                                    style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: theme.primary, borderRadius: 24 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Join Global Chat</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View style={{ paddingHorizontal: 24 }}>
                            {!userProfile ? (
                                <View style={{ alignItems: 'center', padding: 20 }}>
                                    <Text style={{ color: theme.textMuted }}>Sign in to view clans</Text>
                                </View>
                            ) : loading ? (
                                <ActivityIndicator color={theme.primary} />
                            ) : myClan ? (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Chat', { roomId: `clan_${myClan.id}`, name: myClan.name })}
                                    style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.primary, marginBottom: 20 }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Shield color="#fff" size={24} />
                                        </View>
                                        <View>
                                            <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>{myClan.name}</Text>
                                            <Text style={{ color: theme.primaryLight, fontWeight: '600' }}>My Clan</Text>
                                        </View>
                                    </View>
                                    <Text style={{ color: theme.textSecondary, marginBottom: 16 }}>{myClan.description}</Text>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)', borderRadius: 8 }}>
                                            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{myClan.member_count} Members</Text>
                                        </View>
                                        <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)', borderRadius: 8 }}>
                                            <Text style={{ color: theme.textMuted, fontSize: 12 }}>Leader: {myClan.leader_id.substring(0, 6)}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setCreateModalVisible(true)}
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary, padding: 16, borderRadius: 16, marginBottom: 20 }}
                                    >
                                        <Plus color="#fff" size={20} />
                                        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Create New Clan</Text>
                                    </TouchableOpacity>

                                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Discover Clans</Text>
                                    {clans.map((clan) => (
                                        <View
                                            key={clan.id}
                                            style={{ backgroundColor: theme.bgCard, borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Users color="#fff" size={24} />
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 14 }}>
                                                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{clan.name}</Text>
                                                    <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{clan.member_count} members</Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleJoin(clan.id)}
                                                >
                                                    <LinearGradient
                                                        colors={theme.gradientPrimary}
                                                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                                                    >
                                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Join</Text>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={createModalVisible}
                    onRequestClose={() => setCreateModalVisible(false)}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                            <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Create a Clan</Text>

                            <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>Clan Name</Text>
                            <TextInput
                                style={{ backgroundColor: theme.bg, borderRadius: 12, padding: 16, color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}
                                placeholder="e.g. Hidden Cloud Village"
                                placeholderTextColor={theme.textMuted}
                                value={newClanName}
                                onChangeText={setNewClanName}
                            />

                            <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>Description</Text>
                            <TextInput
                                style={{ backgroundColor: theme.bg, borderRadius: 12, padding: 16, color: theme.text, height: 80, textAlignVertical: 'top', marginBottom: 24, borderWidth: 1, borderColor: theme.border }}
                                multiline
                                placeholder="What is your clan about?"
                                placeholderTextColor={theme.textMuted}
                                value={newClanDesc}
                                onChangeText={setNewClanDesc}
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={{ flex: 1, padding: 16, alignItems: 'center' }}>
                                    <Text style={{ color: theme.textMuted, fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCreateClan} style={{ flex: 1, backgroundColor: theme.primary, padding: 16, borderRadius: 16, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Clan</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </GuestGuard>
    );
}
