import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Clock, Star, Users, Flame, Info,
    PlayCircle, ArrowLeft, Bot, Send, X, Loader2,
    ChevronDown, ChevronUp, Link as LinkIcon,
    AlertCircle, Crown
} from 'lucide-react';
import { jikanAPI } from '../utils/animeDataAPIs';
import { askAboutAnime } from '../utils/gemini';
import { useAuth } from '../contexts/AuthContext';
import { getAnimeImage, getCharacterImage, PLACEHOLDERS, handleImageError } from '../utils/imageUtils';

const AI_ASSISTANT_PANEL = ({ anime, isOpen, onClose }) => {
    const { userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 1, type: 'ai',
                text: `I am The Oracle's assistant for ${anime.title}. What would you like to know about this ${anime.type}?`
            }]);
        }
    }, [isOpen, anime, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const contextData = {
                title: anime.title,
                synopsis: anime.synopsis,
                genres: anime.genres,
                score: anime.score,
                episodes: anime.episodes,
                status: anime.status,
                studios: anime.studios
            };
            const aiResponse = await askAboutAnime(contextData, userMsg);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiResponse }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: "My connection to the data dimension was interrupted. Please try asking again." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-[350px] max-w-[calc(100vw-32px)] bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
        >
            <div className="p-4 bg-gradient-to-r from-[#e5484d] to-[#111] flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                    <Bot size={18} />
                    <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Data Oracle</span>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-[13px] leading-relaxed ${
                            msg.type === 'user' 
                                ? 'bg-[#e5484d] text-white rounded-tr-sm' 
                                : 'bg-white/[0.05] text-[#ccc] border border-white/[0.05] rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/[0.05] border border-white/[0.05] rounded-xl rounded-tl-sm p-3">
                            <Loader2 size={14} className="animate-spin text-[#888]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-white/[0.05] bg-[#050505]">
                <div className="relative">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        placeholder="Ask about this anime..." disabled={loading}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-white/[0.15]"
                    />
                    <button type="submit" disabled={!input || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#e5484d] disabled:opacity-40 hover:text-white transition-colors">
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const AnimeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anime, setAnime] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSynopsis, setExpandedSynopsis] = useState(false);
    const [aiPanelOpen, setAiPanelOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch in parallel for speed
                const [detailsData, charsData, epsData] = await Promise.all([
                    jikanAPI.getAnimeDetails(id),
                    jikanAPI.getAnimeCharacters(id).catch(() => []),
                    jikanAPI.getAnimeEpisodes(id).catch(() => [])
                ]);
                
                if (!detailsData) throw new Error('Anime not found');
                
                setAnime(detailsData);
                // Sort characters by favorites, take top 12
                setCharacters(charsData.sort((a,b) => (b.favorites || 0) - (a.favorites || 0)).slice(0, 12));
                setEpisodes(epsData);
            } catch (err) {
                console.error(err);
                setError('Failed to load anime details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#e5484d]" />
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-4">
                <AlertCircle size={48} className="text-[#e5484d] mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Data Fragment Corrupted</h1>
                <p className="text-[#666] mb-6">{error || 'Anime not found'}</p>
                <button onClick={() => navigate('/library')} className="px-6 py-2 rounded-xl bg-white/[0.05] text-white hover:bg-white/[0.1] transition-colors">
                    Return to Library
                </button>
            </div>
        );
    }

    const coverImage = getAnimeImage(anime.images, 'large');
    const bannerImage = anime.trailer?.images?.maximum_image_url || coverImage;

    return (
        <div className="min-h-screen bg-[#050505] pb-24">
            {/* Hero Banner Section */}
            <div className="relative h-[400px] md:h-[500px] w-full">
                <div className="absolute inset-0">
                    <img src={bannerImage} alt="Banner" className="w-full h-full object-cover opacity-30"
                        onError={(e) => handleImageError(e, PLACEHOLDERS.animeLandscape)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-80" />
                </div>
                
                <div className="absolute top-24 left-4 md:left-8 z-20">
                    <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md text-sm">
                        <ArrowLeft size={16} /> Back to Library
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative -mt-[200px] md:-mt-[250px] z-10 flex flex-col md:flex-row gap-8">
                {/* Left Column (Poster & Actions) */}
                <div className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-4">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#0a0a0a]">
                        <img src={coverImage} alt={anime.title} className="w-full h-auto object-cover"
                            onError={(e) => handleImageError(e, PLACEHOLDERS.anime)} />
                    </div>
                    
                    {anime.trailer?.url && (
                        <a href={anime.trailer.url} target="_blank" rel="noopener noreferrer" 
                           className="w-full py-3.5 bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors border border-white/[0.05]">
                            <PlayCircle size={18} /> Watch Trailer
                        </a>
                    )}

                    <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.05] p-4 text-[13px] space-y-3">
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                            <span className="text-[#666]">Format</span>
                            <span className="text-white font-medium">{anime.type || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                            <span className="text-[#666]">Episodes</span>
                            <span className="text-white font-medium">{anime.episodes || '?'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                            <span className="text-[#666]">Status</span>
                            <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{anime.status}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                            <span className="text-[#666]">Season</span>
                            <span className="text-white font-medium capitalize">{anime.season ? `${anime.season} ${anime.year}` : 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.05] pb-2">
                            <span className="text-[#666]">Studios</span>
                            <span className="text-white font-medium text-right max-w-[150px] truncate">{anime.studios?.map(s => s.name).join(', ') || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#666]">Source</span>
                            <span className="text-white font-medium">{anime.source || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column (Info) */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        {anime.title_english || anime.title}
                    </h1>
                    {anime.title_japanese && (
                        <h2 className="text-[#888] text-lg mb-6 font-medium">{anime.title_japanese}</h2>
                    )}

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        {anime.score && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e5484d]/10 border border-[#e5484d]/20 text-[#e5484d] font-bold">
                                <Star size={16} fill="currentColor" /> {anime.score}
                            </div>
                        )}
                        {anime.rank && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-sm">
                                <Crown size={16} /> Rank #{anime.rank}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.05] text-[#aaa] text-sm">
                            <Users size={16} /> {anime.members?.toLocaleString() || 0} Members
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {anime.genres?.map(g => (
                            <span key={g.mal_id} className="px-3 py-1 rounded-full bg-white/[0.04] text-[#ccc] text-xs font-medium border border-white/[0.05]">
                                {g.name}
                            </span>
                        ))}
                    </div>

                    {/* Synopsis */}
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Synopsis</h3>
                        <div className="relative">
                            <p className={`text-[#aaa] text-[15px] leading-relaxed ${!expandedSynopsis ? 'line-clamp-4' : ''}`}>
                                {anime.synopsis || 'No synopsis has been added for this title yet.'}
                            </p>
                            {anime.synopsis?.length > 300 && !expandedSynopsis && (
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050505] to-transparent" />
                            )}
                        </div>
                        {anime.synopsis?.length > 300 && (
                            <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="mt-2 text-[#e5484d] text-sm font-semibold hover:text-[#f26065] transition-colors flex items-center gap-1">
                                {expandedSynopsis ? 'Read Less' : 'Read More'} {expandedSynopsis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>

                    {/* Characters */}
                    {characters.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Characters</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {characters.map(({ character, role }) => (
                                    <div key={character.mal_id} className="rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06] flex flex-col">
                                        <div className="aspect-[3/4] relative">
                                            <img
                                                src={getCharacterImage(character.images)}
                                                alt={character.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => handleImageError(e, PLACEHOLDERS.character)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-white font-bold text-xs line-clamp-1">{character.name.split(',').reverse().join(' ').trim()}</p>
                                                <p className="text-[#a16207] text-[10px]">{role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Relations */}
                    {anime.relations?.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Relations</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {anime.relations.slice(0, 6).map((relation, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <p className="text-[#e5484d] text-xs font-bold mb-1 uppercase tracking-wider">{relation.relation}</p>
                                        <div className="flex flex-col gap-1">
                                            {relation.entry?.map(e => (
                                                <span key={e.mal_id} className="text-[#ccc] text-sm">{e.name} <span className="text-[#555] text-xs">({e.type})</span></span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Assistant Toggle Button */}
            {!aiPanelOpen && (
                <motion.button 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAiPanelOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-[#e5484d] text-white p-4 rounded-full shadow-[0_8px_30px_rgba(229,72,77,0.3)] flex items-center gap-3 border border-white/10"
                >
                    <Bot size={24} />
                    <span className="font-bold pr-2 hidden md:block">Ask Oracle</span>
                </motion.button>
            )}

            {/* AI Assistant Panel */}
            <AnimatePresence>
                {aiPanelOpen && (
                    <AI_ASSISTANT_PANEL anime={anime} isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnimeDetail;
