import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search, Film, Star, Filter, Grid, List,
    ChevronDown, Calendar, Tv, TrendingUp, Clock, X
} from 'lucide-react';
import { jikanAPI } from '../utils/animeDataAPIs';

const GENRES = [
    { id: 1, name: 'Action' }, { id: 2, name: 'Adventure' }, { id: 4, name: 'Comedy' },
    { id: 8, name: 'Drama' }, { id: 10, name: 'Fantasy' }, { id: 22, name: 'Romance' },
    { id: 24, name: 'Sci-Fi' }, { id: 36, name: 'Slice of Life' }, { id: 14, name: 'Horror' },
    { id: 7, name: 'Mystery' }, { id: 25, name: 'Shoujo' }, { id: 27, name: 'Shounen' },
    { id: 18, name: 'Mecha' }, { id: 38, name: 'Military' }, { id: 30, name: 'Sports' },
    { id: 37, name: 'Supernatural' }, { id: 41, name: 'Thriller' }, { id: 46, name: 'Award Winning' },
];

const SORT_OPTIONS = [
    { value: 'score', label: 'Top Rated', icon: Star },
    { value: 'popularity', label: 'Most Popular', icon: TrendingUp },
    { value: 'start_date', label: 'Newest', icon: Calendar },
    { value: 'episodes', label: 'Most Episodes', icon: Tv },
];

const AnimeCard = ({ anime }) => {
    const imageUrl = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;
    const genres = anime?.genres?.slice(0, 2) || [];

    return (
        <Link to={`/anime/${anime?.mal_id}`} className="group block">
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#111]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={anime?.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film size={32} className="text-[#333]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {anime?.score && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-semibold text-amber-400">
                        <Star size={10} fill="currentColor" /> {anime.score}
                    </div>
                )}

                {anime?.status === 'Currently Airing' && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/80 text-[10px] font-bold text-white">
                        AIRING
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-[13px] line-clamp-2 leading-tight mb-1.5">{anime?.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-white/40">
                        {anime?.episodes && <span>{anime.episodes} ep</span>}
                        {anime?.year && <span>· {anime.year}</span>}
                        {anime?.type && <span>· {anime.type}</span>}
                    </div>
                    {genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {genres.map(g => (
                                <span key={g.mal_id} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.06] text-white/50">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

const AnimeListItem = ({ anime }) => {
    const imageUrl = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;
    return (
        <Link
            to={`/anime/${anime?.mal_id}`}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all group"
        >
            <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#111]">
                {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><Film size={18} className="text-[#333]" /></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate group-hover:text-white/80">{anime?.title}</h3>
                {anime?.title_japanese && (
                    <p className="text-[#444] text-xs truncate">{anime.title_japanese}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#555]">
                    {anime?.score && (
                        <span className="flex items-center gap-0.5 text-amber-400/70">
                            <Star size={10} fill="currentColor" /> {anime.score}
                        </span>
                    )}
                    {anime?.episodes && <span>{anime.episodes} episodes</span>}
                    {anime?.type && <span>{anime.type}</span>}
                    {anime?.year && <span>{anime.year}</span>}
                </div>
            </div>
        </Link>
    );
};

const AnimeLibrary = () => {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [activeGenre, setActiveGenre] = useState(null);
    const [sortBy, setSortBy] = useState('score');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchAnime = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;
            let url = `https://api.jikan.moe/v4/anime?page=${currentPage}&limit=24&order_by=${sortBy}&sort=desc`;
            
            if (searchQuery) {
                url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=24&order_by=${sortBy}&sort=desc`;
            }
            if (activeGenre) {
                url += `&genres=${activeGenre}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            const results = data.data || [];
            
            setHasMore(data.pagination?.has_next_page || false);
            
            if (reset) {
                setAnimeList(results);
                setPage(1);
            } else {
                setAnimeList(prev => currentPage === 1 ? results : [...prev, ...results]);
            }
        } catch (err) {
            console.error('Failed to fetch anime:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, activeGenre, sortBy, page]);

    useEffect(() => {
        fetchAnime(true);
    }, [searchQuery, activeGenre, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput.trim());
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    useEffect(() => {
        if (page > 1) fetchAnime(false);
    }, [page]);

    const clearFilters = () => {
        setActiveGenre(null);
        setSearchQuery('');
        setSearchInput('');
        setSortBy('score');
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[#050505]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Anime Database</h1>
                    <p className="text-[#666] text-sm">Explore detailed information on thousands of anime series, movies, and OVAs.</p>
                </div>

                {/* Search + Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" size={18} />
                        <input
                            type="text"
                            placeholder="Search anime by title..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-[#444] text-sm bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none transition-colors"
                        />
                    </form>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                                showFilters || activeGenre
                                    ? 'bg-[#e5484d]/10 border-[#e5484d]/30 text-[#e5484d]'
                                    : 'bg-white/[0.03] border-white/[0.06] text-[#888]'
                            }`}
                        >
                            <Filter size={16} />
                            Filters
                            {activeGenre && <span className="w-1.5 h-1.5 rounded-full bg-[#e5484d]" />}
                        </button>

                        <div className="flex rounded-xl overflow-hidden border border-white/[0.06]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 ${viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-[#444]'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 ${viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-[#444]'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                {/* Sort */}
                                <div className="mb-5">
                                    <h4 className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.1em] mb-2.5">Sort by</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                    sortBy === opt.value
                                                        ? 'bg-white/[0.08] text-white'
                                                        : 'text-[#555] hover:text-white hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                <opt.icon size={12} /> {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Genres */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.1em] mb-2.5">Genre</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {GENRES.map(genre => (
                                            <button
                                                key={genre.id}
                                                onClick={() => setActiveGenre(activeGenre === genre.id ? null : genre.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                    activeGenre === genre.id
                                                        ? 'bg-[#e5484d] text-white'
                                                        : 'bg-white/[0.03] text-[#666] hover:text-white hover:bg-white/[0.06]'
                                                }`}
                                            >
                                                {genre.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Active filter pills */}
                                {(activeGenre || searchQuery) && (
                                    <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2">
                                        <span className="text-[11px] text-[#444]">Active:</span>
                                        {activeGenre && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[#e5484d]/10 text-[#e5484d]">
                                                {GENRES.find(g => g.id === activeGenre)?.name}
                                                <X size={10} className="cursor-pointer" onClick={() => setActiveGenre(null)} />
                                            </span>
                                        )}
                                        {searchQuery && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-white/[0.06] text-[#888]">
                                                "{searchQuery}"
                                                <X size={10} className="cursor-pointer" onClick={() => { setSearchQuery(''); setSearchInput(''); }} />
                                            </span>
                                        )}
                                        <button onClick={clearFilters} className="ml-auto text-[11px] text-[#555] hover:text-white">
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                {loading && animeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="loading-spinner mb-4" />
                        <p className="text-[#555] text-sm">Loading anime database...</p>
                    </div>
                ) : animeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Film size={48} className="text-[#222] mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                        <p className="text-[#555] text-sm mb-6">
                            {searchQuery ? `Nothing matches "${searchQuery}"` : 'Try adjusting your filters.'}
                        </p>
                        <button onClick={clearFilters} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06] text-white hover:bg-white/[0.1] transition-colors">
                            Clear Filters
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {animeList.map(anime => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="space-y-1">
                        {animeList.map(anime => (
                            <AnimeListItem key={anime.mal_id} anime={anime} />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {!loading && hasMore && animeList.length > 0 && (
                    <div className="mt-10 text-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-8 py-3 rounded-xl text-sm font-medium text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}

                {loading && animeList.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <div className="loading-spinner" />
                    </div>
                )}

                {/* Result count */}
                {!loading && animeList.length > 0 && (
                    <div className="mt-6 text-center text-[11px] text-[#333]">
                        Showing {animeList.length} titles{activeGenre ? ` in ${GENRES.find(g => g.id === activeGenre)?.name}` : ''}
                        {searchQuery ? ` matching "${searchQuery}"` : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimeLibrary;
