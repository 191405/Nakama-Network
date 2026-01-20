import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause, SkipBack, SkipForward, Search, Heart, Music, Disc, Volume2, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';

const ANIME_TRACKS = [
    {
        id: '1',
        name: 'Battle Theme',
        artist: 'Epic Anime OST',
        genre: 'Action',
        duration: '3:45',
        thumbnail: 'https://picsum.photos/seed/anime1/200',
        
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
        id: '2',
        name: 'Peaceful Village',
        artist: 'Slice of Life OST',
        genre: 'Calm',
        duration: '4:20',
        thumbnail: 'https://picsum.photos/seed/anime2/200',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
        id: '3',
        name: 'Epic Showdown',
        artist: 'Shounen Battle',
        genre: 'Intense',
        duration: '5:12',
        thumbnail: 'https://picsum.photos/seed/anime3/200',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
        id: '4',
        name: 'Emotional Farewell',
        artist: 'Drama OST',
        genre: 'Sad',
        duration: '4:55',
        thumbnail: 'https://picsum.photos/seed/anime4/200',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    },
    {
        id: '5',
        name: 'Victory March',
        artist: 'Hero Theme',
        genre: 'Triumphant',
        duration: '3:30',
        thumbnail: 'https://picsum.photos/seed/anime5/200',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    },
    {
        id: '6',
        name: 'Night Sky Romance',
        artist: 'Romance OST',
        genre: 'Romantic',
        duration: '4:10',
        thumbnail: 'https://picsum.photos/seed/anime6/200',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
    },
];

export default function MusicScreen() {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();

    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const soundRef = useRef(null);

    useEffect(() => {
        
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        return () => {
            
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const playTrack = async (track) => {
        try {
            setIsLoading(true);

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: track.audioUrl },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            soundRef.current = sound;
            setCurrentTrack(track);
            setIsPlaying(true);

        } catch (error) {
            console.error('Error playing track:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                
                playNextTrack();
            }
        }
    };

    const togglePlayPause = async () => {
        if (!soundRef.current) return;

        if (isPlaying) {
            await soundRef.current.pauseAsync();
        } else {
            await soundRef.current.playAsync();
        }
    };

    const playNextTrack = () => {
        if (!currentTrack) return;
        const currentIndex = ANIME_TRACKS.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % ANIME_TRACKS.length;
        playTrack(ANIME_TRACKS[nextIndex]);
    };

    const playPrevTrack = () => {
        if (!currentTrack) return;
        const currentIndex = ANIME_TRACKS.findIndex(t => t.id === currentTrack.id);
        const prevIndex = currentIndex === 0 ? ANIME_TRACKS.length - 1 : currentIndex - 1;
        playTrack(ANIME_TRACKS[prevIndex]);
    };

    const toggleFavorite = (trackId) => {
        if (favorites.includes(trackId)) {
            setFavorites(favorites.filter(id => id !== trackId));
        } else {
            setFavorites([...favorites, trackId]);
        }
    };

    const formatTime = (millis) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = Math.floor((millis % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderTrack = ({ item }) => (
        <TouchableOpacity
            onPress={() => playTrack(item)}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: currentTrack?.id === item.id ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff') : 'transparent',
                borderBottomWidth: 1,
                borderBottomColor: theme.border
            }}
        >
            {}
            <Image
                source={{ uri: item.thumbnail }}
                style={{ width: 50, height: 50, borderRadius: 8 }}
            />

            {}
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>{item.name}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{item.artist}</Text>
            </View>

            {}
            <Text style={{ color: theme.textMuted, fontSize: 12, marginRight: 12 }}>{item.duration}</Text>

            {}
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                <Heart
                    size={20}
                    color={favorites.includes(item.id) ? '#ef4444' : theme.textMuted}
                    fill={favorites.includes(item.id) ? '#ef4444' : 'none'}
                />
            </TouchableOpacity>

            {}
            {currentTrack?.id === item.id && isPlaying && (
                <View style={{ marginLeft: 8 }}>
                    <Volume2 size={18} color={theme.accent?.primary || '#6366f1'} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
                        <X size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800' }}>🎵 Music</Text>
                </View>
            </View>

            {}
            <FlatList
                data={ANIME_TRACKS}
                renderItem={renderTrack}
                keyExtractor={item => item.id}
                ListHeaderComponent={() => (
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Anime Style Music</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
                            Tap a track to play in-app
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: currentTrack ? 150 : 50 }}
            />

            {}
            {currentTrack && (
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: theme.bgCard,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    paddingBottom: 30
                }}>
                    {}
                    <View style={{ height: 3, backgroundColor: theme.bgSecondary }}>
                        <View style={{
                            height: 3,
                            width: duration > 0 ? `${(position / duration) * 100}%` : '0%',
                            backgroundColor: theme.accent?.primary || '#6366f1'
                        }} />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                        {}
                        <Image
                            source={{ uri: currentTrack.thumbnail }}
                            style={{ width: 50, height: 50, borderRadius: 8 }}
                        />

                        {}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: theme.text, fontWeight: '600' }} numberOfLines={1}>
                                {currentTrack.name}
                            </Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                                {formatTime(position)} / {formatTime(duration)}
                            </Text>
                        </View>

                        {}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <TouchableOpacity onPress={playPrevTrack}>
                                <SkipBack size={24} color={theme.text} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={togglePlayPause}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: theme.accent?.primary || '#6366f1',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : isPlaying ? (
                                    <Pause size={24} color="#fff" fill="#fff" />
                                ) : (
                                    <Play size={24} color="#fff" fill="#fff" />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={playNextTrack}>
                                <SkipForward size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
