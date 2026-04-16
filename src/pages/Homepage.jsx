import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, Play, Film, Newspaper, ChevronRight, Shield, Sparkles, ArrowRight, Calendar, Feather, Clock, Eye, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jikanAPI } from '../utils/animeDataAPIs';
import { getAnimeImage, PLACEHOLDERS, handleImageError } from '../utils/imageUtils';
import Skeleton, { AnimeCardSkeleton } from '../components/Skeleton';
import OracleTileModal from '../components/OracleTileModal';

/* ── Hero background images — Premium High-Resolution Landscape Banners ── */
const HERO_IMAGES = [
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/180745-Iicz1F6Kuj4e.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/166613-drS86exJlIjG.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/172463-3J2o3qQZadFJ.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/167152-6QxZG8Dmf1EL.jpg',
];

// Fallback hero images from a more permissive CDN
const FALLBACK_HERO_IMAGES = [
    'https://img.anili.st/media/21',
    'https://img.anili.st/media/16498',
    'https://img.anili.st/media/5114',
    'https://img.anili.st/media/38000',
    'https://img.anili.st/media/51009',
];

/* ── Enhanced Trending Card with deeper info + Oracle ── */
const TrendingCard = ({ anime, rank, onAskOracle }) => {
    const imageUrl = getAnimeImage(anime?.images, 'large');
    const [hovered, setHovered] = useState(false);
    const genres = anime?.genres?.slice(0, 2) || [];
    const synopsis = anime?.synopsis?.slice(0, 100);

    return (
        <div
            className="w-full block relative rounded-xl overflow-hidden group aspect-[3/4]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Link to={`/anime/${anime?.mal_id}`} className="block w-full h-full">
                <img
                    src={imageUrl}
                    alt={anime?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => handleImageError(e, PLACEHOLDERS.anime)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-sm">
                    {rank}
                </div>

                {/* Airing badge */}
                {anime?.status === 'Currently Airing' && (
                    <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-emerald-300 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                        AIRING
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="font-semibold text-[13px] text-white line-clamp-2 leading-tight mb-1">{anime?.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-white/50">
                        <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400" fill="currentColor" /> {anime?.score || '—'}</span>
                        <span>·</span>
                        <span>{anime?.episodes || '?'} ep</span>
                        {anime?.type && <><span>·</span><span>{anime.type}</span></>}
                    </div>

                    {/* Genre tags */}
                    {genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {genres.map(g => (
                                <span key={g.mal_id} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-white/[0.08] text-white/40">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>

            {/* Hover expansion — deeper info */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-x-0 bottom-0 p-3 pt-6 z-10"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)' }}
                    >
                        {synopsis && (
                            <p className="text-[10px] text-white/40 leading-relaxed line-clamp-3 mb-2">
                                {synopsis}…
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-white/30">
                            {anime?.members && (
                                <span className="flex items-center gap-0.5">
                                    <Eye size={9} /> {(anime.members / 1000).toFixed(0)}k
                                </span>
                            )}
                            {anime?.year && (
                                <span className="flex items-center gap-0.5">
                                    <Calendar size={9} /> {anime.year}
                                </span>
                            )}
                        </div>

                        {/* Ask Oracle button */}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAskOracle(anime); }}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-[1.02]"
                            style={{
                                background: 'linear-gradient(135deg, rgba(200,160,120,0.12), rgba(200,160,120,0.04))',
                                border: '1px solid rgba(200,160,120,0.2)',
                                color: 'rgba(200,160,120,0.8)',
                            }}
                        >
                            <Sparkles size={10} /> Ask Oracle
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FeatureCard = ({ to, icon: Icon, title, desc, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        <Link to={to} className="group block p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] bg-[#0a0a0a] hover:bg-[#0e0e0e] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/[0.04]">
                    <Icon size={18} className="text-[#888]" />
                </div>
                <ArrowRight size={14} className="text-transparent group-hover:text-[#555] transition-colors mt-1" />
            </div>
            <h3 className="text-[15px] font-semibold text-white mb-1">{title}</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">{desc}</p>
        </Link>
    </motion.div>
);

/* ── News Preview Card (for homepage) ── */
const NewsPreviewCard = ({ article }) => (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
        className="group block p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.1] bg-[#0a0a0a] transition-all">
        <div className="flex gap-3">
            {article.image && (
                <img src={article.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
            )}
            <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-semibold text-white line-clamp-2 mb-1 group-hover:text-white/80">{article.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-[#555]">
                    <Clock size={10} />
                    <span>{article.timeAgo || 'Recent'}</span>
                    {article.comments > 0 && (
                        <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><MessageCircle size={9} />{article.comments}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    </a>
);

const Homepage = () => {
    const { userProfile, openAuthModal } = useAuth();
    const [springAnime, setSpringAnime] = useState([]);
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [newsPreview, setNewsPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newsLoading, setNewsLoading] = useState(true);
    const [totalTitles, setTotalTitles] = useState(0);
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
    const [heroImages, setHeroImages] = useState(HERO_IMAGES);
    const [oracleAnime, setOracleAnime] = useState(null);

    // Auto-slide hero background every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    // Main data fetch — Spring Anime + Trending
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const now = new Date();
                const year = now.getFullYear();

                // Explicitly fetch Spring season (April-June)
                let springResults = await jikanAPI.getSeasonalAnime(year, 'spring', 12);

                // Fallback chain: try "season now" endpoint, then explicitly Upcoming
                if (!springResults || springResults.length === 0) {
                    console.log("Spring data empty, trying season/now...");
                    springResults = await jikanAPI.getSeasonNow(12);
                }

                if (!springResults || springResults.length === 0) {
                    console.log("Season/now also empty, falling back to Upcoming releases...");
                    springResults = await jikanAPI.getUpcomingAnime(12);
                }

                setSpringAnime(springResults || []);



                // Also fetch trending anime (kept separate)
                const trendingResults = await jikanAPI.getTrendingAnime(6);
                setTrendingAnime(trendingResults || []);

                setTotalTitles(28000);
            } catch (err) {
                console.error("Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // News preview fetch
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setNewsLoading(true);
                // Pull news from a few popular anime
                const newsIds = [21, 1735, 16498, 5114, 38000];
                const allNews = [];
                for (const malId of newsIds.slice(0, 2)) {
                    const items = await jikanAPI.getAnimeNews(malId, 3);
                    if (items && items.length > 0) {
                        allNews.push(...items.map(item => ({
                            title: item.title,
                            url: item.url,
                            image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || item.images?.webp?.image_url || null,
                            comments: item.comments || 0,
                            timeAgo: item.date ? getTimeAgo(item.date) : 'Recent',
                        })));
                    }
                }
                setNewsPreview(allNews.slice(0, 4));
            } catch (err) {
                console.error("Failed to load news preview:", err);
            } finally {
                setNewsLoading(false);
            }
        };
        fetchNews();
    }, []);

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Determine current season label
    const getSeasonLabel = () => {
        const year = new Date().getFullYear();
        return `Spring ${year}`;
    };

    return (
        <div className="min-h-screen bg-[#050505]">

            {/* === HERO with auto-sliding backgrounds === */}
            <section className="relative min-h-[85vh] flex items-end overflow-hidden">
                {/* Sliding background images */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentHeroIdx}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                    >
                        <img
                            src={heroImages[currentHeroIdx]}
                            alt=""
                            className="w-full h-full object-cover"
                            fetchPriority="high"
                            decoding="async"
                            onError={(e) => {
                                // Try AniList CDN fallback on error
                                const fallback = FALLBACK_HERO_IMAGES[currentHeroIdx % FALLBACK_HERO_IMAGES.length];
                                if (e.target.src !== fallback) {
                                    e.target.onerror = null;
                                    e.target.src = fallback;
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Slide indicators */}
                <div className="absolute bottom-6 right-6 md:right-10 z-20 flex gap-1.5">
                    {heroImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentHeroIdx(idx)}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                idx === currentHeroIdx ? 'w-6 bg-white/60' : 'w-1.5 bg-white/15'
                            }`}
                        />
                    ))}
                </div>

                <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-16 pt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-5">
                            Your anime,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">elevated.</span>
                        </h1>
                        <p className="text-base sm:text-lg text-white/50 mb-8 max-w-lg leading-relaxed font-light">
                            Discover, rank, and debate with the most dedicated anime community on the internet.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/library"
                                className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
                            >
                                <Play size={16} className="fill-black" /> Browse Library
                            </Link>
                            {!userProfile && (
                                <button
                                    onClick={() => openAuthModal()}
                                    className="px-6 py-3 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white font-medium text-sm hover:bg-white/[0.12] transition-colors"
                                >
                                    Create Account
                                </button>
                            )}
                        </div>

                        {/* Live title count */}
                        {totalTitles > 0 && (
                            <div className="flex items-center gap-2 mt-10 text-[12px] text-white/25 font-medium">
                                <Film size={12} />
                                <span>{totalTitles.toLocaleString()} titles in database</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* === SPRING ANIME SECTION === */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(200,160,120,0.1), rgba(200,160,120,0.03))' }}>
                            <Calendar size={18} style={{ color: '#c8a078' }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{getSeasonLabel()} Anime</h2>
                            <p className="text-[11px] text-[#444]">This season's top-rated releases · Updates every 3 days</p>
                        </div>
                    </div>
                    <Link to="/library" className="text-[12px] font-medium text-[#555] hover:text-white transition-colors flex items-center gap-1">
                        Full library <ChevronRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
                        {[...Array(6)].map((_, i) => (
                            <AnimeCardSkeleton key={i} />
                        ))}
                    </div>
                ) : springAnime.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                            {springAnime.slice(0, 12).map((anime, idx) => (
                                <TrendingCard key={anime.mal_id} anime={anime} rank={idx + 1} onAskOracle={setOracleAnime} />
                            ))}
                        </div>
                ) : (
                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                        <p className="text-white/40 text-sm">No transmissions found in this sector.</p>
                    </div>
                )}
            </section>

            {/* === TRENDING NOW (separate row) === */}
            {trendingAnime.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/[0.04]">
                                <TrendingUp size={18} className="text-[#888]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Trending Now</h2>
                                <p className="text-[11px] text-[#444]">Most-watched series right now</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {trendingAnime.slice(0, 6).map((anime, idx) => (
                            <TrendingCard key={anime.mal_id} anime={anime} rank={`#${idx + 1}`} onAskOracle={setOracleAnime} />
                        ))}
                    </div>
                </section>
            )}

            {/* === LATEST NEWS PREVIEW === */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/[0.04]">
                            <Newspaper size={18} className="text-[#888]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Latest News</h2>
                            <p className="text-[11px] text-[#444]">Fresh from the anime world · Auto-updates every 3 days</p>
                        </div>
                    </div>
                    <Link to="/news" className="text-[12px] font-medium text-[#555] hover:text-white transition-colors flex items-center gap-1">
                        All news <ChevronRight size={14} />
                    </Link>
                </div>

                {newsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />
                        ))}
                    </div>
                ) : newsPreview.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {newsPreview.map((article, idx) => (
                            <NewsPreviewCard key={idx} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <p className="text-white/30 text-sm">No news available right now.</p>
                    </div>
                )}
            </section>

            {/* === FEATURES === */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FeatureCard to="/community" icon={TrendingUp} title="Community" desc="Wikis, discussions, and guides curated by fans." delay={0.1} />
                    <FeatureCard to="/clan" icon={Shield} title="Clans" desc="Build alliances and compete on the leaderboards." delay={0.15} />
                    <FeatureCard to="/oracle" icon={Sparkles} title="The Sensei" desc="Get personalized anime recommendations." delay={0.2} />
                    <FeatureCard to="/news" icon={Newspaper} title="Industry Intel" desc="Studio announcements and release calendars." delay={0.25} />
                    <FeatureCard to="/story-writer" icon={Feather} title="Story Writer" desc="Write and publish web novels with continuity tracking." delay={0.3} />
                </div>
            </section>

            {/* Oracle Modal */}
            <OracleTileModal
                anime={oracleAnime}
                isOpen={!!oracleAnime}
                onClose={() => setOracleAnime(null)}
            />
        </div>
    );
};

export default Homepage;
