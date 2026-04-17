import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  BookOpen, Plus, Loader2, ImagePlus, User, Feather,
  Search, ChevronRight, Upload, Eye, Layers, Star, Flame, Clock,
  TrendingUp, Filter, X
} from 'lucide-react';
import { mangaAPI } from '../utils/mangaAPI';
import Reveal from '../motion/Reveal';
import { staggerContainer as makeStagger, staggerItem, modalOverlay, modalContent } from '../motion/motionPresets';
import { duration, ease } from '../motion/motionTokens';

const GENRES = ['All', 'Action', 'Fantasy', 'Romance', 'Sci-Fi', 'Horror', 'Slice of Life', 'Isekai', 'Thriller', 'Comedy', 'Drama', 'Mystery'];

const MangaDashboard = () => {
  const { user, openAuthModal } = useAuth();
  const userId = user?.uid || 'guest';
  const navigate = useNavigate();

  const [view, setView] = useState('explore');
  const [allManga, setAllManga] = useState([]);
  const [myManga, setMyManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newGenre, setNewGenre] = useState('Action');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, [userId, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === 'explore') {
        const data = await mangaAPI.getAllSeries();
        setAllManga(data);
      } else {
        if (userId === 'guest') { setLoading(false); return; }
        const data = await mangaAPI.getUserSeries(userId);
        setMyManga(data);
      }
    } catch { toast.error('Failed to load manga'); }
    setLoading(false);
  };

  const handleCoverSelect = (e) => {
    if (e.target.files?.[0]) {
      setCoverFile(e.target.files[0]);
      setCoverPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreateManga = async () => {
    if (!user || userId === 'guest') return openAuthModal();
    if (!newTitle.trim()) return toast.error('Title is required');
    setCreating(true);
    const toastId = toast.loading('Creating series...');
    try {
      await mangaAPI.createSeries(userId, { title: newTitle, synopsis: newSynopsis, genre: newGenre }, coverFile);
      toast.success('Series created successfully', { id: toastId });
      setShowCreate(false);
      setNewTitle(''); setNewSynopsis(''); setCoverFile(null); setCoverPreview(null);
      setView('my_works');
      loadData();
    } catch { toast.error('Failed to create series', { id: toastId }); }
    setCreating(false);
  };

  const displayed = view === 'explore' ? allManga : myManga;
  const filtered = displayed.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'All' || m.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const totalChapters = displayed.reduce((s, m) => s + (m.chapterCount || 0), 0);
  const totalViews = displayed.reduce((s, m) => s + (m.views || 0), 0);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-body)', fontSize: '13px' } }} />

      {/* ─── HERO BANNER ─── */}
      <section className="relative pt-20 pb-14 overflow-hidden">
        {/* Ambient ink wash background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(183,110,121,0.06) 0%, transparent 70%)',
        }} />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pt-10">
          <motion.div initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: duration.cinematic, ease: ease.emphasized }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[2px] bg-[#b76e79]" />
              <span className="text-[10px] font-semibold text-[#b76e79] uppercase tracking-[0.2em]">Original Works</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Manga Hub
            </h1>
            <p className="text-[15px] text-[#666] max-w-lg leading-relaxed">
              Publish your manga, build an audience, and read works from creators around the world.
            </p>
          </motion.div>

          {/* ─── STATS ROW ─── */}
          {displayed.length > 0 && (
            <Reveal preset="fadeUp" delay={0.15} className="flex flex-wrap gap-6 mt-8 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/[0.04]"><Layers size={14} className="text-[#888]" /></div>
                <div>
                  <div className="text-white text-sm font-bold">{displayed.length}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wide">Series</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/[0.04]"><BookOpen size={14} className="text-[#888]" /></div>
                <div>
                  <div className="text-white text-sm font-bold">{totalChapters}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wide">Chapters</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/[0.04]"><Eye size={14} className="text-[#888]" /></div>
                <div>
                  <div className="text-white text-sm font-bold">{totalViews.toLocaleString()}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wide">Total views</div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ─── CONTROLS BAR ─── */}
      <div className="sticky top-[64px] z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.04]">
            {[
              { key: 'explore', label: 'Explore', icon: TrendingUp },
              { key: 'my_works', label: 'My Works', icon: Feather },
            ].map(tab => (
              <button key={tab.key} onClick={() => {
                if (tab.key === 'my_works' && (!user || userId === 'guest')) return openAuthModal();
                setView(tab.key);
              }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  view === tab.key
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-[#666] hover:text-[#aaa]'
                }`}>
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Filter + Create */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={13} className="text-[#444] absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/[0.03] border border-white/[0.05] text-white text-[12px] py-2 pl-8 pr-3 rounded-lg focus:outline-none focus:border-white/[0.12] placeholder-[#444] transition-colors" />
            </div>

            {/* Genre filter */}
            <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.05] text-[#999] text-[12px] py-2 px-3 rounded-lg focus:outline-none appearance-none cursor-pointer hover:border-white/[0.1] transition-colors">
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <button onClick={() => {
              if (!user || userId === 'guest') openAuthModal();
              else setShowCreate(true);
            }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#b76e79] hover:bg-[#c48090] text-white font-semibold text-[12px] transition-colors flex-shrink-0 shadow-[0_2px_12px_rgba(183,110,121,0.15)]">
              <Plus size={14} /> New Series
            </button>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[3/4] rounded-xl bg-white/[0.03]" />
                <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
                <div className="h-2 w-1/2 rounded bg-white/[0.03]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-28">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-5">
              <Feather size={28} className="text-[#2a2a2a]" />
            </div>
            <h3 className="text-[16px] font-semibold text-white mb-1.5">
              {view === 'my_works' ? 'No works yet' : 'Nothing found'}
            </h3>
            <p className="text-[13px] text-[#555] text-center max-w-sm mb-5">
              {view === 'my_works'
                ? 'Start publishing by creating your first series.'
                : searchQuery ? `No series match "${searchQuery}".` : 'No manga has been published yet. Be the first.'}
            </p>
            {view === 'my_works' && (
              <button onClick={() => setShowCreate(true)}
                className="text-[12px] font-semibold text-[#b76e79] hover:text-white transition-colors flex items-center gap-1.5">
                <Plus size={14} /> Create your first series
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={makeStagger('fast')} initial="hidden" animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filtered.map((manga) => (
              <motion.div key={manga.id} variants={staggerItem}
                className="group cursor-pointer flex flex-col"
                onClick={() => {
                  if (view === 'my_works' || manga.authorId === userId)
                    navigate(`/manga/${manga.id}/upload`);
                  else
                    navigate(`/manga/${manga.id}`);
                }}>

                {/* Cover */}
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.05] mb-2.5 relative motion-lift">
                  {manga.coverUrl ? (
                    <img src={manga.coverUrl} alt={manga.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0e0e0e] to-[#080808]">
                      <BookOpen size={28} className="text-[#1a1a1a]" />
                    </div>
                  )}

                  {/* Gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Chapter count pill */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-[3px] rounded-md border border-white/[0.08]">
                    <BookOpen size={9} className="text-white/50" />
                    <span className="text-[9px] font-semibold text-white/70">{manga.chapterCount || 0}</span>
                  </div>

                  {/* Status indicator */}
                  {manga.status === 'Ongoing' && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" title="Ongoing" />
                  )}

                  {/* Bottom info on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">{manga.genre}</span>
                      <div className="flex items-center gap-1 text-[9px] text-white/40">
                        <Eye size={9} /> {manga.views || 0}
                      </div>
                    </div>
                  </div>

                  {/* Upload badge for own works */}
                  {view === 'my_works' && (
                    <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1.5 rounded-full bg-[#b76e79] shadow-lg">
                        <Upload size={11} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Title & meta */}
                <h3 className="text-[13px] font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">{manga.title}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#555]">
                  <User size={10} className="text-[#b76e79]/60" />
                  <span>{manga.authorId === userId ? 'You' : 'Creator'}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── CREATE MODAL ─── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div {...modalOverlay} className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowCreate(false)}>
            <motion.div {...modalContent}
              className="bg-[#0a0a0a] border border-white/[0.07] w-full max-w-[640px] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}>

              {/* Cover pane */}
              <div className="w-full md:w-[220px] bg-[#080808] border-b md:border-b-0 md:border-r border-white/[0.05] flex flex-col items-center justify-center relative min-h-[240px] p-5">
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-lg" />
                    <img src={coverPreview} alt="" className="w-[85%] aspect-[2/3] object-cover rounded-xl border border-white/[0.15] shadow-2xl relative z-10" />
                    <button onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                      className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 text-white/60 hover:text-white transition-colors">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                    <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.08] flex items-center justify-center mb-3 group-hover:border-[#b76e79]/30 transition-colors">
                      <ImagePlus size={20} className="text-[#333] group-hover:text-[#b76e79]/60 transition-colors" />
                    </div>
                    <span className="text-[12px] font-medium text-[#666] group-hover:text-white/80 transition-colors">Upload cover</span>
                    <span className="text-[10px] text-[#444] mt-1">3:4 ratio ideal</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverSelect} />
                  </label>
                )}
              </div>

              {/* Form pane */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[17px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>New Series</h2>
                  <button onClick={() => setShowCreate(false)} className="text-[#555] hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[11px] text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Title</label>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Your manga title"
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white placeholder-[#333] bg-white/[0.03] border border-white/[0.06] focus:border-[#b76e79]/40 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Synopsis</label>
                    <textarea value={newSynopsis} onChange={e => setNewSynopsis(e.target.value)} placeholder="Brief description of your series" rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white placeholder-[#333] bg-white/[0.03] border border-white/[0.06] focus:border-[#b76e79]/40 focus:outline-none resize-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Genre</label>
                    <select value={newGenre} onChange={e => setNewGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white bg-white/[0.03] border border-white/[0.06] focus:border-[#b76e79]/40 focus:outline-none appearance-none cursor-pointer">
                      {GENRES.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6 pt-5 border-t border-white/[0.04]">
                  <button onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-lg text-[12px] font-medium text-[#777] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors">Cancel</button>
                  <button onClick={handleCreateManga} disabled={!newTitle.trim() || creating}
                    className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-white bg-[#b76e79] hover:bg-[#c48090] disabled:opacity-30 transition-all flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(183,110,121,0.15)]">
                    {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
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
