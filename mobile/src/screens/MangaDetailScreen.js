import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, BookOpen, Clock, List, Share2, Heart, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function MangaDetailScreen({ route, navigation }) {
    const { mangaId } = route.params;
    const { theme, isDark } = useTheme();

    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        loadDetails();
    }, [mangaId]);

    const loadDetails = async () => {
        try {
            const data = await api.getMangaDetails(mangaId);
            setManga(data.manga);
            setChapters(data.chapters || []);
        } catch (e) {
            console.error('Failed to load manga details', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (chapterId) => {
        setDownloading(chapterId);
        
        await api.downloadChapter(chapterId);
        setTimeout(() => setDownloading(null), 1500); 
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.accent?.primary} />
            </View>
        );
    }

    if (!manga) return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style="light" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {}
                <View style={{ height: 360 }}>
                    <ImageBackground
                        source={{ uri: manga.cover_url }}
                        style={{ width: '100%', height: '100%' }}
                        blurRadius={10}
                    >
                        <LinearGradient
                            colors={['transparent', theme.bg]}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 }}
                        />
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 24, paddingTop: 60 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}>
                                <ArrowLeft color="#fff" size={24} />
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', marginTop: 40, alignItems: 'flex-end' }}>
                                <Image
                                    source={{ uri: manga.cover_url }}
                                    style={{ width: 120, height: 180, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}
                                />
                                <View style={{ flex: 1, marginLeft: 20, paddingBottom: 10 }}>
                                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 }} numberOfLines={3}>
                                        {manga.title}
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                                        {manga.genres?.slice(0, 3).map((genre, i) => (
                                            <View key={i} style={{ backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6, marginBottom: 4 }}>
                                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{genre}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {}
                <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: theme.primary, borderRadius: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        <BookOpen color="#fff" size={20} />
                        <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Start Reading</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: theme.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                        <Heart color={theme.textSecondary} size={24} />
                    </TouchableOpacity>
                </View>

                {}
                <View style={{ padding: 24 }}>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Synopsis</Text>
                    <Text style={{ color: theme.textSecondary, lineHeight: 22 }}>
                        {manga.description || "No description available."}
                    </Text>
                </View>

                {}
                <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Chapters</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{chapters.length} total</Text>
                    </View>

                    {chapters.map((chapter) => (
                        <TouchableOpacity
                            key={chapter.id}
                            onPress={() => navigation.navigate('MangaReader', { chapterId: chapter.id, title: chapter.title })}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.border
                            }}
                        >
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.bgSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                                <Text style={{ color: theme.textMuted, fontWeight: '700' }}>{chapter.chapter_number}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontWeight: '600' }} numberOfLines={1}>{chapter.title || `Chapter ${chapter.chapter_number}`}</Text>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                                    {new Date(chapter.published_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleDownload(chapter.id)}
                                style={{ padding: 10 }}
                            >
                                {downloading === chapter.id ? (
                                    <ActivityIndicator size="small" color={theme.primary} />
                                ) : (
                                    <Download color={theme.textMuted} size={20} />
                                )}
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}
