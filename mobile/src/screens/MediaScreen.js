import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { api, ANIME_GENRES } from '../services/api';
import { addToWatchlist } from '../utils/storage';
import { SearchIcon, FireIcon, AnimeIcon, StarIcon } from '../components/Icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

const AnimeCard = ({ anime, index, onPress }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { theme, isDark } = useTheme();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay: Math.min(index, 5) * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, marginRight: 16 }}>
            <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ width: CARD_WIDTH }}>
                <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: theme.bgCard }}>
                    {anime.image ? (
                        <Image
                            source={{ uri: anime.image }}
                            style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.4, backgroundColor: theme.border }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.4, backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: theme.textMuted, fontSize: 40 }}>{anime.title?.[0]}</Text>
                        </View>
                    )}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 40 }}
                    >
                        {anime.score && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <StarIcon size={14} color={theme.gold} filled />
                                <Text style={{ color: theme.gold, fontWeight: 'bold', marginLeft: 4, fontSize: 13 }}>{anime.score}</Text>
                            </View>
                        )}
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }} numberOfLines={2}>{anime.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            {anime.episodes && (
                                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>{anime.episodes} eps</Text>
                            )}
                            {anime.year && (
                                <Text style={{ color: '#94a3b8', fontSize: 12 }}> • {anime.year}</Text>
                            )}
                        </View>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const CategoryPill = ({ genre, selected, onPress }) => {
    const { theme, isDark } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.bgCard,
                marginRight: 10,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border
            }}
        >
            <Text style={{ color: selected ? '#fff' : theme.textSecondary, fontWeight: '600', fontSize: 14 }}>{genre.name}</Text>
        </TouchableOpacity>
    );
};

const SectionHeader = ({ icon: Icon, iconColor, title }) => {
    const { theme } = useTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
            <Icon size={22} color={iconColor} />
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginLeft: 10 }}>{title}</Text>
        </View>
    );
};

export default function MediaScreen() {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [seasonalAnime, setSeasonalAnime] = useState([]);
    const [popularAnime, setPopularAnime] = useState([]);
    const [genreAnime, setGenreAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [genreLoading, setGenreLoading] = useState(false);

    const [trendingPage, setTrendingPage] = useState(1);
    const [hasMoreTrending, setHasMoreTrending] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [trendingRes, seasonalRes, popularRes] = await Promise.all([
                api.getTrendingAnime(1, 10),
                api.getSeasonalAnime(1, 10),
                api.getPopularAnime(1, 10),
            ]);

            setTrendingAnime(trendingRes?.anime || []);
            setSeasonalAnime(seasonalRes?.anime || []);
            setPopularAnime(popularRes?.anime || []);
            setHasMoreTrending(trendingRes?.pagination?.hasNextPage || false);
        } catch (error) {
            console.error('Failed to load anime data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreTrending = async () => {
        if (loadingMore || !hasMoreTrending) return;

        setLoadingMore(true);
        try {
            const nextPage = trendingPage + 1;
            const res = await api.getTrendingAnime(nextPage, 10);

            if (res?.anime) {
                setTrendingAnime(prev => [...prev, ...res.anime]);
                setTrendingPage(nextPage);
                setHasMoreTrending(res.pagination?.hasNextPage || false);
            }
        } catch (error) {
            console.error('Failed to load more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleGenreSelect = async (genre) => {
        
        if (!genre.id || selectedGenre?.id === genre.id) {
            setSelectedGenre(null);
            setGenreAnime([]);
            return;
        }

        setSelectedGenre(genre);
        setGenreLoading(true);

        try {
            const res = await api.getAnimeByGenre(genre.id, 1, 20);
            setGenreAnime(res?.anime || []);
        } catch (error) {
            console.error('Failed to load genre:', error);
            setGenreAnime([]);
        } finally {
            setGenreLoading(false);
        }
    };

    const handleAnimePress = (anime) => {
        navigation.navigate('AnimeDetail', { anime });
    };

    const allGenres = [{ id: null, name: 'All' }, ...ANIME_GENRES];

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {}
                <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }}>
                    <Text style={{ color: theme.text, fontSize: 28, fontWeight: '800' }}>Discover</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Explore anime from around the world</Text>
                </View>

                {}
                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                    <LinearGradient
                        colors={isDark ? ['rgba(30, 41, 59, 0.9)', 'rgba(30, 41, 59, 0.7)'] : ['#f1f5f9', '#e2e8f0']}
                        style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: theme.border }}
                    >
                        <SearchIcon size={20} color={theme.textMuted} />
                        <Text style={{ color: theme.textMuted, fontSize: 16, marginLeft: 12 }}>Search anime...</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, marginBottom: 24 }}
                >
                    {allGenres.map((genre) => (
                        <CategoryPill
                            key={genre.id || 'all'}
                            genre={genre}
                            selected={selectedGenre?.id === genre.id}
                            onPress={() => handleGenreSelect(genre)}
                        />
                    ))}
                </ScrollView>

                {loading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{ color: theme.textMuted, marginTop: 16 }}>Loading anime...</Text>
                    </View>
                ) : (
                    <>
                        {}
                        {selectedGenre && (
                            <View style={{ marginBottom: 28 }}>
                                <SectionHeader icon={FireIcon} iconColor={theme.primary} title={selectedGenre.name} />
                                {genreLoading ? (
                                    <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
                                ) : (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 24 }}
                                    >
                                        {genreAnime.map((anime, index) => (
                                            <AnimeCard key={anime.id} anime={anime} index={index} onPress={() => handleAnimePress(anime)} />
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}

                        {}
                        <View style={{ marginBottom: 28 }}>
                            <SectionHeader icon={FireIcon} iconColor="#f59e0b" title="Trending Now" />
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 24 }}
                                onScroll={({ nativeEvent }) => {
                                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                                    const isNearEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 100;
                                    if (isNearEnd && hasMoreTrending && !loadingMore) {
                                        loadMoreTrending();
                                    }
                                }}
                                scrollEventThrottle={400}
                            >
                                {trendingAnime.map((anime, index) => (
                                    <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} onPress={() => handleAnimePress(anime)} />
                                ))}
                                {loadingMore && (
                                    <View style={{ width: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color={theme.primary} />
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {}
                        <View style={{ marginBottom: 28 }}>
                            <SectionHeader icon={AnimeIcon} iconColor="#3b82f6" title="Airing This Season" />
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 24 }}
                            >
                                {seasonalAnime.map((anime, index) => (
                                    <AnimeCard key={anime.id} anime={anime} index={index} onPress={() => handleAnimePress(anime)} />
                                ))}
                            </ScrollView>
                        </View>

                        {}
                        <View style={{ marginBottom: 28 }}>
                            <SectionHeader icon={StarIcon} iconColor="#fbbf24" title="Popular All Time" />
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 24 }}
                            >
                                {popularAnime.map((anime, index) => (
                                    <AnimeCard key={anime.id} anime={anime} index={index} onPress={() => handleAnimePress(anime)} />
                                ))}
                            </ScrollView>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
