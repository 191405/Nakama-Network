import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, Plus, Trash2, Check, Clock, Play, Eye, Star, Cloud, CloudOff } from 'lucide-react-native';
import { getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistStatus } from '../utils/storage';
import { syncToCloud } from '../services/userSync';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const STATUS_OPTIONS = [
    { id: 'planning', label: 'Plan to Watch', icon: Clock, color: '#6366f1' },
    { id: 'watching', label: 'Watching', icon: Play, color: '#f59e0b' },
    { id: 'completed', label: 'Completed', icon: Check, color: '#22c55e' },
];

const WatchlistItem = ({ anime, onStatusChange, onRemove }) => {
    const status = STATUS_OPTIONS.find(s => s.id === anime.status) || STATUS_OPTIONS[0];

    return (
        <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {anime.image ? (
                    <Image
                        source={{ uri: anime.image }}
                        style={{ width: 56, height: 80, borderRadius: 14, backgroundColor: '#334155' }}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6']}
                        style={{ width: 56, height: 80, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{anime.title?.[0]}</Text>
                    </LinearGradient>
                )}
                <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }} numberOfLines={2}>{anime.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        {Boolean(anime.genre) && <Text style={{ color: '#6366f1', fontSize: 12 }}>{anime.genre}</Text>}
                        {anime.year > 0 && <Text style={{ color: '#64748b', fontSize: 12 }}> • {anime.year}</Text>}
                    </View>
                    {anime.rating > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Star color="#fbbf24" size={12} fill="#fbbf24" />
                            <Text style={{ color: '#fbbf24', fontSize: 12, marginLeft: 4 }}>{anime.rating}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => onRemove(anime.id)}>
                    <Trash2 color="#ef4444" size={20} />
                </TouchableOpacity>
            </View>

            { }
            <View style={{ flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' }}>
                {STATUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                        key={opt.id}
                        onPress={() => onStatusChange(anime.id, opt.id)}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            marginHorizontal: 4,
                            borderRadius: 12,
                            backgroundColor: anime.status === opt.id ? `${opt.color}30` : 'rgba(255,255,255,0.05)',
                            borderWidth: 1,
                            borderColor: anime.status === opt.id ? opt.color : 'transparent'
                        }}
                    >
                        <opt.icon color={anime.status === opt.id ? opt.color : '#64748b'} size={14} />
                        <Text style={{ color: anime.status === opt.id ? opt.color : '#64748b', fontSize: 10, fontWeight: '600', marginLeft: 4 }}>{opt.label.split(' ')[0]}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default function WatchlistScreen({ navigation }) {
    const { currentUser, isGuest } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [filter, setFilter] = useState('all');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {
        const list = await getWatchlist();
        setWatchlist(list);
    };

    const handleStatusChange = async (animeId, status) => {
        await updateWatchlistStatus(animeId, status);
        loadWatchlist();
    };

    const handleRemove = async (animeId) => {
        Alert.alert(
            'Remove from Watchlist',
            'Are you sure you want to remove this anime?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove', style: 'destructive', onPress: async () => {
                        await removeFromWatchlist(animeId);
                        loadWatchlist();
                    }
                }
            ]
        );
    };

    const handleCloudSync = async () => {
        if (isGuest) {
            Alert.alert('Sign In Required', 'Create an account to sync your watchlist across devices.');
            return;
        }

        setSyncing(true);
        try {
            await syncToCloud();
            Alert.alert('Success', 'Your watchlist has been synced to the cloud!');
        } catch (e) {
            Alert.alert('Error', 'Failed to sync. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    const filteredList = filter === 'all'
        ? watchlist
        : watchlist.filter(a => a.status === filter);

    const stats = {
        planning: watchlist.filter(a => a.status === 'planning').length,
        watching: watchlist.filter(a => a.status === 'watching').length,
        completed: watchlist.filter(a => a.status === 'completed').length,
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />

            { }
            <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <X color="#94a3b8" size={24} />
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>My Watchlist</Text>
                    <TouchableOpacity onPress={handleCloudSync} disabled={syncing}>
                        {isGuest ? (
                            <CloudOff color="#475569" size={22} />
                        ) : (
                            <Cloud color={syncing ? '#475569' : '#3b82f6'} size={22} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            { }
            <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16 }}>
                {STATUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                        key={opt.id}
                        onPress={() => setFilter(filter === opt.id ? 'all' : opt.id)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: 12,
                            marginHorizontal: 4,
                            borderRadius: 16,
                            backgroundColor: filter === opt.id ? `${opt.color}20` : 'rgba(30, 41, 59, 0.6)',
                            borderWidth: 1,
                            borderColor: filter === opt.id ? opt.color : 'rgba(255,255,255,0.05)'
                        }}
                    >
                        <Text style={{ color: opt.color, fontSize: 20, fontWeight: 'bold' }}>{stats[opt.id]}</Text>
                        <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{opt.label.split(' ')[0]}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            { }
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
                {filteredList.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Eye color="#475569" size={48} />
                        <Text style={{ color: '#64748b', fontSize: 16, marginTop: 16 }}>Your watchlist is empty</Text>
                        <Text style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>Add anime from Discover or Search</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Search')}
                            style={{ marginTop: 20 }}
                        >
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Search Anime</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredList.map((anime) => (
                        <WatchlistItem
                            key={anime.id}
                            anime={anime}
                            onStatusChange={handleStatusChange}
                            onRemove={handleRemove}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
