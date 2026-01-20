import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, VideoIcon, PlayIcon, TrashIcon } from '../components/Icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function UploadsScreen() {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const { userProfile } = useAuth();

    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadEpisodes();
    }, []);

    const loadEpisodes = async () => {
        try {
            const data = await api.getAllEpisodes(50);
            setEpisodes(data || []);
        } catch (error) {
            console.error('Failed to load episodes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadEpisodes();
    };

    const handleDelete = (episode) => {
        Alert.alert(
            'Delete Episode',
            `Are you sure you want to delete "${episode.anime_title} - Episode ${episode.episode_number}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteEpisode(episode.id);
                            setEpisodes(prev => prev.filter(e => e.id !== episode.id));
                            Alert.alert('Deleted', 'Episode removed successfully.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete episode.');
                        }
                    }
                }
            ]
        );
    };

    const handlePlay = (episode) => {
        
        navigation.navigate('VideoPlayer', {
            videoUrl: episode.video_url,
            title: `${episode.anime_title} - Ep ${episode.episode_number}`
        });
    };

    const renderEpisode = ({ item }) => (
        <View style={{
            backgroundColor: theme.bgCard,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.border
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <VideoIcon size={24} color={theme.accent?.primary || '#6366f1'} />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                        {item.anime_title}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
                        Episode {item.episode_number} {item.title ? `• ${item.title}` : ''}
                    </Text>
                    <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>
                        {item.quality}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => handlePlay(item)}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: theme.accent?.primary || '#6366f1',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <PlayIcon size={18} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <TrashIcon size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.accent?.primary || '#6366f1'} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
                        <ArrowLeftIcon size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800' }}>Browse Uploads</Text>
                </View>
                <Text style={{ color: theme.textSecondary, marginLeft: 48, fontSize: 14 }}>
                    {episodes.length} episodes available
                </Text>
            </View>

            {episodes.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <VideoIcon size={60} color={theme.textMuted} />
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 20 }}>
                        No Uploads Yet
                    </Text>
                    <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
                        Be the first to upload content!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreatorStudio')}
                        style={{
                            backgroundColor: theme.accent?.primary || '#6366f1',
                            paddingHorizontal: 24,
                            paddingVertical: 14,
                            borderRadius: 12,
                            marginTop: 24
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Upload Episode</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={episodes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderEpisode}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.accent?.primary || '#6366f1'}
                        />
                    }
                />
            )}
        </View>
    );
}
