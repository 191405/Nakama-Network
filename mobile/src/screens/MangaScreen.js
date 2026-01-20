import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, BookOpen } from 'lucide-react-native';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT - 8;

const MangaCard = ({ manga, onPress, theme }) => (
    <TouchableOpacity
        style={{ width: ITEM_WIDTH, marginBottom: 16, marginRight: 8 }}
        onPress={() => onPress(manga)}
        activeOpacity={0.8}
    >
        <Image
            source={{ uri: manga.cover_url || 'https://via.placeholder.com/150?text=No+Cover' }}
            style={{ width: '100%', height: ITEM_WIDTH * 1.5, borderRadius: 12, backgroundColor: theme.bgCard }}
            resizeMode="cover"
        />
        <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }} numberOfLines={2}>{manga.title}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>{manga.year || 'Unknown'}</Text>
        </View>

        {manga.status && (
            <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', textTransform: 'capitalize' }}>{manga.status}</Text>
            </View>
        )}
    </TouchableOpacity>
);

export default function MangaScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [mangaList, setMangaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadManga();
    }, []);

    const loadManga = async (refresh = false) => {
        if (loading && !refresh) return;
        if (!refresh) setLoading(true);

        try {
            const result = searchQuery
                ? await api.searchManga(searchQuery)
                : await api.listManga(1);

            const data = result.results || result.manga || [];
            if (refresh) {
                setMangaList(data);
                setRefreshing(false);
            } else {
                setMangaList(data);
            }
        } catch (e) {
            console.error('Failed to load manga', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = () => {
        setLoading(true);
        loadManga(true);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadManga(true);
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 }}>
                <Text style={{ color: theme.text, fontSize: 28, fontWeight: '800' }}>Manga</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Read your favorites from MangaDex</Text>
            </View>

            {}
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
                    <Search color={theme.textMuted} size={20} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        placeholder="Search manga..."
                        placeholderTextColor={theme.textMuted}
                        style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: theme.text, fontSize: 16 }}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.accent?.primary} />
                </View>
            ) : (
                <FlatList
                    data={mangaList}
                    keyExtractor={item => item.id.toString()}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <MangaCard
                            manga={item}
                            theme={theme}
                            onPress={(m) => navigation.navigate('MangaDetail', { mangaId: m.id })}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <BookOpen size={48} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, marginTop: 16 }}>No manga found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
