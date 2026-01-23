import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sword, TrendingUp, Users, Star, Zap,
    MessageCircle, ChevronRight, Sparkles,
    Play, Heart, Shield, Flame, Trophy,
    Crown, Eye, Activity, Globe, ArrowRight,
    Bell, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jikanAPI } from '../utils/animeDataAPIs';
import { subscribeToActiveBattles, getSystemStats } from '../utils/firebase';
import { NakamaLogo } from '../components/NakamaLogo';

const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
};

const HeroSection = ({ userName }) => {
    return (
        <section className="relative py-12 md:py-20 overflow-hidden">
            {}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: `${150 + i * 50}px`,
                            height: `${150 + i * 50}px`,
                            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(234,179,8,0.15)' : 'rgba(251,146,60,0.1)'}, transparent)`,
                            left: `${10 + i * 20}%`,
                            top: `${20 + (i % 3) * 20}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            x: [-10, 10, -10],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 6 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 text-center">
                {}
                {userName ? (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8"
                        style={{
                            background: 'rgba(234, 179, 8, 0.05)',
                            border: '1px solid rgba(234, 179, 8, 0.2)'
                        }}
                    >
                        <Crown size={16} className="text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Welcome back, {userName}</span>
                    </motion.div>
                ) : (
                    <div className="h-8"></div> 
                )}

                {}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-24 flex flex-col items-center justify-center mb-8"
                >
                    <NakamaLogo size="xl" showTagline={false} />
                    <p className="text-slate-500 mt-2 font-light tracking-wide">The Hidden Layer of Anime</p>
                </motion.div>

                {}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <Link to="/arena">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(234,179,8,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-2xl font-bold text-black flex items-center gap-3 text-lg"
                            style={{
                                background: 'linear-gradient(135deg, #eab308, #f59e0b, #ca8a04)',
                                boxShadow: '0 4px 20px rgba(234,179,8,0.3)'
                            }}
                        >
                            <Sword size={22} />
                            Enter Arena
                            <ArrowRight size={18} />
                        </motion.button>
                    </Link>
                    <Link to="/discover">
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-2xl font-bold text-yellow-400 flex items-center gap-3 text-lg transition-colors"
                            style={{
                                background: 'rgba(234, 179, 8, 0.08)',
                                border: '2px solid rgba(234, 179, 8, 0.4)'
                            }}
                        >
                            <Sparkles size={22} />
                            Explore
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

const LiveActivityFeed = ({ activities }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl p-6 h-full min-h-[300px]"
        style={{
            background: 'rgba(15, 15, 20, 0.95)',
            border: '1px solid rgba(234, 179, 8, 0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}
    >
        <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-white text-lg">Live Network Activity</h3>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto hide-scrollbar">
            {activities.length > 0 ? activities.map((activity, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                        <activity.icon size={18} className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm truncate font-medium">{activity.text}</p>
                        <p className="text-slate-500 text-xs">{activity.time}</p>
                    </div>
                </motion.div>
            )) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
                    <Activity size={40} className="mb-4 opacity-50" />
                    <p className="text-sm">Waiting for live signals...</p>
                </div>
            )}
        </div>
    </motion.div>
);

const TrendingCard = ({ anime, rank }) => {
    const imageUrl = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;

    return (
        <Link to={`/anime/${anime?.mal_id}`}>
            <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative rounded-xl overflow-hidden group cursor-pointer h-full"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
            >
                <div className="aspect-[3/4]">
                    <img
                        src={imageUrl}
                        alt={anime?.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x280/1a1a2e/eab308?text=Anime'; }}
                    />
                </div>

                {}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {}
                <div
                    className="absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                    style={{
                        background: rank <= 3 ? 'linear-gradient(135deg, #eab308, #ca8a04)' : 'rgba(0,0,0,0.8)',
                        color: rank <= 3 ? '#000' : '#eab308'
                    }}
                >
                    #{rank}
                </div>

                {}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="font-bold text-white text-sm line-clamp-2 mb-1">{anime?.title}</h4>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star size={12} fill="currentColor" />
                            <span>{anime?.score || 'N/A'}</span>
                        </div>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{anime?.episodes || '?'} eps</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

const QuickAccessCard = ({ icon: Icon, title, desc, path, color }) => (
    <Link to={path}>
        <motion.div
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl h-full relative overflow-hidden group"
            style={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(202, 138, 4, 0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
        >
            {}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${color}15, transparent 70%)` }}
            />

            <div className="relative z-10">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                >
                    <Icon size={24} style={{ color }} />
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
            </div>
        </motion.div>
    </Link>
);

const StatsBar = ({ stats }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-8 px-6 rounded-2xl"
        style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(202,138,4,0.05))',
            border: '1px solid rgba(202, 138, 4, 0.2)',
            boxShadow: '0 4px 30px rgba(234,179,8,0.1)'
        }}
    >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
                { value: stats.users || 0, label: 'Active Warriors', icon: Users },
                { value: stats.battles || 0, label: 'Battles Fought', icon: Sword },
                { value: stats.anime || 0, label: 'Anime Indexed', icon: Play },
                { value: 0, label: 'Live Events', icon: Zap },
            ].map((stat, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: 'rgba(234,179,8,0.15)' }}>
                        <stat.icon size={24} className="text-yellow-400" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1" style={{ textShadow: '0 2px 10px rgba(234,179,8,0.3)' }}>
                        <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-slate-500 text-sm">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    </motion.section>
);

const Homepage = () => {
    const { userProfile } = useAuth();
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [siteStats, setSiteStats] = useState({ users: 0, battles: 0, votes: 0, anime: 0 });
    const [liveActivities, setLiveActivities] = useState([]);

    const FALLBACK_TRENDING = [
        { mal_id: 1, title: "Jujutsu Kaisen", score: 8.7, episodes: 24, images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg" } } },
        { mal_id: 2, title: "Attack on Titan", score: 9.0, episodes: 87, images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg" } } },
        { mal_id: 3, title: "Demon Slayer", score: 8.5, episodes: 44, images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg" } } },
        { mal_id: 4, title: "One Piece", score: 8.7, episodes: 1100, images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/6/73245.jpg" } } },
        { mal_id: 5, title: "My Hero Academia", score: 8.0, episodes: 138, images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/10/78745.jpg" } } },
        { mal_id: 6, title: "Naruto Shippuden", score: 8.3, episodes: 500, images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/5/17407.jpg" } } }
    ];

    useEffect(() => {
        loadData();

        getSystemStats().then(stats => {
            setSiteStats({
                users: stats.users || 0,
                battles: stats.battles || 0,
                votes: 0,
                anime: stats.anime || 0
            });
        });

        setLiveActivities([]);

    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const animeData = await jikanAPI.getTrendingAnime(12).catch(() => null);

            if (animeData && animeData.length > 0) {
                setTrendingAnime(animeData);
            } else {
                console.log('Using fallback trending data');
                setTrendingAnime(FALLBACK_TRENDING);
            }
        } catch (error) {
            console.error('Failed to load data, using fallback:', error);
            setTrendingAnime(FALLBACK_TRENDING);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20">
            <div className="max-w-7xl mx-auto">
                {}
                <HeroSection userName={userProfile?.displayName} />

                {}
                <div className="mb-12">
                    <LiveActivityFeed activities={liveActivities} />
                </div>

                {}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}>
                                <TrendingUp size={20} className="text-black" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Trending Now</h2>
                                <p className="text-slate-500 text-xs">Hottest anime this season</p>
                            </div>
                        </div>
                        <Link to="/discover" className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 text-sm font-medium">
                            See All <ChevronRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-10 h-10 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {trendingAnime.slice(0, 12).map((anime, idx) => (
                                <TrendingCard key={anime?.mal_id || idx} anime={anime} rank={idx + 1} />
                            ))}
                        </div>
                    )}
                </section>

                {}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickAccessCard icon={Zap} title="Hub" desc="Command Center" path="/command-center" color="#eab308" />
                        <QuickAccessCard icon={Users} title="Community" desc="Wiki & Discussions" path="/community" color="#22c55e" />
                        <QuickAccessCard icon={Shield} title="Clans" desc="Join epic battles" path="/clan" color="#3b82f6" />
                        <QuickAccessCard icon={ImageIcon} title="Media" desc="Share & discover" path="/global-media" color="#a855f7" />
                    </div>
                </section>

                {}
                <StatsBar stats={siteStats} />
            </div>
        </div>
    );
};

export default Homepage;
