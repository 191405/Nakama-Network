import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    TextInput, ActivityIndicator, Dimensions, Animated, StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 3;

export default function CharactersScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchCharacters();
    }, [debouncedQuery, page]);

    const fetchCharacters = async () => {
        if (page === 1) setLoading(true);

        try {
            let response;
            if (debouncedQuery.length >= 3) {
                response = await api.searchCharacters(debouncedQuery, page, 50);
            } else {
                response = await api.getTopCharacters(page, 50);
            }

            if (response && response.characters) {
                if (page === 1) {
                    setCharacters(response.characters);
                } else {
                    setCharacters(prev => [...prev, ...response.characters]);
                }
                setHasMore(response.pagination.hasNextPage);
            }
        } catch (error) {
            console.error("Failed to fetch characters:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const renderHeader = () => (
        <View style={{ marginBottom: 20, paddingTop: insets.top + 10, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text }}>
                    Characters
                </Text>
                <TouchableOpacity
                    style={{
                        padding: 8,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        borderRadius: 20
                    }}
                >
                    <Ionicons name="filter" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}>
                <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                    placeholder="Search characters..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                        flex: 1,
                        fontSize: 16,
                        color: theme.text,
                        fontWeight: '500'
                    }}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderCharacterItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('CharacterDetail', { characterId: item.id })}
                style={{
                    width: COLUMN_WIDTH,
                    marginBottom: 20,
                    marginRight: (index + 1) % 3 === 0 ? 0 : 16,
                }}
            >
                <View style={{
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Image
                        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                        style={{
                            width: '100%',
                            height: COLUMN_WIDTH * 1.4,
                            borderRadius: 16,
                            backgroundColor: isDark ? '#334155' : '#e2e8f0'
                        }}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 60,
                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,
                        }}
                    />
                    {item.favorites && (
                        <View style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 10,
                        }}>
                            <Ionicons name="heart" size={10} color="#ef4444" style={{ marginRight: 2 }} />
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                                {item.favorites > 1000 ? `${(item.favorites / 1000).toFixed(1)}k` : item.favorites}
                            </Text>
                        </View>
                    )}
                </View>

                <Text
                    numberOfLines={2}
                    style={{
                        marginTop: 8,
                        fontSize: 13,
                        fontWeight: '600',
                        color: theme.text,
                        textAlign: 'center'
                    }}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <Animated.FlatList
                data={characters}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={renderCharacterItem}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 100
                }}
                ListHeaderComponent={renderHeader}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => (
                    loading && characters.length > 0 ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    ) : null
                )}
                ListEmptyComponent={() => (
                    !loading && (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
                                No characters found.
                            </Text>
                        </View>
                    )
                )}
            />
        </View>
    );
}
