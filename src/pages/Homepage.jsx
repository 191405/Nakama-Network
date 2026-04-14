import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, Play, Film, Newspaper, ChevronRight, Shield, Sparkles, ArrowRight, Calendar, Feather } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jikanAPI } from '../utils/animeDataAPIs';

/* ── Hero background images (high-quality anime key visuals) ── */
const HERO_IMAGES = [
    'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg',
    'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
    'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
];

const TrendingCard = ({ anime, rank }) => {
    const imageUrl = anime?.images?.webp?.large_image_url || anime?.images?.jpg?.large_image_url || anime?.images?.webp?.image_url;

    return (
        <Link to={`/anime/${anime?.mal_id}`} className="flex-shrink-0 w-[160px] sm:w-auto block relative rounded-xl overflow-hidden group aspect-[3/4]">
            <img
                src={imageUrl}
                alt={anime?.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-sm">
                {rank}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="font-semibold text-[13px] text-white line-clamp-2 leading-tight mb-1">{anime?.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                    <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400" fill="currentColor" /> {anime?.score || '—'}</span>
                    <span>·</span>
                    <span>{anime?.episodes || '?'} ep</span>
                </div>
            </div>
        </Link>
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

const Homepage = () => {
    const { userProfile, openAuthModal } = useAuth();
    const [seasonalAnime, setSeasonalAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalTitles, setTotalTitles] = useState(0);
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
    const [heroImages, setHeroImages] = useState(HERO_IMAGES);

    // Auto-slide hero background every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current season anime (monthly schedule)
                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();
                const season = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';

                const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}?limit=12&order_by=score&sort=desc`);
                const data = await response.json();
                const results = data.data || [];
                setSeasonalAnime(results);

                // Use top seasonal anime images as hero backgrounds
                const dynamicImages = results
                    .filter(a => a?.images?.webp?.large_image_url || a?.images?.jpg?.large_image_url)
                    .slice(0, 5)
                    .map(a => a.images.webp?.large_image_url || a.images.jpg?.large_image_url);
                if (dynamicImages.length >= 3) {
                    setHeroImages(dynamicImages);
                }

                // Fetch live total title count
                const statsResponse = await fetch('https://api.jikan.moe/v4/anime?limit=1');
                const statsData = await statsResponse.json();
                setTotalTitles(statsData.pagination?.items?.total || 28000);
            } catch (err) {
                console.error("Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Determine current season label
    const getSeasonLabel = () => {
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        const season = month < 3 ? 'Winter' : month < 6 ? 'Spring' : month < 9 ? 'Summer' : 'Fall';
        return `${season} ${year}`;
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
                            fetchpriority="high"
                            decoding="sync"
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

            {/* === SEASONAL ANIME (This Season's Schedule) === */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-[#555]" />
                        <div>
                            <h2 className="text-lg font-bold text-white">{getSeasonLabel()} Anime</h2>
                            <p className="text-[11px] text-[#444]">This season's top-rated releases</p>
                        </div>
                    </div>
                    <Link to="/library" className="text-[12px] font-medium text-[#555] hover:text-white transition-colors flex items-center gap-1">
                        Full library <ChevronRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <>
                        {/* Mobile: horizontal scroll */}
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar sm:hidden">
                            {seasonalAnime.slice(0, 12).map((anime, idx) => (
                                <div key={anime.mal_id} className="snap-start">
                                    <TrendingCard anime={anime} rank={idx + 1} />
                                </div>
                            ))}
                        </div>
                        {/* Desktop: grid */}
                        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {seasonalAnime.slice(0, 12).map((anime, idx) => (
                                <TrendingCard key={anime.mal_id} anime={anime} rank={idx + 1} />
                            ))}
                        </div>
                    </>
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
        </div>
    );
};

export default Homepage;
