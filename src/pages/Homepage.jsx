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
import { GlowButton } from '../components/InteractiveButton';

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
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Link to="/arena">
                        <GlowButton>
                            <Sword size={22} />
                            Enter Arena
                            <ArrowRight size={18} />
                        </GlowButton>
                    </Link>
                    <Link to="/discover">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(234,179,8,0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-2xl font-bold text-yellow-400 flex items-center gap-3 text-lg transition-all relative overflow-hidden group"
                            style={{
                                background: 'rgba(234, 179, 8, 0.08)',
                                border: '2px solid rgba(234, 179, 8, 0.4)'
                            }}
                        >
                            <Sparkles size={22} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span>Explore</span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
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
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link to={`/anime/${anime?.mal_id}`}>
            <motion.div
                whileHover={{ scale: 1.05, y: -8 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative rounded-2xl overflow-hidden group cursor-pointer h-full shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-shadow duration-300"
            >
                <div className="aspect-[3/4] relative overflow-hidden">
                    <motion.img
                        src={imageUrl}
                        alt={anime?.title}
                        className="w-full h-full object-cover"
                        animate={{ scale: isHovered ? 1.15 : 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x280/1a1a2e/eab308?text=Anime'; }}
                    />
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
                        animate={{ opacity: isHovered ? 0.9 : 0.7 }}
                    />
                </div>

                {}
                <motion.div
                    className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center font-black text-base backdrop-blur-sm"
                    style={{
                        background: rank <= 3 ? 'linear-gradient(135deg, #eab308, #ca8a04)' : 'rgba(0,0,0,0.8)',
                        color: rank <= 3 ? '#000' : '#eab308',
                        boxShadow: rank <= 3 ? '0 4px 15px rgba(234,179,8,0.5)' : 'none'
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                >
                    #{rank}
                </motion.div>

                {}
                <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-4"
                    animate={{ y: isHovered ? 0 : 10 }}
                    transition={{ duration: 0.3 }}
                >
                    <h4 className="font-bold text-white text-sm line-clamp-2 mb-2 drop-shadow-lg">{anime?.title}</h4>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-yellow-400 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Star size={14} fill="currentColor" />
                            <span className="font-bold">{anime?.score || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Play size={12} />
                            <span>{anime?.episodes || '?'} eps</span>
                        </div>
                    </div>
                </motion.div>

                {}
                <motion.div
                    className="absolute inset-0 border-2 border-yellow-500/0 rounded-2xl pointer-events-none"
                    animate={{ borderColor: isHovered ? 'rgba(234,179,8,0.5)' : 'rgba(234,179,8,0)' }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </Link>
    );
};

const QuickAccessCard = ({ icon: Icon, title, desc, path, color }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <Link to={path}>
            <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="p-6 rounded-2xl h-full relative overflow-hidden group cursor-pointer"
                style={{
                    background: 'rgba(15, 15, 20, 0.95)',
                    border: '1px solid rgba(202, 138, 4, 0.15)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}
            >
                {}
                <motion.div
                    className="absolute inset-0"
                    animate={{ 
                        background: isHovered 
                            ? `radial-gradient(circle at center, ${color}25, transparent 70%)` 
                            : `radial-gradient(circle at center, ${color}10, transparent 70%)`
                    }}
                    transition={{ duration: 0.5 }}
                />

                <div className="relative z-10">
                    <motion.div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden"
                        style={{ background: `${color}15`, border: `2px solid ${color}30` }}
                        animate={{ 
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <motion.div
                            animate={{ rotate: isHovered ? 360 : 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Icon size={28} style={{ color }} />
                        </motion.div>
                    </motion.div>
                    <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm">{desc}</p>
                    
                    <motion.div
                        className="mt-4 flex items-center gap-2 text-sm font-medium"
                        style={{ color }}
                        animate={{ x: isHovered ? 5 : 0 }}
                    >
                        <span>Explore</span>
                        <ChevronRight size={16} />
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    );
};

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
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden" 
                                style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TrendingUp size={24} className="text-black" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Trending Now</h2>
                                <p className="text-slate-400 text-sm">Hottest anime this season</p>
                            </div>
                        </div>
                        <Link to="/discover">
                            <motion.div 
                                whileHover={{ x: 5 }}
                                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-yellow-500/10 transition-all"
                            >
                                See All <ChevronRight size={18} />
                            </motion.div>
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div 
                                className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <p className="text-slate-400 mt-4 text-sm">Loading trending anime...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                            {trendingAnime.slice(0, 12).map((anime, idx) => (
                                <TrendingCard key={anime?.mal_id || idx} anime={anime} rank={idx + 1} />
                            ))}
                        </div>
                    )}
                </section>

                {}
                <section className="mb-12">
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl font-black text-white mb-6 flex items-center gap-3"
                    >
                        <Zap className="text-yellow-400" size={28} />
                        Quick Access
                    </motion.h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
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
