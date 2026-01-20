import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper, TrendingUp, Clock, ExternalLink, Calendar,
    Tag, Flame, Star, ChevronRight, Rss, Globe, MessageCircle,
    Heart, Share2, Bookmark, Filter, RefreshCw, Loader2
} from 'lucide-react';
import { getOrFetchNews } from '../utils/firebase';

const categories = [
    { id: 'all', label: 'All News', icon: Newspaper },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'announcements', label: 'Announcements', icon: Rss },
    { id: 'updates', label: 'Updates', icon: Star },
    { id: 'milestones', label: 'Milestones', icon: TrendingUp },
];

const AnimeNews = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [bookmarked, setBookmarked] = useState([]);
    const [newsData, setNewsData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        setLoading(true);
        try {
            const result = await getOrFetchNews();
            setNewsData(result.news || []);
            setLastUpdated(result.lastUpdated);
            setFromCache(result.fromCache);
        } catch (error) {
            console.error('Failed to load news:', error);
        }
        setLoading(false);
    };

    const forceRefresh = async () => {

        await loadNews();
    };

    const filteredNews = activeCategory === 'all'
        ? newsData
        : activeCategory === 'trending'
            ? newsData.filter(n => n.trending)
            : newsData.filter(n => n.category?.toLowerCase() === activeCategory);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatLastUpdated = (date) => {
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const toggleBookmark = (id) => {
        setBookmarked(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
    };

    const featuredNews = newsData.filter(n => n.trending).slice(0, 3);

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20" style={{ background: '#050505' }}>
            <div className="max-w-7xl mx-auto">

                {}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Globe className="text-red-500 animate-pulse" size={20} />
                        <span className="text-red-500 text-sm font-bold uppercase tracking-widest">Live Updates</span>
                    </div>
                    <h1
                        className="text-4xl md:text-7xl font-black mb-4"
                        style={{
                            color: '#eab308',
                            textShadow: '0 0 30px rgba(234, 179, 8, 0.5), 0 0 60px rgba(234, 179, 8, 0.3)'
                        }}
                    >
                        Anime News
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-4">
                        Stay updated with the latest anime announcements, releases, and industry news
                    </p>

                    {}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-slate-400 text-sm">
                                {loading ? 'Loading...' : `Updated: ${formatLastUpdated(lastUpdated)}`}
                            </span>
                            {fromCache && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Cached</span>}
                        </div>
                        <button
                            onClick={forceRefresh}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </motion.div>

                {}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Flame className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold text-slate-100">Trending Now</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredNews.map((article, idx) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedArticle(article)}
                                className="cursor-pointer rounded-2xl overflow-hidden group"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.9), rgba(10, 10, 10, 0.9))',
                                    border: '1px solid rgba(234, 179, 8, 0.2)',
                                }}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/90 text-white flex items-center gap-1">
                                            <Flame size={10} />
                                            TRENDING
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <span className="text-xs text-yellow-400 font-medium">{article.category}</span>
                                        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-yellow-400 transition-colors">
                                            {article.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{article.summary}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Heart size={12} />
                                                {(article.likes / 1000).toFixed(1)}k
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle size={12} />
                                                {article.comments}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDate(article.date)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <motion.button
                                key={cat.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat.id
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                                    }`}
                            >
                                <Icon size={16} />
                                {cat.label}
                            </motion.button>
                        );
                    })}
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredNews.map((article, idx) => (
                            <motion.article
                                key={article.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03 }}
                                whileHover={{ y: -3 }}
                                onClick={() => setSelectedArticle(article)}
                                className="cursor-pointer rounded-xl overflow-hidden group"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.9), rgba(10, 10, 10, 0.9))',
                                    border: '1px solid rgba(234, 179, 8, 0.1)',
                                }}
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                    {}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                                            className={`p-2 rounded-full transition-colors ${bookmarked.includes(article.id)
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-black/50 text-white hover:bg-black/70'
                                                }`}
                                        >
                                            <Bookmark size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                        >
                                            <Share2 size={14} />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-2 left-2">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                                background: 'rgba(234, 179, 8, 0.2)',
                                                color: '#eab308',
                                                border: '1px solid rgba(234, 179, 8, 0.3)'
                                            }}
                                        >
                                            {article.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 space-y-2">
                                    <h3 className="font-bold text-slate-100 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">{article.summary}</p>

                                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-800">
                                        <div className="flex items-center gap-1">
                                            <Globe size={12} />
                                            <span>{article.source}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{formatDate(article.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>

                {}
                <AnimatePresence>
                    {selectedArticle && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                            onClick={() => setSelectedArticle(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20, 20, 20, 1), rgba(10, 10, 10, 1))',
                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                }}
                            >
                                <div className="relative h-64 md:h-80">
                                    <img
                                        src={selectedArticle.image}
                                        alt={selectedArticle.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                    <button
                                        onClick={() => setSelectedArticle(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        ✕
                                    </button>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span
                                            className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                                            style={{
                                                background: 'rgba(234, 179, 8, 0.2)',
                                                color: '#eab308',
                                                border: '1px solid rgba(234, 179, 8, 0.3)'
                                            }}
                                        >
                                            {selectedArticle.category}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedArticle.title}</h2>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between text-sm text-slate-400 pb-4 border-b border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Globe size={14} />
                                                {selectedArticle.source}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(selectedArticle.date).toLocaleDateString('en-US', {
                                                    month: 'long', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Heart size={14} className="text-red-400" />
                                                {selectedArticle.likes.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle size={14} />
                                                {selectedArticle.comments}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        {selectedArticle.summary}
                                    </p>

                                    <p className="text-slate-400 leading-relaxed">
                                        This is a preview of the full article. In a production environment, this would display
                                        the complete news content fetched from a real anime news API, including detailed information,
                                        related images, and embedded videos.
                                    </p>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            className="flex-1 py-3 rounded-xl font-semibold text-black flex items-center justify-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                                        >
                                            <ExternalLink size={18} />
                                            Read Full Article
                                        </button>
                                        <button
                                            onClick={() => toggleBookmark(selectedArticle.id)}
                                            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors ${bookmarked.includes(selectedArticle.id)
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <Bookmark size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnimeNews;
