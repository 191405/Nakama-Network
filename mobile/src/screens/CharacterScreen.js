import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { X, RefreshCw, Star, User, Heart } from 'lucide-react-native';
import api from '../services/api';

const { width } = Dimensions.get('window');

import { useTheme } from '../contexts/ThemeContext';

export default function CharacterScreen({ navigation, route }) {
    const { theme, isDark } = useTheme();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const { characterId } = route.params || {};

    useEffect(() => {
        loadCharacter();
    }, [characterId]);

    const loadCharacter = async () => {
        setLoading(true);
        try {
            let result;
            if (characterId) {
                result = await api.getCharacterDetails(characterId);
            } else {
                result = await api.getRandomCharacter();
            }

            if (result) {
                setCharacter(result);
            }
        } catch (e) {
            console.error('Failed to load character:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <LinearGradient
                colors={theme.gradientBg}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={theme.textSecondary} size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Star color={theme.gold} size={20} fill={theme.gold} />
                        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginLeft: 8 }}>
                            {characterId ? 'Character Details' : 'Character of the Day'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={loadCharacter}>
                    <RefreshCw color={theme.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flex: loading ? 1 : undefined }}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Loading character...</Text>
                    </View>
                ) : character && (
                    <>
                        {}
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            {character.image ? (
                                <Image
                                    source={{ uri: character.image }}
                                    style={{ width: 160, height: 200, borderRadius: 24, backgroundColor: theme.bgSecondary }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={theme.gradientPrimary}
                                    style={{ width: 160, height: 200, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16 }}
                                >
                                    <User color="#fff" size={64} />
                                </LinearGradient>
                            )}
                        </View>

                        {}
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ color: theme.text, fontSize: 28, fontWeight: '800', textAlign: 'center' }}>{character.name}</Text>
                            {character.nameKanji && (
                                <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>{character.nameKanji}</Text>
                            )}
                            {character.anime?.length > 0 && (
                                <Text style={{ color: theme.primaryLight, fontSize: 16, marginTop: 8 }}>from {character.anime[0].title}</Text>
                            )}
                        </View>

                        {}
                        {character.favorites > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)' }}>
                                    <Heart color="#ec4899" size={16} fill="#ec4899" />
                                    <Text style={{ color: '#ec4899', fontWeight: '600', marginLeft: 8 }}>{character.favorites.toLocaleString()} favorites</Text>
                                </View>
                            </View>
                        )}

                        {}
                        {character.about && (
                            <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
                                <Text style={{ color: theme.gold, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>ABOUT</Text>
                                <Text style={{ color: theme.text, fontSize: 15, lineHeight: 24 }} numberOfLines={10}>
                                    {character.about.replace(/\\n/g, '\n').split('\n')[0]}
                                </Text>
                            </View>
                        )}

                        {}
                        {character.anime?.length > 0 && (
                            <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border }}>
                                <Text style={{ color: theme.secondary, fontSize: 13, fontWeight: '600', marginBottom: 12 }}>APPEARS IN</Text>
                                {character.anime.slice(0, 5).map((a, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < character.anime.length - 1 ? 10 : 0 }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, marginRight: 10 }} />
                                        <Text style={{ color: theme.text, fontSize: 14, flex: 1 }}>{a.title}</Text>
                                        <Text style={{ color: theme.textMuted, fontSize: 12 }}>{a.role}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
