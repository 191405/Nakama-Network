import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocketChat } from '../hooks/useWebSocketChat';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, MessageCircle, Heart, BookOpen,
    Star, TrendingUp, User, Crown, Eye, Send, X,
    Shield, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jikanAPI } from '../utils/animeDataAPIs';
import {
    sendChatMessage, subscribeToChatMessages,
    createCommunityPost, subscribeToCommunityPosts, likeCommunityPost,
    claimCharacter, getUserClaim, subscribeToCharacterClaims
} from '../utils/firebase';

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariant = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

/* ── Character Claim Card (shows a claimed identity) ── */
const ClaimedMemberCard = ({ claim }) => (
    <motion.div variants={itemVariant}
        className="relative rounded-xl overflow-hidden group bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] transition-all"
    >
        <div className="aspect-[3/4] relative">
            <img src={claim.characterImage} alt={claim.characterName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={e => { e.target.src = 'https://via.placeholder.com/200x300/111/333?text=?'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-emerald-500/80 text-[9px] font-bold text-white flex items-center gap-0.5">
                <Shield size={8} /> CLAIMED
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-white font-bold text-[13px] line-clamp-1">{claim.characterName}</h4>
                <p className="text-white/30 text-[11px] line-clamp-1">{claim.animeName}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#b76e79] flex items-center justify-center text-[8px] text-white font-bold">
                        {claim.claimedByName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-[10px] text-white/50 truncate">{claim.claimedByName}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

/* ── Character Search Card (for claiming) ── */
const SearchCharacterCard = ({ character, onClaim, claimStatus, loading }) => {
    const image = character?.images?.webp?.image_url || character?.images?.jpg?.image_url;
    const animeName = character?.anime?.[0]?.anime?.title || 'Unknown';
    const isClaimed = claimStatus === 'claimed';

    return (
        <motion.div variants={itemVariant} className={`rounded-xl overflow-hidden border transition-all ${
            isClaimed ? 'border-white/[0.04] opacity-50' : 'border-white/[0.06] hover:border-white/[0.12]'
        } bg-[#0a0a0a]`}>
            <div className="aspect-[3/4] relative">
                <img src={image} alt={character?.name} className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/200x300/111/333?text=?'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {isClaimed && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-red-500/80 text-[9px] font-bold text-white">
                        TAKEN
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-semibold text-[12px] line-clamp-1">{character?.name}</h4>
                    <p className="text-white/30 text-[10px] line-clamp-1">{animeName}</p>
                    {character?.favorites && (
                        <span className="text-[10px] text-amber-400/60 flex items-center gap-0.5 mt-1">
                            <Heart size={8} fill="currentColor" /> {(character.favorites / 1000).toFixed(0)}K
                        </span>
                    )}
                </div>
            </div>

            {!isClaimed && (
                <button
                    onClick={() => onClaim(character)}
                    disabled={loading}
                    className="w-full py-2.5 text-[11px] font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
                >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12} /> Claim Identity</>}
                </button>
            )}
        </motion.div>
    );
};

/* ── Discussion Thread ── */
const DiscussionThread = ({ thread, onLike }) => (
    <motion.div variants={itemVariant} className="p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.08] bg-[#0a0a0a] transition-all">
        <div className="flex gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 bg-[#b76e79] text-white">
                {thread.author?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white text-sm line-clamp-2">{thread.title}</h4>
                    <span className="text-[11px] text-[#333] flex-shrink-0">{thread.time}</span>
                </div>
                <p className="text-[#555] text-xs line-clamp-2 mt-1">{thread.preview}</p>
                <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#444]"><MessageCircle size={12} />{thread.replies} replies</span>
                    <button onClick={e => { e.stopPropagation(); onLike?.(thread.id); }}
                        className="flex items-center gap-1 text-xs text-[#444] hover:text-[#b76e79] transition-colors">
                        <Heart size={12} />{thread.likes}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-[#444]"><Eye size={12} />{thread.views}</span>
                </div>
                {thread.tags?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        {thread.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] text-[#666]">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

/* ── Create Post Modal ── */
const CreatePostModal = ({ onClose, userProfile }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setLoading(true);
        try {
            await createCommunityPost(userProfile.id, userProfile.displayName, userProfile.rank, userProfile.photoURL,
                title.trim(), content.trim(), tags.split(',').map(t => t.trim()).filter(t => t));
            onClose();
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-xl rounded-2xl p-6 bg-[#0a0a0a] border border-white/[0.06]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Start a Discussion</h2>
                    <button onClick={onClose} className="text-[#555] hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#444] bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none" maxLength={100} />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts..."
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#444] bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none resize-none h-32" />
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma-separated)"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#444] bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none" />
                    <button type="submit" disabled={loading || !title.trim() || !content.trim()}
                        className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#b76e79] hover:bg-[#f26065] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Post Discussion'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════
   MAIN COMMUNITY PAGE
   ═══════════════════════════════════════════ */
const Community = () => {
    const { userProfile, openAuthModal } = useAuth();
    const [activeTab, setActiveTab] = useState('identities');
    const [characters, setCharacters] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimError, setClaimError] = useState('');
    const [claimSuccess, setClaimSuccess] = useState('');
    const [allClaims, setAllClaims] = useState([]);
    const [userClaim, setUserClaim] = useState(null);
    const [claimedIds, setClaimedIds] = useState(new Set());
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatRoom, setChatRoom] = useState('general');
    const chatEndRef = useRef(null);
    const [discussions, setDiscussions] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showClaimFlow, setShowClaimFlow] = useState(false);

    const tabs = [
        { id: 'identities', label: 'Identities', icon: Shield },
        { id: 'discussions', label: 'Discussions', icon: MessageCircle },
        { id: 'chat', label: 'Live Chat', icon: Users },
    ];

    // Subscribe to all character claims (real-time)
    useEffect(() => {
        const unsub = subscribeToCharacterClaims(claims => {
            setAllClaims(claims);
            setClaimedIds(new Set(claims.map(c => c.characterId)));
        });
        return () => unsub();
    }, []);

    // Load user's own claim
    useEffect(() => {
        if (userProfile?.id) {
            getUserClaim(userProfile.id).then(claim => setUserClaim(claim)).catch(() => {});
        }
    }, [userProfile?.id, claimSuccess]);

    // WebSocket chat connection
    const wsChat = useWebSocketChat(chatRoom, userProfile?.displayName || 'Guest', {
        enabled: activeTab === 'chat' && !!userProfile,
    });

    // Firebase fallback chat subscription (used when WS is disconnected)
    useEffect(() => {
        if (activeTab === 'chat' && !wsChat.connected) {
            const unsub = subscribeToChatMessages(chatRoom, msgs => {
                setChatMessages(msgs);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            });
            return () => unsub();
        }
    }, [activeTab, chatRoom, wsChat.connected]);

    // Auto-scroll on new WS messages
    useEffect(() => {
        if (wsChat.messages.length > 0) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [wsChat.messages.length]);

    // Discussions subscription
    useEffect(() => {
        if (activeTab === 'discussions') {
            const unsub = subscribeToCommunityPosts(posts => setDiscussions(posts));
            return () => unsub();
        }
    }, [activeTab]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setCharacters([]);
            return;
        }
        const fetchChars = async () => {
            try {
                setLoading(true);
                setClaimError('');
                const data = await jikanAPI.searchCharacters(debouncedQuery);
                setCharacters(data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchChars();
    }, [debouncedQuery]);

    const searchCharacters = () => { /* Now handled by debounced effect */ };

    const handleClaim = async (character) => {
        if (!userProfile) { openAuthModal('Sign in to claim a character identity'); return; }
        setClaimLoading(true);
        setClaimError('');
        setClaimSuccess('');
        try {
            await claimCharacter(userProfile.id, userProfile.displayName, character);
            setClaimSuccess(`You are now ${character.name}!`);
            setShowClaimFlow(false);
            setCharacters([]);
            setSearchQuery('');
        } catch (err) {
            setClaimError(err.message || 'Failed to claim character');
        } finally {
            setClaimLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !userProfile) return;
        
        // Try WebSocket first, fallback to Firebase
        if (wsChat.connected) {
            wsChat.sendMessage(chatInput.trim());
        } else {
            await sendChatMessage(userProfile.id || 'anonymous', userProfile.displayName || 'Anonymous', userProfile.rank || 'User', chatInput.trim(), chatRoom);
        }
        setChatInput('');
    };

    return (
        <div className="min-h-screen pt-24 pb-24 md:pb-8 bg-[#050505]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        Community <span className="text-[#b76e79]">Hub</span>
                    </h1>
                    <p className="text-[#555] text-sm mb-6">Claim your anime identity, join discussions, and connect with fans.</p>

                    {/* Stats Row */}
                    <div className="flex gap-3 flex-wrap">
                        <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                            <Shield size={14} className="text-emerald-400" />
                            <span className="text-white text-sm font-semibold">{allClaims.length}</span>
                            <span className="text-[#555] text-xs">Identities</span>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                            <MessageCircle size={14} className="text-blue-400" />
                            <span className="text-white text-sm font-semibold">{discussions.length}</span>
                            <span className="text-[#555] text-xs">Discussions</span>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                            <Users size={14} className="text-amber-400" />
                            <span className="text-white text-sm font-semibold">{chatMessages.length}</span>
                            <span className="text-[#555] text-xs">Messages</span>
                        </div>
                    </div>
                </div>

                {/* Your Identity Banner */}
                {userProfile && userClaim && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] flex items-center gap-4"
                    >
                        <img src={userClaim.characterImage} alt="" className="w-12 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-emerald-400/60 font-semibold uppercase tracking-wider">Your Identity</p>
                            <h3 className="text-white font-bold text-sm">{userClaim.characterName}</h3>
                            <p className="text-[#555] text-[11px]">from {userClaim.animeName}</p>
                        </div>
                        <button
                            onClick={() => setShowClaimFlow(true)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#888] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                        >
                            Change
                        </button>
                    </motion.div>
                )}

                {/* Tab bar */}
                <div className="flex gap-1 mb-6 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-white/[0.08] text-white'
                                    : 'text-[#555] hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                            <tab.icon size={15} /> {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                {/* ══ IDENTITIES TAB ══ */}
                {activeTab === 'identities' && (
                    <motion.div
                        key="identities"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    >
                        {/* Claim Flow */}
                        {(!userClaim || showClaimFlow) && (
                            <div className="mb-8 p-6 rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
                                <h3 className="text-white font-bold text-lg mb-1">
                                    {userClaim ? 'Change Your Identity' : 'Claim Your Identity'}
                                </h3>
                                <p className="text-[#555] text-sm mb-4">
                                    Search for an anime character to represent you. Each character can only be claimed by one user.
                                </p>

                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} zIndex={20}/>
                                        <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-[#444] pointer-events-none truncate select-none z-0">
                                            {searchQuery && characters.length > 0 && characters[0].name.toLowerCase().startsWith(searchQuery.toLowerCase())
                                                ? searchQuery + characters[0].name.slice(searchQuery.length)
                                                : ''}
                                        </div>
                                        <input type="text" placeholder="Search characters (e.g. Gojo, Naruto, Levi)..."
                                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Tab' && characters.length > 0 && characters[0].name.toLowerCase().startsWith(searchQuery.toLowerCase())) {
                                                    e.preventDefault();
                                                    setSearchQuery(characters[0].name);
                                                }
                                            }}
                                            className="w-full relative z-10 pl-9 pr-4 py-2.5 rounded-xl text-sm text-white bg-transparent border border-white/[0.06] focus:border-white/[0.12] focus:outline-none placeholder-[#444]"
                                        />
                                        <div className="absolute inset-0 bg-white/[0.03] rounded-xl pointer-events-none z-0"></div>
                                    </div>
                                </div>

                                {claimError && (
                                    <div className="mb-4 p-3 rounded-xl text-xs text-red-400 bg-red-500/[0.06] border border-red-500/20 flex items-center gap-2">
                                        <AlertCircle size={14} /> {claimError}
                                    </div>
                                )}
                                {claimSuccess && (
                                    <div className="mb-4 p-3 rounded-xl text-xs text-emerald-400 bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center gap-2">
                                        <Check size={14} /> {claimSuccess}
                                    </div>
                                )}

                                {loading && (
                                    <div className="flex justify-center py-12">
                                        <Loader2 size={28} className="animate-spin text-[#b76e79]" />
                                    </div>
                                )}

                                {!loading && characters.length > 0 && (
                                    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {characters.map(char => (
                                            <SearchCharacterCard
                                                key={char.mal_id}
                                                character={char}
                                                onClaim={handleClaim}
                                                claimStatus={claimedIds.has(String(char.mal_id)) ? 'claimed' : 'available'}
                                                loading={claimLoading}
                                            />
                                        ))}
                                    </motion.div>
                                )}

                                {!loading && debouncedQuery.trim() && characters.length === 0 && !claimError && (
                                    <div className="text-center py-12">
                                        <p className="text-[#555] text-sm">No characters found for "{debouncedQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CTA for non-logged-in users */}
                        {!userProfile && !userClaim && (
                            <div className="mb-8 p-5 rounded-xl border border-white/[0.06] bg-[#0a0a0a] text-center">
                                <User size={32} className="mx-auto mb-3 text-[#333]" />
                                <p className="text-[#888] text-sm mb-3">Sign in to claim your anime identity</p>
                                <button onClick={() => openAuthModal('Sign in to claim a character')}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] transition-colors">
                                    Sign In
                                </button>
                            </div>
                        )}

                        {/* Members Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold text-sm">
                                    Registered Identities
                                    <span className="ml-2 text-[11px] text-[#444] font-normal">({allClaims.length})</span>
                                </h3>
                            </div>

                            {allClaims.length === 0 ? (
                                <div className="text-center py-16">
                                    <Shield size={40} className="mx-auto mb-3 text-[#222]" />
                                    <p className="text-[#555] text-sm">No identities claimed yet. Be the first!</p>
                                </div>
                            ) : (
                                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    {allClaims.map(claim => (
                                        <ClaimedMemberCard key={claim.id} claim={claim} />
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ══ DISCUSSIONS TAB ══ */}
                {activeTab === 'discussions' && (
                    <motion.div
                        key="discussions"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-white font-bold">Latest Discussions</h3>
                            <button
                                onClick={() => userProfile ? setIsCreateModalOpen(true) : openAuthModal('Sign in to post')}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] transition-colors">
                                + New Thread
                            </button>
                        </div>
                        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2">
                            {discussions.length === 0
                                ? <div className="text-center py-16"><MessageCircle size={40} className="mx-auto mb-3 text-[#222]" /><p className="text-[#555] text-sm">No discussions yet. Start one!</p></div>
                                : discussions.map(thread => (
                                    <DiscussionThread key={thread.id} thread={thread} onLike={id => likeCommunityPost(id, userProfile?.id)} />
                                ))
                            }
                        </motion.div>
                        <AnimatePresence>
                            {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} userProfile={userProfile} />}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ══ LIVE CHAT TAB ══ */}
                {activeTab === 'chat' && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        {/* Room Selector */}
                        <div className="flex gap-2 mb-4 justify-center">
                            {[{id:'general', desc:'Open chat'}, {id:'powerscaling', desc:'Battleboard'}, {id:'recommendations', desc:'What to watch'}].map(room => (
                                <button key={room.id} onClick={() => setChatRoom(room.id)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${chatRoom === room.id
                                        ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                                        : 'text-[#555] bg-white/[0.02] border border-white/[0.05] hover:text-white hover:bg-white/[0.04]'
                                    }`}>
                                    #{room.id}
                                </button>
                            ))}
                        </div>

                        {/* Connection Status Bar */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    wsChat.connected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                                    : wsChat.connecting ? 'bg-yellow-400 animate-pulse'
                                    : 'bg-[#333]'
                                }`} />
                                <span className="text-[11px] text-[#555]">
                                    {wsChat.connected ? 'Live' : wsChat.connecting ? 'Connecting...' : 'Offline'}
                                </span>
                            </div>
                            {wsChat.onlineUsers.length > 0 && (
                                <span className="text-[11px] text-[#444]">
                                    <Users size={11} className="inline mr-1" />
                                    {wsChat.onlineUsers.length} online
                                </span>
                            )}
                        </div>

                        <div className="rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06]">
                            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                                {(() => {
                                    // Prefer WS messages when connected, otherwise Firebase
                                    const msgs = wsChat.connected && wsChat.messages.length > 0 ? wsChat.messages : chatMessages;
                                    if (msgs.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full text-[#333]">
                                                <MessageCircle size={40} className="mb-2" />
                                                <p className="text-sm">Start the conversation!</p>
                                            </div>
                                        );
                                    }
                                    return msgs.map((msg, idx) => {
                                        // Normalize field names (WS uses 'user'/'text', Firebase uses 'userName'/'message')
                                        const name = msg.user || msg.userName || 'Anonymous';
                                        const text = msg.text || msg.message || '';
                                        const rank = msg.userRank || '';
                                        const time = msg.timestamp?.toDate?.()?.toLocaleTimeString?.() || (typeof msg.timestamp === 'string' ? new Date(msg.timestamp).toLocaleTimeString() : 'now');
                                        const isSystem = msg.isSystem || msg.type === 'system';

                                        if (isSystem) {
                                            return (
                                                <div key={msg.id || idx} className="text-center text-[11px] text-[#444] py-1">
                                                    {text || msg.message}
                                                </div>
                                            );
                                        }

                                        return (
                                            <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 bg-[#b76e79] text-white">
                                                    {name.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-semibold text-sm text-[#b76e79]">{name}</span>
                                                        {rank && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#555]">{rank}</span>}
                                                        <span className="text-[10px] text-[#333]">{time}</span>
                                                    </div>
                                                    <p className="text-[#999] text-sm">{text}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    });
                                })()}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Typing indicator */}
                            {wsChat.typingUsers.length > 0 && (
                                <div className="px-4 py-1.5 border-t border-white/[0.03]">
                                    <span className="text-[11px] text-[#444] italic">
                                        {wsChat.typingUsers.join(', ')} {wsChat.typingUsers.length === 1 ? 'is' : 'are'} typing...
                                    </span>
                                </div>
                            )}

                            {/* Error banner */}
                            {wsChat.error && (
                                <div className="px-4 py-2 bg-[#b76e79]/10 border-t border-[#b76e79]/20">
                                    <p className="text-[12px] text-[#b76e79]">{wsChat.error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.04]">
                                <div className="flex gap-2">
                                    <input type="text" value={chatInput}
                                        onChange={e => { setChatInput(e.target.value); wsChat.sendTyping(); }}
                                        placeholder={userProfile ? 'Type a message...' : 'Sign in to chat'}
                                        disabled={!userProfile}
                                        className="flex-1 rounded-xl px-4 py-2.5 text-white placeholder-[#444] text-sm bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none disabled:opacity-40" />
                                    <button type="submit" disabled={!chatInput.trim() || !userProfile}
                                        className="px-4 py-2.5 rounded-xl text-white bg-[#b76e79] hover:bg-[#c48b9f] transition-colors disabled:opacity-40">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Community;
