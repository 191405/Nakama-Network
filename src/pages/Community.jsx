import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, Search, MessageCircle, Heart, BookOpen,
    ChevronRight, Star, Filter, Clock, TrendingUp,
    User, Flame, Shield, Sword, Eye, Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jikanAPI } from '../utils/animeDataAPIs';
import { sendChatMessage, subscribeToChatMessages, createCommunityPost, subscribeToCommunityPosts, likeCommunityPost } from '../utils/firebase';
import { Loader2, X } from 'lucide-react';

const CharacterCard = ({ character, onClick }) => {
    const image = character?.images?.jpg?.image_url || character?.images?.webp?.image_url;
    const animeName = character?.anime?.[0]?.anime?.title || 'Unknown';

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => onClick(character)}
            className="cursor-pointer rounded-xl overflow-hidden"
            style={{
                background: 'rgba(15, 15, 15, 0.95)',
                border: '1px solid rgba(202, 138, 4, 0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
        >
            <div className="relative aspect-[3/4]">
                <img
                    src={image}
                    alt={character?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x300/1a1a1a/eab308?text=Character';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {}
                {character?.favorites && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold bg-black/80 text-yellow-400 flex items-center gap-1">
                        <Heart size={10} fill="currentColor" />
                        {(character.favorites / 1000).toFixed(0)}K
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white text-sm line-clamp-1">{character?.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-1">{animeName}</p>
                </div>
            </div>
        </motion.div>
    );
};

const DiscussionThread = ({ thread, onLike }) => (
    <motion.div
        whileHover={{ x: 3, backgroundColor: 'rgba(234, 179, 8, 0.03)' }}
        className="p-4 rounded-xl transition-all cursor-pointer"
        style={{
            background: 'rgba(15, 15, 15, 0.9)',
            border: '1px solid rgba(202, 138, 4, 0.1)'
        }}
    >
        <div className="flex gap-3">
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#000' }}
            >
                {thread.author?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white text-sm line-clamp-2">{thread.title}</h4>
                    <span className="text-xs text-slate-600 flex-shrink-0">{thread.time}</span>
                </div>
                <p className="text-slate-500 text-xs line-clamp-2 mt-1">{thread.preview}</p>
                <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                        <MessageCircle size={12} />
                        {thread.replies} replies
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onLike?.(thread.id); }}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors"
                    >
                        <Heart size={12} />
                        {thread.likes}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Eye size={12} />
                        {thread.views}
                    </span>
                </div>
                <div className="flex gap-2 mt-2">
                    {thread.tags?.map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const CharacterModal = ({ character, onClose }) => {
    if (!character) return null;

    const image = character?.images?.jpg?.image_url;
    const animes = character?.anime || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
                style={{
                    background: 'rgba(15, 15, 15, 0.98)',
                    border: '1px solid rgba(202, 138, 4, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <img
                        src={image}
                        alt={character.name}
                        className="w-full h-64 object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 -mt-16 relative z-10">
                    <h2 className="text-3xl font-black text-white mb-2">{character.name}</h2>
                    {character.name_kanji && (
                        <p className="text-slate-400 text-lg mb-4">{character.name_kanji}</p>
                    )}

                    <div className="flex gap-4 mb-6">
                        <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                            <div className="text-2xl font-bold text-yellow-400">{(character.favorites / 1000).toFixed(1)}K</div>
                            <div className="text-xs text-slate-500">Favorites</div>
                        </div>
                        <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                            <div className="text-2xl font-bold text-yellow-400">{animes.length}</div>
                            <div className="text-xs text-slate-500">Appearances</div>
                        </div>
                    </div>

                    {character.about && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <BookOpen size={18} className="text-yellow-400" />
                                About
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                                {character.about?.slice(0, 800)}
                                {character.about?.length > 800 && '...'}
                            </p>
                        </div>
                    )}

                    {animes.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Star size={18} className="text-yellow-400" />
                                Anime Appearances
                            </h3>
                            <div className="space-y-2">
                                {animes.slice(0, 5).map((entry, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-lg"
                                        style={{ background: 'rgba(0,0,0,0.3)' }}
                                    >
                                        <img
                                            src={entry.anime?.images?.jpg?.image_url}
                                            alt={entry.anime?.title}
                                            className="w-12 h-16 rounded object-cover"
                                        />
                                        <div>
                                            <p className="text-white text-sm font-medium">{entry.anime?.title}</p>
                                            <p className="text-slate-500 text-xs">{entry.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

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
            await createCommunityPost(
                userProfile.id,
                userProfile.displayName,
                userProfile.rank,
                userProfile.photoURL,
                title.trim(),
                content.trim(),
                tags.split(',').map(t => t.trim()).filter(t => t)
            );
            onClose();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl rounded-2xl p-6"
                style={{
                    background: 'rgba(15, 15, 15, 0.98)',
                    border: '1px solid rgba(202, 138, 4, 0.2)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Start a Discussion</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-500"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-500 h-40 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={e => setTags(e.target.value)}
                            placeholder="anime, discussion, theory"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !title.trim() || !content.trim()}
                        className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-500 to-amber-500 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Post Discussion'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

const Community = () => {
    const { userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('wiki');
    const [characters, setCharacters] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [page, setPage] = useState(1);

    const tabs = [
        { id: 'wiki', label: 'Character Wiki', icon: BookOpen },
        { id: 'discussions', label: 'Discussions', icon: MessageCircle },
        { id: 'chat', label: 'Live Chat', icon: Users },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
    ];

    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatRoom, setChatRoom] = useState('general');
    const chatEndRef = React.useRef(null);

    useEffect(() => {
        if (activeTab === 'chat') {
            const unsubscribe = subscribeToChatMessages(chatRoom, (messages) => {
                setChatMessages(messages);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            });
            return () => unsubscribe();
        }
    }, [activeTab, chatRoom]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !userProfile) return;
        await sendChatMessage(
            userProfile.id || 'anonymous',
            userProfile.displayName || 'Anonymous',
            userProfile.rank || 'User',
            chatInput.trim(),
            chatRoom
        );
        setChatInput('');
    };

    const [discussions, setDiscussions] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 'discussions') {
            const unsubscribe = subscribeToCommunityPosts((posts) => {
                setDiscussions(posts);
            });
            return () => unsubscribe();
        }
    }, [activeTab]);

    useEffect(() => {
        loadCharacters();
    }, [page]);

    const loadCharacters = async () => {
        try {
            setLoading(true);
            const data = await jikanAPI.getTopCharacters(25);
            setCharacters(data || []);
        } catch (error) {
            console.error('Failed to load characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadCharacters();
            return;
        }

        try {
            setLoading(true);
            const data = await jikanAPI.searchCharacters(searchQuery);
            setCharacters(data || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCharacterClick = async (character) => {
        try {
            const fullData = await jikanAPI.getCharacterById(character.mal_id);
            setSelectedCharacter(fullData || character);
        } catch (error) {
            setSelectedCharacter(character);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20">
            <div className="max-w-7xl mx-auto">

                {}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-black mb-4">
                        <span style={{ color: '#eab308', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Community</span>
                        {' '}
                        <span style={{ color: '#e2e8f0', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Hub</span>
                    </h1>
                    <p className="text-slate-500">Wiki, Discussions & Everything Anime</p>
                </div>

                {}
                <div className="flex justify-center mb-8">
                    <div
                        className="rounded-xl p-1 inline-flex gap-1"
                        style={{ background: 'rgba(15,15,15,0.9)', border: '1px solid rgba(202, 138, 4, 0.2)' }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${activeTab === tab.id ? 'text-black' : 'text-slate-400 hover:text-yellow-400'
                                    }`}
                                style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #eab308, #ca8a04)' } : {}}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {}
                {activeTab === 'wiki' && (
                    <div>
                        {}
                        <div className="mb-8">
                            <div
                                className="flex gap-2 max-w-xl mx-auto"
                            >
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search characters..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl outline-none text-white placeholder-slate-500"
                                        style={{
                                            background: 'rgba(15, 15, 15, 0.9)',
                                            border: '1px solid rgba(202, 138, 4, 0.2)'
                                        }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSearch}
                                    className="px-6 py-3 rounded-xl font-bold text-black"
                                    style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                                >
                                    Search
                                </motion.button>
                            </div>
                        </div>

                        {}
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-10 h-10 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {characters.map((character) => (
                                    <CharacterCard
                                        key={character.mal_id}
                                        character={character}
                                        onClick={handleCharacterClick}
                                    />
                                ))}
                            </div>
                        )}

                        {characters.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <User size={64} className="mx-auto mb-4 text-slate-600" />
                                <p className="text-slate-500">No characters found. Try a different search.</p>
                            </div>
                        )}
                    </div>
                )}

                {}
                {activeTab === 'discussions' && (
                    <div>
                        {}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Latest Discussions</h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (userProfile?.canUseFeatures) {
                                        setIsCreateModalOpen(true);
                                    } else {
                                        alert('Please login to create a post!');
                                    }
                                }}
                                className="px-4 py-2 rounded-xl font-bold text-black text-sm"
                                style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                            >
                                + New Thread
                            </motion.button>
                        </div>

                        {}
                        <div className="space-y-3">
                            {discussions.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <p>No discussions yet. Be the first to start one!</p>
                                </div>
                            ) : (
                                discussions.map((thread) => (
                                    <DiscussionThread
                                        key={thread.id}
                                        thread={thread}
                                        onLike={(id) => likeCommunityPost(id, userProfile?.id)}
                                    />
                                ))
                            )}
                        </div>

                        {}
                        <AnimatePresence>
                            {isCreateModalOpen && (
                                <CreatePostModal
                                    onClose={() => setIsCreateModalOpen(false)}
                                    userProfile={userProfile}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {}
                {activeTab === 'chat' && (
                    <div className="max-w-3xl mx-auto">
                        {}
                        <div className="flex gap-2 mb-4 justify-center">
                            {['general', 'powerscaling', 'recommendations'].map((room) => (
                                <button
                                    key={room}
                                    onClick={() => setChatRoom(room)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${chatRoom === room
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    #{room}
                                </button>
                            ))}
                        </div>

                        {}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(15, 15, 15, 0.9)', border: '1px solid rgba(202, 138, 4, 0.15)' }}
                        >
                            <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                                {chatMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <MessageCircle size={48} className="mb-2 opacity-50" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#000' }}
                                            >
                                                {msg.userName?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-yellow-400 text-sm">{msg.userName}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-500">{msg.userRank}</span>
                                                    <span className="text-xs text-slate-600">
                                                        {msg.timestamp?.toDate?.()?.toLocaleTimeString?.() || 'just now'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm mt-1">{msg.message}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-yellow-500"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold disabled:opacity-50"
                                    >
                                        Send
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {}
                {activeTab === 'trending' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {}
                        <div
                            className="p-6 rounded-2xl"
                            style={{ background: 'rgba(15, 15, 15, 0.9)', border: '1px solid rgba(202, 138, 4, 0.15)' }}
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Crown className="text-yellow-400" size={20} />
                                Trending Characters
                            </h3>
                            <div className="space-y-3">
                                {characters.slice(0, 5).map((char, i) => (
                                    <div
                                        key={char.mal_id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-500/5 cursor-pointer transition-colors"
                                        onClick={() => handleCharacterClick(char)}
                                    >
                                        <span className="text-2xl font-black text-yellow-400 w-8">{i + 1}</span>
                                        <img
                                            src={char.images?.jpg?.image_url}
                                            alt={char.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{char.name}</p>
                                            <p className="text-slate-500 text-xs">{(char.favorites / 1000).toFixed(0)}K favorites</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {}
                        <div
                            className="p-6 rounded-2xl"
                            style={{ background: 'rgba(15, 15, 15, 0.9)', border: '1px solid rgba(202, 138, 4, 0.15)' }}
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Flame className="text-orange-400" size={20} />
                                Hot Discussions
                            </h3>
                            <div className="space-y-3">
                                {discussions.slice(0, 5).map((thread, i) => (
                                    <div
                                        key={thread.id}
                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-yellow-500/5 cursor-pointer transition-colors"
                                    >
                                        <span className="text-2xl font-black text-orange-400 w-8">{i + 1}</span>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium line-clamp-1">{thread.title}</p>
                                            <p className="text-slate-500 text-xs">{thread.replies} replies • {thread.views} views</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {}
                <AnimatePresence>
                    {selectedCharacter && (
                        <CharacterModal
                            character={selectedCharacter}
                            onClose={() => setSelectedCharacter(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default Community;
