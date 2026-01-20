import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Image, Keyboard, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Search, X, TrendingUp, Clock, Plus, Star, Check, RefreshCw } from 'lucide-react-native';
import api, { ANIME_GENRES } from '../services/api';
import { addToWatchlist, getWatchlist } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const TRENDING = ['Demon Slayer', 'Jujutsu Kaisen', 'One Piece', 'Attack on Titan', 'Spy x Family', 'Chainsaw Man', 'Blue Lock'];

const SearchResultCard = ({ anime, onAdd, isInWatchlist, onPress }) => {
    const { theme, isDark } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{
                backgroundColor: theme.bgCard,
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
                flexDirection: 'row',
                alignItems: 'flex-start'
            }}
        >
            {anime.image ? (
                <Image
                    source={{ uri: anime.thumbnail || anime.image }}
                    style={{ width: 64, height: 90, borderRadius: 14, backgroundColor: theme.border }}
                    resizeMode="cover"
                />
            ) : (
                <LinearGradient
                    colors={theme.gradientPrimary}
                    style={{ width: 64, height: 90, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 24 }}>
                        {typeof anime.title === 'string' ? anime.title[0] : (anime.title?.title?.[0] || 'A')}
                    </Text>
                </LinearGradient>
            )}
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }} numberOfLines={2}>
                    {typeof anime.title === 'object' ? (anime.title.title || anime.title.name || 'Anime') : anime.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                    {anime.genres?.slice(0, 2).map((genre, i) => (
                        <Text key={i} style={{ color: theme.primary, fontSize: 12, marginRight: 8 }}>{genre}</Text>
                    ))}
                    {anime.year && (
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{anime.year}</Text>
                    )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {(anime.score > 0 || (typeof anime.score === 'string' && anime.score)) && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                <Star color={theme.gold} size={14} fill={theme.gold} />
                                <Text style={{ color: theme.gold, fontSize: 13, marginLeft: 4, fontWeight: '600' }}>{anime.score}</Text>
                            </View>
                        )}
                        {anime.episodes > 0 && (
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{anime.episodes} eps</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => !isInWatchlist && onAdd(anime)}
                        disabled={isInWatchlist}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: isInWatchlist ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7') : (isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff'),
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: isInWatchlist ? (isDark ? 'rgba(34, 197, 94, 0.3)' : '#86efac') : (isDark ? 'rgba(99, 102, 241, 0.3)' : '#a5b4fc')
                        }}
                    >
                        {isInWatchlist ? <Check color={theme.success} size={16} /> : <Plus color={theme.primary} size={16} />}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function SearchScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [watchlistIds, setWatchlistIds] = useState([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [mode, setMode] = useState('random'); 

    useEffect(() => {
        loadWatchlist();
        loadFreshContent();
    }, []);

    const loadWatchlist = async () => {
        const list = await getWatchlist();
        setWatchlistIds(list.map(a => a.id));
    };

    const loadFreshContent = async (refresh = false) => {
        if (loading) return;

        setLoading(true);
        setMode('random');

        try {
            
            const randomPage = refresh ? Math.floor(Math.random() * 20) + 1 : page;
            if (refresh) {
                setResults([]);
                setPage(randomPage);
            }

            const response = await api.searchAnime('', randomPage, 20); 

            if (response?.anime?.length > 0) {
                setResults(prev => refresh ? response.anime : [...prev, ...response.anime]);
                setPage(prev => refresh ? randomPage + 1 : prev + 1);
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error('Failed to load fresh content:', e);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const debounceTimer = useRef(null);
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (query.trim().length < 2) {
            if (query.trim().length === 0 && mode === 'search') {
                loadFreshContent(true); 
            }
            return;
        }

        debounceTimer.current = setTimeout(() => {
            handleSearch(query, true);
        }, 400);

        return () => clearTimeout(debounceTimer.current);
    }, [query]);

    const handleSearch = async (searchQuery, isNewSearch = false) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        if (isNewSearch) {
            setResults([]);
            setPage(1);
            setHasMore(true);
            setMode('search');
        }

        try {
            const currentPage = isNewSearch ? 1 : page;
            const response = await api.searchAnime(searchQuery, currentPage, 20);

            const newResults = response?.anime || [];

            if (newResults.length < 20) setHasMore(false);

            setResults(prev => isNewSearch ? newResults : [...prev, ...newResults]);
            setPage(prev => currentPage + 1);

            if (isNewSearch) {
                setRecentSearches(prev => [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5));
            }
        } catch (e) {
            console.error('Search failed:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWatchlist = async (anime) => {
        await addToWatchlist({
            id: anime.id,
            title: anime.title,
            image: anime.image,
            genre: anime.genres?.[0] || 'Anime',
            year: anime.year,
            rating: anime.score,
        });
        setWatchlistIds(prev => [...prev, anime.id]);
    };

    const onEndReached = () => {
        if (!loading && hasMore) {
            if (mode === 'search') {
                handleSearch(query, false);
            } else {

                loadMoreRandom();
            }
        }
    };

    const loadMoreRandom = async () => {
        setLoading(true);
        try {
            const response = await api.searchAnime('', page, 20);
            const newResults = response?.anime || [];
            if (newResults.length === 0) setHasMore(false);

            setResults(prev => [...prev, ...newResults]);
            setPage(prev => prev + 1);
        } catch (e) {
            console.error('Load more failed', e);
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={{ marginBottom: 16 }}>
            {mode === 'random' && !query && (
                <>
                    {}
                    <View style={{ marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <TrendingUp color={theme.gold} size={18} />
                            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Trending Searches</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {TRENDING.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => setQuery(item)}
                                    style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fcd34d' }}
                                >
                                    <Text style={{ color: theme.gold, fontSize: 13, fontWeight: '500' }}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Browse by Genre</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {ANIME_GENRES.slice(0, 8).map((genre) => (
                                <TouchableOpacity
                                    key={genre.id}
                                    onPress={() => setQuery(genre.name)}
                                    style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#a5b4fc' }}
                                >
                                    <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '500' }}>{genre.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </>
            )}

            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
                {mode === 'search' ? `Results for "${query}"` : "Discover Anime"}
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800' }}>Discover</Text>
                    <TouchableOpacity onPress={() => loadFreshContent(true)} style={{ padding: 8 }}>
                        <RefreshCw color={theme.textSecondary} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {}
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
                    <Search color={theme.textMuted} size={20} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search anime titles..."
                        placeholderTextColor={theme.textMuted}
                        style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: theme.text, fontSize: 16 }}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); Keyboard.dismiss(); loadFreshContent(true); }}>
                            <X color={theme.textSecondary} size={18} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString() + Math.random()}
                renderItem={({ item }) => (
                    <SearchResultCard
                        anime={item}
                        onAdd={handleAddToWatchlist}
                        isInWatchlist={watchlistIds.includes(item.id)}
                        onPress={() => navigation.navigate('AnimeDetail', { anime: item })}
                    />
                )}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                ListHeaderComponent={renderHeader}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading && <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />}
                refreshing={isRefreshing}
                onRefresh={() => loadFreshContent(true)}
            />
        </View>
    );
}
