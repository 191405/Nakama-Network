import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Plus, Film, Play, Clock, Star, Filter, Grid, List,
    Loader2, AlertCircle, Tv, Music, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllAnime, searchAnime } from '../utils/animeUploadService';

const AnimeLibrary = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const isAdmin = userProfile?.isAdmin === true || userProfile?.rank === 'Sage Mode';

    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); 
    const [genreFilter, setGenreFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const [availableGenres, setAvailableGenres] = useState(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life']);

    useEffect(() => {
        loadAnime();
    }, []);

    const loadAnime = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllAnime(50);
            setAnimeList(data);

            const genres = new Set();
            data.forEach(anime => {
                anime.genres?.forEach(g => genres.add(g));
            });
            if (genres.size > 0) {
                setAvailableGenres(Array.from(genres).sort());
            }
        } catch (err) {
            console.error('Failed to load anime:', err);
            setError('Failed to load anime library. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadAnime();
            return;
        }

        try {
            setLoading(true);
            const results = await searchAnime(searchQuery.trim());
            setAnimeList(results);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnime = genreFilter === 'all'
        ? animeList
        : animeList.filter(anime => anime.genres?.includes(genreFilter));

    const AnimeCard = ({ anime }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            className="group cursor-pointer"
            onClick={() => navigate(`/library/${anime.id}`)}
        >
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-800">
                {anime.coverImage ? (
                    <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                        <Film size={48} className="text-slate-600" />
                    </div>
                )}

                {}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                        <Play size={28} className="text-black ml-1" fill="black" />
                    </div>
                </div>

                {}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded-lg text-xs font-bold text-white">
                    {anime.uploadedEpisodes || 0} eps
                </div>

                {}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">{anime.title}</h3>
                    {anime.genres && anime.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {anime.genres.slice(0, 2).map(genre => (
                                <span key={genre} className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const AnimeListItem = ({ anime }) => (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => navigate(`/library/${anime.id}`)}
        >
            <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                {anime.coverImage ? (
                    <img src={anime.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film size={24} className="text-slate-500" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold truncate">{anime.title}</h3>
                {anime.titleJapanese && (
                    <p className="text-slate-400 text-sm truncate">{anime.titleJapanese}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <Tv size={12} />
                        {anime.uploadedEpisodes || 0} episodes
                    </span>
                    {anime.genres && (
                        <span>{anime.genres.slice(0, 3).join(', ')}</span>
                    )}
                </div>
            </div>

            <Play size={24} className="text-yellow-500 flex-shrink-0" />
        </motion.div>
    );

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 relative z-0">
            {}
            <div className="fixed inset-0 bg-slate-950/80 -z-10" />

            <div className="max-w-7xl mx-auto">
                {}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                            <span className="text-yellow-500">Anime</span> Library
                        </h1>
                        <p className="text-slate-400">Browse and watch uploaded anime in HD quality</p>
                    </div>

                    {}
                    {isAdmin && (
                        <Link
                            to="/library/upload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all"
                        >
                            <Plus size={20} />
                            Upload Anime
                        </Link>
                    )}
                </div>

                {}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search anime..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                    </form>

                    {}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'
                            }`}
                    >
                        <Filter size={20} />
                        Filters
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {}
                    <div className="flex rounded-xl overflow-hidden border border-slate-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'bg-slate-800/50 text-slate-400'}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'bg-slate-800/50 text-slate-400'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <h4 className="text-white font-bold mb-3">Genre</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setGenreFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${genreFilter === 'all' ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {availableGenres.map(genre => (
                                        <button
                                            key={genre}
                                            onClick={() => setGenreFilter(genre)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${genreFilter === genre ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-yellow-500 animate-spin mb-4" />
                        <p className="text-slate-400">Loading library...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle size={48} className="text-red-400 mb-4" />
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadAnime}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredAnime.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Film size={48} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Library is Empty</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            {searchQuery ? `No results found for "${searchQuery}"` : 'The library is currently being built. Check back soon for new uploads!'}
                        </p>
                        {isAdmin && (
                            <Link
                                to="/library/upload"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/10"
                            >
                                <Plus size={20} />
                                Upload First Anime
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <motion.div
                        layout
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                    >
                        {filteredAnime.map(anime => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div layout className="space-y-3">
                        {filteredAnime.map(anime => (
                            <AnimeListItem key={anime.id} anime={anime} />
                        ))}
                    </motion.div>
                )}

                {}
                {!loading && filteredAnime.length > 0 && (
                    <div className="mt-8 text-center text-slate-500 text-sm">
                        Showing {filteredAnime.length} anime{genreFilter !== 'all' ? ` in ${genreFilter}` : ''}
                    </div>
                )}

                {}
                <div className="mt-16 p-6 bg-gradient-to-r from-green-900/30 to-slate-900/50 rounded-2xl border border-green-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <Music size={24} className="text-black" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Anime Soundtracks</h3>
                            <p className="text-slate-400 text-sm">Listen to curated anime playlists while browsing</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <iframe
                            src="https://open.spotify.com/embed/playlist/37i9dQZF1DX1lVhptIYRda?utm_source=generator&theme=0"
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeLibrary;
