import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, ImageBackground, Animated, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { api, getEpisodes, getReviews, createReview } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist } from '../utils/storage';
import {
    ArrowLeftIcon,
    HeartIcon,
    StarIcon,
    ShareIcon,
    PlayIcon,
    VideoIcon
} from '../components/Icons';
import { shareAnime } from '../utils/share';

const { width, height } = Dimensions.get('window');

export default function AnimeDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { anime: initialAnime } = route.params;

    const [anime, setAnime] = useState(initialAnime);
    const [loading, setLoading] = useState(true);
    const [characters, setCharacters] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('About'); 

    const [modalVisible, setModalVisible] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');

    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [hasAwardedXP, setHasAwardedXP] = useState(false);
    const videoRef = useRef(null);
    const { userProfile } = useAuth();

    const handleEpisodeComplete = async () => {
        if (userProfile?.uid && !hasAwardedXP) {
            try {
                const result = await api.addXP(userProfile.uid, 50, 'watch');
                Alert.alert("Episode Complete!", `+50 Chakra Points!\nRank: ${result.rank}`);
                setHasAwardedXP(true);
            } catch (e) {
                console.error("Error awarding XP:", e);
            }
        }
    };

    useEffect(() => {
        loadFullDetails();
    }, [initialAnime.id]);

    const loadFullDetails = async () => {
        try {
            const [details, chars, eps, revs] = await Promise.all([
                api.getAnimeDetails(initialAnime.id),
                api.getAnimeCharacters(initialAnime.id),
                getEpisodes(initialAnime.id),
                getReviews(initialAnime.id)
            ]);

            setAnime(prev => ({ ...prev, ...details }));
            setCharacters(chars?.characters || []);
            setEpisodes(eps || []);
            setReviews(revs || []);

            if (eps && eps.length > 0) {
                
            }
        } catch (error) {
            console.error('Failed to load details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchlist = () => {
        addToWatchlist({
            id: anime.id,
            title: anime.title,
            image: anime.image,
            genre: anime.genres?.[0] || 'Anime',
            year: anime.year,
            rating: anime.score,
        });
        Alert.alert("Added!", `${anime.title} added to your watchlist.`);
    };

    const handleShare = async () => {
        try {
            const { Share } = require('react-native');

            await shareAnime(anime);
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleEpisodePress = (episode) => {
        setCurrentEpisode(episode);
        setHasAwardedXP(false);
        
    };

    const renderHeader = () => {
        if (currentEpisode) {
            return (
                <View style={{ height: height * 0.45, backgroundColor: '#000' }}>
                    <Video
                        ref={videoRef}
                        style={{ width: '100%', height: '100%' }}
                        source={{ uri: currentEpisode.video_url.startsWith('http') ? currentEpisode.video_url : `http://192.168.1.113:8000${currentEpisode.video_url}` }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        onPlaybackStatusUpdate={status => {
                            if (status.didJustFinish && !hasAwardedXP) {
                                handleEpisodeComplete();
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => setCurrentEpisode(null)}
                        style={{ position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeftIcon size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={{ height: height * 0.45 }}>
                <ImageBackground
                    source={{ uri: anime.image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(15, 23, 42, 0.1)', 'rgba(15, 23, 42, 0.6)', '#0f172a']}
                        style={{ flex: 1 }}
                    >
                        {}
                        <View style={{ paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ArrowLeftIcon size={24} color="#fff" />
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={handleShare} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShareIcon size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleWatchlist}
                                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <HeartIcon size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>

                {}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                            {}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                {anime.genres?.slice(0, 3).map(g => (
                                    <View key={g} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(99, 102, 241, 0.2)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.5)' }}>
                                        <Text style={{ color: '#818cf8', fontSize: 10, fontWeight: '700' }}>{g}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8, lineHeight: 34 }}>
                                {anime.title}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <StarIcon size={16} color="#fbbf24" filled />
                                    <Text style={{ color: '#fbbf24', marginLeft: 4, fontWeight: '700' }}>{anime.score || 'N/A'}</Text>
                                </View>
                                <Text style={{ color: '#64748b' }}>•</Text>
                                <Text style={{ color: '#94a3b8' }}>{anime.year || 'Unknown'}</Text>
                                <Text style={{ color: '#64748b' }}>•</Text>
                                <Text style={{ color: '#94a3b8' }}>{anime.status}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderTabs = () => (
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', marginBottom: 20 }}>
            {['About', 'Episodes', 'Characters', 'Reviews'].map(tab => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{ paddingVertical: 16, marginRight: 24, borderBottomWidth: 2, borderBottomColor: activeTab === tab ? '#6366f1' : 'transparent' }}
                >
                    <Text style={{ color: activeTab === tab ? '#fff' : '#64748b', fontWeight: '600', fontSize: 16 }}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderAbout = () => (
        <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Synopsis</Text>
            <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 24, marginBottom: 24 }}>
                {anime.synopsis || 'No synopsis available.'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 16, borderRadius: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Episodes</Text>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{anime.episodes || '?'}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 16, borderRadius: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Duration</Text>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{anime.duration?.split(' ')[0] || '?'}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 16, borderRadius: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Rating</Text>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{anime.rating?.split(' ')[0] || '?'}</Text>
                </View>
            </View>

            {}
            <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: 20, padding: 20 }}>
                <InfoRow label="Japanese" value={anime.titleJapanese} />
                <InfoRow label="Source" value={anime.source} />
                <InfoRow label="Studios" value={anime.studios?.join(', ')} />
                <InfoRow label="Aired" value={anime.year} />
            </View>
        </View>
    );

    const InfoRow = ({ label, value }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <Text style={{ color: '#64748b', fontWeight: '500' }}>{label}</Text>
            <Text style={{ color: '#cbd5e1', fontWeight: '600', maxWidth: '60%' }} numberOfLines={1}>{value || '-'}</Text>
        </View>
    );

    const renderCharacters = () => (
        <View style={{ paddingHorizontal: 20 }}>
            {characters.map((char, index) => (
                <View key={char.id || index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: 12, borderRadius: 16 }}>
                    <Image source={{ uri: char.image }} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#334155' }} />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{char.name}</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                            {typeof char.role === 'object' ? (char.role.title || char.role.name || 'Supporting') : char.role}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderEpisodes = () => (
        <View style={{ paddingHorizontal: 20 }}>
            {episodes.length > 0 ? (
                episodes.map((ep, index) => (
                    <TouchableOpacity
                        key={ep.id}
                        onPress={() => handleEpisodePress(ep)}
                        style={{
                            backgroundColor: currentEpisode?.id === ep.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: currentEpisode?.id === ep.id ? '#6366f1' : 'transparent',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                            <PlayIcon size={20} color={currentEpisode?.id === ep.id ? '#6366f1' : '#fff'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Episode {ep.episode_number}</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 14 }}>{ep.title || `Episode ${ep.episode_number}`}</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>{ep.quality}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                    <VideoIcon size={64} color="rgba(255,255,255,0.1)" />
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>No Episodes Uploaded</Text>
                    <Text style={{ color: '#64748b', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 }}>
                        Be the first to upload an episode for this anime in the Creator Studio!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreatorStudio')}
                        style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#6366f1' }}
                    >
                        <Text style={{ color: '#818cf8', fontWeight: '700' }}>Go to Creator Studio</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const handleSubmitReview = async () => {
        if (!userProfile?.uid) {
            Alert.alert("Sign In Needed", "You must be logged in to review.");
            return;
        }
        try {
            await createReview({
                user_id: userProfile.uid,
                anime_id: anime.id,
                rating: rating,
                text: reviewText
            });
            Alert.alert("Success", "Review submitted!");
            setModalVisible(false);
            setReviewText('');
            
            const newReviews = await getReviews(anime.id);
            setReviews(newReviews);
            
            await api.addXP(userProfile.uid, 20, 'review');
        } catch (error) {
            console.error("Review failed", error);
            Alert.alert("Error", "Could not submit review.");
        }
    };

    const renderReviews = () => (
        <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>User Reviews</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#6366f1' }}
                >
                    <Text style={{ color: '#818cf8', fontWeight: '600', fontSize: 12 }}>Write Review</Text>
                </TouchableOpacity>
            </View>

            {reviews.length > 0 ? (
                reviews.map((rev) => (
                    <View key={rev.id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: 16, borderRadius: 16, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>U</Text>
                                </View>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Ninja</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                                    s <= rev.rating ? <StarIcon key={s} size={12} color="#fbbf24" filled /> : null
                                ))}
                            </View>
                        </View>
                        <Text style={{ color: '#cbd5e1', lineHeight: 20 }}>{rev.text}</Text>
                        <Text style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>{new Date(rev.created_at).toLocaleDateString()}</Text>
                    </View>
                ))
            ) : (
                <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>No reviews yet. Be the first!</Text>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderTabs()}

                {loading ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#6366f1" />
                    </View>
                ) : (
                    <>
                        {activeTab === 'About' && renderAbout()}
                        {activeTab === 'Characters' && renderCharacters()}
                        {activeTab === 'Episodes' && renderEpisodes()}
                        {activeTab === 'Reviews' && renderReviews()}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {}
            {!currentEpisode && (
                <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('Episodes')}
                        style={{
                            backgroundColor: '#6366f1',
                            height: 56,
                            borderRadius: 28,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#6366f1',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.4,
                            shadowRadius: 16,
                            elevation: 8
                        }}
                    >
                        <PlayIcon size={24} color="#fff" filled />
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 10 }}>Start Watching</Text>
                    </TouchableOpacity>
                </View>
            )}

            {}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Write a Review</Text>

                        <Text style={{ color: '#cbd5e1', marginBottom: 12 }}>Rating</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                                    <StarIcon size={24} color={s <= rating ? "#fbbf24" : "#475569"} filled={s <= rating} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ color: '#cbd5e1', marginBottom: 12 }}>Your Thoughts</Text>
                        <TextInput
                            style={{ backgroundColor: '#0f172a', borderRadius: 12, padding: 16, color: '#fff', height: 100, textAlignVertical: 'top', marginBottom: 24 }}
                            multiline
                            placeholder="Tell us what you think..."
                            placeholderTextColor="#64748b"
                            value={reviewText}
                            onChangeText={setReviewText}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, padding: 16, alignItems: 'center' }}>
                                <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmitReview} style={{ flex: 1, backgroundColor: '#6366f1', padding: 16, borderRadius: 16, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit Review</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View >
    );
}
