import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, List, Info, Music, MessageSquare,
    Loader2, AlertCircle, Play, Clock, Film
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAnimeWithEpisodes, getWatchProgress, saveWatchProgress, getEpisode } from '../utils/animeUploadService';
import AdvancedMediaPlayer from '../components/AdvancedMediaPlayer';
import Comments from '../components/Comments';

const AnimeWatch = () => {
    const { animeId, episodeId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [anime, setAnime] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialTime, setInitialTime] = useState(0);
    const [showEpisodeList, setShowEpisodeList] = useState(false);
    const [activeTab, setActiveTab] = useState('episodes'); 

    useEffect(() => {
        loadData();
    }, [animeId, episodeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const animeData = await getAnimeWithEpisodes(animeId);
            if (!animeData) {
                setError('Anime not found');
                return;
            }
            setAnime(animeData);

            const targetEpisodeId = episodeId || animeData.episodes?.[0]?.id;
            if (!targetEpisodeId) {
                setError('No episodes available');
                return;
            }

            const episode = animeData.episodes.find(ep => ep.id === targetEpisodeId);
            if (!episode) {
                setError('Episode not found');
                return;
            }
            setCurrentEpisode(episode);

            if (user) {
                const progress = await getWatchProgress(user.uid, animeId, targetEpisodeId);
                setInitialTime(progress || 0);
            }

        } catch (err) {
            console.error('Load error:', err);
            setError('Failed to load anime data');
        } finally {
            setLoading(false);
        }
    };

    const handleProgress = async (timestamp) => {
        if (user && currentEpisode) {
            await saveWatchProgress(user.uid, animeId, currentEpisode.id, timestamp);
        }
    };

    const currentIndex = anime?.episodes?.findIndex(ep => ep.id === currentEpisode?.id) ?? -1;
    const hasNext = currentIndex >= 0 && currentIndex < (anime?.episodes?.length || 0) - 1;
    const hasPrevious = currentIndex > 0;

    const goToEpisode = (episode) => {
        navigate(`/library/${animeId}/${episode.id}`);
    };

    const goToNext = () => {
        if (hasNext && anime?.episodes) {
            goToEpisode(anime.episodes[currentIndex + 1]);
        }
    };

    const goToPrevious = () => {
        if (hasPrevious && anime?.episodes) {
            goToEpisode(anime.episodes[currentIndex - 1]);
        }
    };

    const handleEnded = () => {
        if (hasNext) {
            goToNext();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 size={48} className="text-yellow-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
                <AlertCircle size={64} className="text-red-400 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
                <Link to="/library" className="text-yellow-400 hover:underline">
                    ← Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-8 relative z-0">
            {}
            <div className="fixed inset-0 bg-slate-950/90 -z-10" />

            {}
            <div className="max-w-7xl mx-auto px-4">
                {}
                <Link
                    to="/library"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                >
                    <ChevronLeft size={20} />
                    Back to Library
                </Link>

                {}
                <div className="relative">
                    {currentEpisode?.videos && Object.keys(currentEpisode.videos).length > 0 ? (
                        <AdvancedMediaPlayer
                            sources={currentEpisode.videos}
                            title={`${anime?.title} - Episode ${currentEpisode.number}: ${currentEpisode.title || ''}`}
                            thumbnail={currentEpisode.thumbnail || anime?.coverImage}
                            initialTime={initialTime}
                            onProgress={handleProgress}
                            onEnded={handleEnded}
                            onNext={hasNext ? goToNext : null}
                            onPrevious={hasPrevious ? goToPrevious : null}
                            hasNext={hasNext}
                            hasPrevious={hasPrevious}
                        />
                    ) : (
                        <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <Film size={48} className="text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No video sources available</p>
                            </div>
                        </div>
                    )}
                </div>

                {}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 p-4 bg-slate-800/50 rounded-xl">
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            Episode {currentEpisode?.number}
                            {currentEpisode?.title && `: ${currentEpisode.title}`}
                        </h1>
                        <Link
                            to={`/library/${animeId}`}
                            className="text-yellow-400 hover:underline"
                        >
                            {anime?.title}
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasPrevious && (
                            <button
                                onClick={goToPrevious}
                                className="flex items-center gap-1 px-3 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600"
                            >
                                <ChevronLeft size={18} />
                                Prev
                            </button>
                        )}
                        {hasNext && (
                            <button
                                onClick={goToNext}
                                className="flex items-center gap-1 px-3 py-2 bg-yellow-500 rounded-lg text-black font-medium hover:bg-yellow-400"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {}
                    <div className="lg:col-span-2 space-y-6">
                        {}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { id: 'episodes', label: 'Episodes', icon: List },
                                { id: 'info', label: 'Info', icon: Info },
                                { id: 'comments', label: 'Discussion', icon: MessageSquare }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {}
                        {activeTab === 'episodes' && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <h3 className="text-white font-bold mb-4">
                                    Episodes ({anime?.episodes?.length || 0})
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                    {anime?.episodes?.map(episode => (
                                        <button
                                            key={episode.id}
                                            onClick={() => goToEpisode(episode)}
                                            className={`p-3 rounded-lg text-left transition-colors ${episode.id === currentEpisode?.id
                                                ? 'bg-yellow-500/20 border-2 border-yellow-500'
                                                : 'bg-slate-900/50 hover:bg-slate-900 border-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-bold ${episode.id === currentEpisode?.id ? 'text-yellow-400' : 'text-white'
                                                    }`}>
                                                    {episode.number}
                                                </span>
                                                {episode.id === currentEpisode?.id && (
                                                    <Play size={14} className="text-yellow-400" fill="currentColor" />
                                                )}
                                            </div>
                                            {episode.title && (
                                                <p className="text-slate-400 text-xs truncate mt-1">{episode.title}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <div className="flex gap-4 mb-4">
                                    {anime?.coverImage && (
                                        <img
                                            src={anime.coverImage}
                                            alt=""
                                            className="w-24 h-36 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{anime?.title}</h2>
                                        {anime?.titleJapanese && (
                                            <p className="text-slate-400">{anime.titleJapanese}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {anime?.genres?.map(g => (
                                                <span key={g} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">{anime?.synopsis}</p>
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <Comments
                                    sectionId={`anime-${animeId}-${currentEpisode?.id || 'general'}`}
                                    sectionLabel={`${anime?.title} - Episode ${currentEpisode?.number || '?'}`}
                                    maxHeight="400px"
                                />
                            </div>
                        )}
                    </div>

                    {}
                    <div className="space-y-6">
                        {}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Music size={20} className="text-green-400" />
                                <h3 className="text-white font-bold">Anime Vibes</h3>
                            </div>
                            <iframe
                                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX1lVhptIYRda?utm_source=generator&theme=0"
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded-lg"
                            />
                        </div>

                        {}
                        {hasNext && anime?.episodes && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <h3 className="text-white font-bold mb-3">Up Next</h3>
                                <button
                                    onClick={goToNext}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded bg-yellow-500/20 flex items-center justify-center">
                                        <Play size={20} className="text-yellow-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-medium">
                                            Episode {anime.episodes[currentIndex + 1].number}
                                        </p>
                                        <p className="text-slate-400 text-sm truncate">
                                            {anime.episodes[currentIndex + 1].title || 'Next Episode'}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <h3 className="text-white font-bold mb-3">Keyboard Shortcuts</h3>
                            <div className="space-y-2 text-sm">
                                {[
                                    ['Space / K', 'Play/Pause'],
                                    ['← / J', 'Rewind 10s'],
                                    ['→ / L', 'Forward 10s'],
                                    ['↑ / ↓', 'Volume'],
                                    ['F', 'Fullscreen'],
                                    ['M', 'Mute'],
                                    ['Shift+P', 'Picture-in-Picture']
                                ].map(([key, action]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-slate-400">{action}</span>
                                        <kbd className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded text-xs">{key}</kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeWatch;
