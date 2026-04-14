import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Star, Tv, Film, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jikanAPI } from '../utils/animeDataAPIs';

const DEBOUNCE_MS = 400;

const SearchOverlay = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const debounceTimer = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
            const stored = JSON.parse(localStorage.getItem('nk_recent_searches') || '[]');
            setRecentSearches(stored);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // Keyboard shortcut: Escape to close
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const searchAnime = useCallback(async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) { setResults([]); return; }
        setLoading(true);
        try {
            const data = await jikanAPI.searchAnime(searchTerm);
            setResults((data || []).slice(0, 8));
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => searchAnime(value), DEBOUNCE_MS);
    };

    const handleSelect = (anime) => {
        // Save to recent searches
        const recent = JSON.parse(localStorage.getItem('nk_recent_searches') || '[]');
        const updated = [{ id: anime.mal_id, title: anime.title, image: anime.images?.webp?.small_image_url || anime.images?.jpg?.small_image_url }, ...recent.filter(r => r.id !== anime.mal_id)].slice(0, 6);
        localStorage.setItem('nk_recent_searches', JSON.stringify(updated));
        onClose();
        navigate(`/anime/${anime.mal_id}`);
    };

    const handleRecentClick = (item) => {
        onClose();
        navigate(`/anime/${item.id}`);
    };

    const clearRecent = () => {
        localStorage.removeItem('nk_recent_searches');
        setRecentSearches([]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                        <Search size={20} className="text-[#555] flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search anime titles..."
                            className="flex-1 bg-transparent text-white text-[15px] placeholder-[#444] focus:outline-none"
                            autoComplete="off"
                        />
                        {loading && <Loader2 size={18} className="animate-spin text-[#e5484d]" />}
                        <button onClick={onClose} className="text-[#555] hover:text-white transition-colors p-1">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {/* Live Results */}
                        {results.length > 0 && (
                            <div className="p-2">
                                {results.map((anime, idx) => (
                                    <motion.button
                                        key={anime.mal_id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        onClick={() => handleSelect(anime)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left group"
                                    >
                                        <img
                                            src={anime.images?.webp?.small_image_url || anime.images?.jpg?.small_image_url}
                                            alt=""
                                            className="w-10 h-14 rounded-lg object-cover flex-shrink-0 bg-[#111]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white text-sm font-medium truncate group-hover:text-[#e5484d] transition-colors">
                                                {anime.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[#555] text-xs flex items-center gap-1">
                                                    <Tv size={10} /> {anime.type || 'TV'}
                                                </span>
                                                {anime.score && (
                                                    <span className="text-[#555] text-xs flex items-center gap-1">
                                                        <Star size={10} /> {anime.score}
                                                    </span>
                                                )}
                                                {anime.episodes && (
                                                    <span className="text-[#555] text-xs">
                                                        {anime.episodes} ep
                                                    </span>
                                                )}
                                                {anime.year && (
                                                    <span className="text-[#555] text-xs">{anime.year}</span>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-[#333] group-hover:text-[#555] transition-colors flex-shrink-0" />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* No Results */}
                        {query.length >= 2 && !loading && results.length === 0 && (
                            <div className="p-8 text-center">
                                <Search size={32} className="mx-auto mb-2 text-[#222]" />
                                <p className="text-[#555] text-sm">No results for "{query}"</p>
                            </div>
                        )}

                        {/* Recent Searches */}
                        {query.length < 2 && recentSearches.length > 0 && (
                            <div className="p-3">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-[10px] text-[#444] uppercase tracking-wider font-semibold">Recent</span>
                                    <button onClick={clearRecent} className="text-[10px] text-[#444] hover:text-[#888] transition-colors">Clear</button>
                                </div>
                                {recentSearches.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleRecentClick(item)}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                                    >
                                        {item.image && <img src={item.image} alt="" className="w-8 h-10 rounded-md object-cover bg-[#111]" />}
                                        <span className="text-[#888] text-sm truncate">{item.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {query.length < 2 && recentSearches.length === 0 && (
                            <div className="p-8 text-center">
                                <Search size={32} className="mx-auto mb-2 text-[#222]" />
                                <p className="text-[#555] text-sm">Type to search 28,000+ anime titles</p>
                                <p className="text-[#333] text-xs mt-1">Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#666] text-[10px]">ESC</kbd> to close</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SearchOverlay;
