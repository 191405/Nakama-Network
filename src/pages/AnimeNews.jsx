import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper, Clock, ExternalLink, Calendar,
    Flame, Globe, MessageCircle, Loader2, ArrowUpRight, Search, Play, Volume2
} from 'lucide-react';

/* ─── Constants & Fetch Logic ─── */
const ANIME_IDS_POOL = [
    21, 1735, 16498, 5114, 38000, 51009, 52991, 40748, 48583,
    30276, 11061, 20, 31964, 34572, 37991, 40956, 44511, 50265,
    9253, 1, 6, 269, 136, 199, 431, 457, 918, 2167, 4181, 11757,
    22319, 23755, 21481, 32281, 37521, 41467, 50602, 53998, 54492
];

const CATEGORIES = [
    { id: 'all', label: 'All News' },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'announcements', label: 'Announcements', icon: Volume2 },
    { id: 'releases', label: 'Releases', icon: Play }
];

const fetchNewsPage = async (pageIndex, usedIds) => {
    const available = ANIME_IDS_POOL.filter(id => !usedIds.has(id));
    const batch = available.slice(pageIndex * 3, (pageIndex * 3) + 3);
    if (batch.length === 0) return { articles: [], hasMore: false };

    const allNews = [];
    for (const malId of batch) {
        try {
            await new Promise(r => setTimeout(r, 400)); // Jikan rate limit
            const resp = await fetch(`https://api.jikan.moe/v4/anime/${malId}/news?limit=5`);
            if (!resp.ok) continue;
            const data = await resp.json();
            if (data.data) {
                allNews.push(...data.data.map(item => ({
                    id: `${malId}-${item.mal_id}`,
                    mal_id: item.mal_id,
                    title: item.title,
                    excerpt: item.excerpt || item.title,
                    url: item.url,
                    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || `https://via.placeholder.com/600x400/100714/f43f5e?text=Nakama+News`,
                    date: item.date,
                    author: item.author_username || 'MAL News',
                    source: 'MyAnimeList',
                    comments: item.comments || 0,
                    animeId: malId,
                })));
            }
        } catch (e) {
            console.warn(`News fetch failed for anime ${malId}:`, e);
        }
    }

    // Deduplicate by mal_id
    const unique = allNews.filter((item, idx, self) =>
        idx === self.findIndex(t => t.mal_id === item.mal_id)
    );
    unique.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        articles: unique,
        hasMore: (pageIndex + 1) * 3 < available.length,
    };
};

/* ─── Helpers ─── */
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return hours <= 0 ? 'Just now' : `${Math.floor(hours)}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const categorizeArticle = (article) => {
    const title = article.title.toLowerCase();
    const excerpt = article.excerpt.toLowerCase();
    const combo = title + " " + excerpt;

    if (combo.includes('announce') || combo.includes('reveal') || combo.includes('confirmed')) return 'announcements';
    if (combo.includes('release') || combo.includes('premiere') || combo.includes('trailer') || combo.includes('visual')) return 'releases';
    if (combo.includes('award') || combo.includes('top') || combo.includes('million') || article.comments > 50) return 'trending';
    return 'all';
};

/* ─── Components ─── */
const HighlightBadge = ({ tag }) => (
    <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider"
          style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(236,72,153,0.05))', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }}>
        {tag}
    </span>
);

const FeaturedArticle = ({ article }) => {
    if (!article) return null;
    return (
        <motion.a
            href={article.url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="group block relative w-full rounded-[2rem] overflow-hidden mb-12 shadow-2xl"
            style={{ height: 'max(60vh, 500px)', border: '1px solid rgba(244,63,94,0.15)' }}
        >
            <img 
                src={article.image} 
                alt={article.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,3,12,0.95) 0%, rgba(5,3,12,0.5) 50%, transparent 100%)' }} />
            
            <div className="absolute top-6 left-6 flex gap-2">
                <HighlightBadge tag="Featured Story" />
                <HighlightBadge tag={timeAgo(article.date)} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight group-hover:text-rose-400 transition-colors" style={{ fontFamily: 'var(--font-display, Cinzel, serif)' }}>
                        {article.title}
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base line-clamp-3 mb-6 max-w-2xl leading-relaxed">
                        {article.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <span className="flex items-center gap-2"><Globe size={14} className="text-rose-400" /> {article.source}</span>
                        <span className="flex items-center gap-2"><MessageCircle size={14} className="text-rose-400" /> {article.comments} Comments</span>
                        <div className="flex items-center gap-2 text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all font-semibold">
                            Read Full Story <ArrowUpRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.a>
    );
};

const NewsCard = ({ article, idx }) => (
    <motion.a
        href={article.url} target="_blank" rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
        className="block rounded-2xl overflow-hidden group transition-all h-full"
        style={{ background: 'rgba(10,7,20,0.85)', border: '1px solid rgba(244,63,94,0.1)' }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(244,63,94,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(244,63,94,0.1)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div className="relative h-48 overflow-hidden bg-black">
            <img
                src={article.image} alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                onError={e => { e.target.src = 'https://via.placeholder.com/600x400/100714/f43f5e?text=News'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 group-hover:text-rose-400 transition-colors">
                <ArrowUpRight size={14} />
            </div>
            <div className="absolute bottom-3 left-3">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
                      style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.2), transparent)', color: '#fb7185', backdropFilter: 'blur(4px)' }}>
                    {timeAgo(article.date)}
                </span>
            </div>
        </div>

        <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
            <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 mb-2 group-hover:text-rose-400 transition-colors">
                {article.title}
            </h3>
            <p className="text-slate-400 text-xs line-clamp-3 mb-4 flex-grow leading-relaxed">
                {article.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="flex items-center gap-1.5"><Globe size={12} className="text-rose-500/70" />{article.source}</span>
                <span className="flex items-center gap-1.5"><MessageCircle size={12} className="text-rose-500/70" />{article.comments}</span>
            </div>
        </div>
    </motion.a>
);

/* ─── Main Component ─── */
const AnimeNews = () => {
    const [articles, setArticles] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const usedIds = useRef(new Set());
    const observerRef = useRef(null);
    const sentinelRef = useRef(null);

    const loadPage = useCallback(async (page) => {
        const isFirst = page === 0;
        isFirst ? setLoading(true) : setLoadingMore(true);

        try {
            const result = await fetchNewsPage(page, usedIds.current);
            result.articles.forEach(a => usedIds.current.add(a.animeId));
            setArticles(prev => isFirst ? result.articles : [...prev, ...result.articles]);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error('Failed to load news:', err);
        } finally {
            isFirst ? setLoading(false) : setLoadingMore(false);
        }
    }, []);

    useEffect(() => { loadPage(0); }, [loadPage]);

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                setPageIndex(prev => {
                    const next = prev + 1;
                    loadPage(next);
                    return next;
                });
            }
        }, { threshold: 0.5 });

        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [hasMore, loadingMore, loading, loadPage]);

    const filteredArticles = articles.filter(article => {
        if (activeCategory === 'all') return true;
        return categorizeArticle(article) === activeCategory;
    });

    const featuredArticle = articles.length > 0 ? articles[0] : null;
    const gridArticles = activeCategory === 'all' && articles.length > 0 ? filteredArticles.slice(1) : filteredArticles;

    return (
        <div className="min-h-screen pt-24 pb-24 md:pb-8 relative overflow-hidden" style={{ background: 'var(--color-obsidian, #05030c)' }}>
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] opacity-20" style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.1), transparent 70%)', filter: 'blur(100px)' }} />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] opacity-10" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)', filter: 'blur(100px)' }} />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* Header */}
                <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] font-bold mb-3" style={{ color: 'rgba(244,114,182,0.6)' }}>ニュース</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'var(--font-display, Cinzel, serif)' }}>
                            Top <span style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stories</span>
                        </h1>
                    </div>
                </div>

                {loading && pageIndex === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 size={48} className="animate-spin mb-4" style={{ color: '#f43f5e' }} />
                        <p className="text-slate-400 text-sm animate-pulse">Summoning latest news...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-32 bg-black/20 rounded-3xl border border-white/5">
                        <Newspaper size={48} className="mx-auto mb-4 opacity-50 text-slate-500" />
                        <h3 className="text-xl font-bold text-white mb-2">No transmissions received</h3>
                        <p className="text-slate-400 text-sm">Cannot retrieve news from the anime world right now.</p>
                    </div>
                ) : (
                    <>
                        {/* Hero Featured Article (Only show on 'All News' tab) */}
                        {activeCategory === 'all' && featuredArticle && (
                            <FeaturedArticle article={featuredArticle} />
                        )}

                        {/* Sticky Category Tabs */}
                        <div className="sticky top-20 z-40 mb-8 bg-[#05030c]/80 backdrop-blur-xl py-4 border-b border-white/5 mx--4 px-4 md:mx-0 md:px-0">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                                        style={activeCategory === cat.id 
                                            ? { background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(236,72,153,0.1))', color: '#fb7185', border: '1px solid rgba(244,63,94,0.3)' }
                                            : { background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid transparent' }
                                        }
                                    >
                                        {cat.icon && <cat.icon size={16} />}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* News Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            <AnimatePresence mode="popLayout">
                                {gridArticles.map((article, idx) => (
                                    <motion.div
                                        key={`${article.id}-${activeCategory}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <NewsCard article={article} idx={idx % 10} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Loading More Indicator */}
                        <div ref={sentinelRef} className="py-16 flex justify-center">
                            {loadingMore && (
                                <div className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm font-bold tracking-wide">FETCHING MORE...</span>
                                </div>
                            )}
                            {!hasMore && gridArticles.length > 0 && (
                                <p className="text-slate-600 text-sm font-medium tracking-wide">YOU'VE REACHED THE END OF THE SCROLLS</p>
                            )}
                            {gridArticles.length === 0 && !loadingMore && activeCategory !== 'all' && (
                                <p className="text-slate-500 text-sm py-12">No articles found in this category.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnimeNews;

