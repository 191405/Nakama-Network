import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { BookOpen, Plus, Loader2, ImagePlus, User, Feather, Search, AlertCircle, ChevronRight, Upload } from 'lucide-react';
import { mangaAPI } from '../utils/mangaAPI';

const MangaDashboard = () => {
    const { user, openAuthModal } = useAuth();
    const userId = user?.uid || 'guest';
    const navigate = useNavigate();
    
    const [view, setView] = useState('explore'); // 'explore' or 'my_works'
    const [allManga, setAllManga] = useState([]);
    const [myManga, setMyManga] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSynopsis, setNewSynopsis] = useState('');
    const [newGenre, setNewGenre] = useState('Action');
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadData();
    }, [userId, view]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (view === 'explore') {
                const data = await mangaAPI.getAllSeries();
                setAllManga(data);
            } else {
                if (userId === 'guest') return;
                const data = await mangaAPI.getUserSeries(userId);
                setMyManga(data);
            }
        } catch (e) {
            toast.error('Failed to load Manga');
        }
        setLoading(false);
    };

    const handleCoverSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCoverFile(e.target.files[0]);
            setCoverPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleCreateManga = async () => {
        if (!user || userId === 'guest') return openAuthModal();
        if (!newTitle.trim()) return toast.error('Title is required');
        
        setCreating(true);
        const toastId = toast.loading('Establishing Manga database...');
        try {
            const result = await mangaAPI.createSeries(userId, {
                title: newTitle,
                synopsis: newSynopsis,
                genre: newGenre
            }, coverFile);
            
            toast.success('Manga project initialized!', { id: toastId });
            setShowCreate(false);
            setNewTitle(''); setNewSynopsis(''); setCoverFile(null); setCoverPreview(null);
            setView('my_works');
            loadData();
        } catch (e) {
            toast.error('Failed to create manga', { id: toastId });
        }
        setCreating(false);
    };

    const displayedManga = view === 'explore' ? allManga : myManga;
    const filteredManga = displayedManga.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' } }} />
            
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-[#b76e79]" />
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                Manga Creators Hub
                            </h1>
                            <p className="text-sm text-[#666]">Publish, read, and explore original manga series</p>
                        </div>
                    </div>

                    <div className="flex items-center w-full md:w-auto gap-4">
                        <div className="relative flex-1 md:w-64 bg-[#0a0a0a] rounded-xl border border-white/[0.06]">
                            <Search size={14} className="text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search series..."
                                className="w-full bg-transparent text-white text-sm py-2 pl-9 pr-3 focus:outline-none placeholder-[#555]" />
                        </div>
                        <button onClick={() => {
                            if (!user || userId === 'guest') openAuthModal();
                            else setShowCreate(true);
                        }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b76e79] hover:bg-[#f26065] shadow-[0_0_15px_rgba(183,110,121,0.15)] text-white font-semibold text-sm transition-colors flex-shrink-0">
                            <Plus size={16} /> Create
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-6 border-b border-white/[0.06]">
                    <button onClick={() => setView('explore')} className={`pb-3 text-sm font-semibold transition-colors relative ${view === 'explore' ? 'text-white' : 'text-[#555] hover:text-[#bbb]'}`}>
                        Opus Explorer
                        {view === 'explore' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b76e79]" />}
                    </button>
                    <button onClick={() => {
                        if (!user || userId === 'guest') return openAuthModal();
                        setView('my_works');
                    }} className={`pb-3 text-sm font-semibold transition-colors relative ${view === 'my_works' ? 'text-white' : 'text-[#555] hover:text-[#bbb]'}`}>
                        My Works
                        {view === 'my_works' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b76e79]" />}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#b76e79]" /></div>
                ) : filteredManga.length === 0 ? (
                    <div className="text-center py-24 border border-white/[0.02] bg-[#0a0a0a] rounded-2xl">
                        <Feather size={40} className="mx-auto mb-3 text-[#333]" />
                        <h3 className="text-[17px] font-semibold text-white mb-1">No manga found</h3>
                        <p className="text-[14px] text-[#555]">
                            {view === 'my_works' ? "You haven't established any series yet." : "No published series match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {filteredManga.map((manga, i) => (
                            <motion.div key={manga.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                className="group cursor-pointer flex flex-col"
                                onClick={() => {
                                    if (view === 'my_works' || manga.authorId === userId) {
                                        navigate(`/manga/${manga.id}/upload`); // Go to upload manager
                                    } else {
                                        navigate(`/manga/${manga.id}`); // View details / read
                                    }
                                }}>
                                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#0e0e0e] border border-white/[0.06] mb-3 relative">
                                    {manga.coverUrl ? (
                                        <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#333]">
                                            <ImagePlus size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 uppercase tracking-widest">{manga.genre}</span>
                                        {view === 'my_works' && (
                                            <span className="bg-[#b76e79] text-white p-1.5 rounded-full"><Upload size={14} /></span>
                                        )}
                                    </div>
                                    
                                    {/* Unviewed indicator / Status */}
                                    <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                        {manga.chapterCount} Ch.
                                    </div>
                                </div>
                                <h3 className="text-[14px] font-bold text-white mb-1 line-clamp-1">{manga.title}</h3>
                                <div className="flex items-center gap-1.5 text-[#666] text-[12px]">
                                    <User size={12} className="text-[#b76e79]" />
                                    <span className="truncate">{manga.authorId === userId ? 'You' : 'Creator'}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Series Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0a0a] border border-white/[0.08] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                            onClick={e => e.stopPropagation()}>
                            
                            {/* Left: Cover Upload */}
                            <div className="w-full md:w-1/3 bg-[#0e0e0e] border-b md:border-b-0 md:border-r border-white/[0.06] p-6 flex flex-col items-center justify-center relative min-h-[250px]">
                                {coverPreview ? (
                                    <>
                                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover absolute inset-0 opacity-40 blur-sm" />
                                        <img src={coverPreview} alt="Cover" className="w-3/4 aspect-[2/3] object-cover rounded-xl border border-white/20 shadow-2xl relative z-10" />
                                        <button onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute text-xs bottom-4 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-white hover:bg-black transition-colors z-20">Change Cover</button>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mb-3 text-white">
                                            <ImagePlus size={24} />
                                        </div>
                                        <span className="text-sm font-semibold text-white">Cover Art</span>
                                        <span className="text-[11px] text-[#555] mt-1 text-center">Vertical aspect ratio recommended</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverSelect} />
                                    </label>
                                )}
                            </div>

                            {/* Right: Form */}
                            <div className="flex-1 p-6 flex flex-col">
                                <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>Establish Series</h2>
                                
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <label className="text-[12px] text-[#666] mb-1.5 block font-semibold">PROJECT TITLE</label>
                                        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter manga title..."
                                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#444] bg-[#050505] border border-white/[0.06] focus:border-[#b76e79] focus:outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] text-[#666] mb-1.5 block font-semibold">SYNOPSIS</label>
                                        <textarea value={newSynopsis} onChange={e => setNewSynopsis(e.target.value)} placeholder="What is this series about?" rows={3}
                                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#444] bg-[#050505] border border-white/[0.06] focus:border-[#b76e79] focus:outline-none resize-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] text-[#666] mb-1.5 block font-semibold">PRIMARY GENRE</label>
                                        <select value={newGenre} onChange={e => setNewGenre(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl text-sm text-white bg-[#050505] border border-white/[0.06] focus:border-[#b76e79] focus:outline-none appearance-none">
                                            {['Action', 'Fantasy', 'Romance', 'Sci-Fi', 'Horror', 'Slice of Life', 'Isekai', 'Thriller'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8 pt-4 border-t border-white/[0.06]">
                                    <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#888] bg-white/[0.04] hover:bg-white/[0.08] transition-colors">Abort</button>
                                    <button onClick={handleCreateManga} disabled={!newTitle.trim() || creating} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#b76e79] to-[#f26065] disabled:opacity-40 shadow-[0_4px_20px_rgba(183,110,121,0.2)] transition-opacity flex items-center justify-center gap-2">
                                        {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create Series'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MangaDashboard;
