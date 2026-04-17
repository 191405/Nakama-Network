import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2,
  List, Eye, Layers, Clock, User, Star
} from 'lucide-react';
import { mangaAPI } from '../utils/mangaAPI';
import Reveal from '../motion/Reveal';
import { staggerContainer as makeStagger, staggerItem, heroText } from '../motion/motionPresets';
import { duration, ease } from '../motion/motionTokens';

const MangaReader = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({});

  useEffect(() => { loadData(); }, [id, chapterId]);

  const loadData = async () => {
    setLoading(true);
    window.scrollTo(0, 0);
    setImagesLoaded({});
    try {
      const mData = await mangaAPI.getSeries(id);
      setManga(mData);
      const cData = await mangaAPI.getChapters(id);
      setChapters(cData);
      if (chapterId) {
        const chapter = await mangaAPI.getChapter(chapterId);
        if (chapter.pages) chapter.pages.sort((a, b) => a.pageNumber - b.pageNumber);
        setActiveChapter(chapter);
      } else {
        setActiveChapter(null);
      }
    } catch {
      toast.error('Failed to load');
      navigate('/manga');
    }
    setLoading(false);
  };

  const navigateChapter = (dir) => {
    if (!activeChapter || !chapters.length) return;
    const idx = chapters.findIndex(c => c.id === activeChapter.id);
    const next = idx + dir;
    if (next >= 0 && next < chapters.length) navigate(`/manga/read/${id}/${chapters[next].id}`);
  };

  const onImageLoad = useCallback((pageNum) => {
    setImagesLoaded(prev => ({ ...prev, [pageNum]: true }));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={20} className="animate-spin text-[#b76e79]" />
        <span className="text-[11px] text-[#444]">Loading...</span>
      </div>
    </div>
  );

  if (!manga) return null;

  /* ════════════════════════════════════════════════
     OVERVIEW — no chapter selected
     ════════════════════════════════════════════════ */
  if (!chapterId || !activeChapter) {
    const totalPages = chapters.reduce((s, c) => s + (c.pages?.length || 0), 0);

    return (
      <div className="min-h-screen bg-[#050505]">
        {/* Ambient cover bg (blurred) */}
        {manga.coverUrl && (
          <div className="absolute top-0 left-0 right-0 h-[420px] overflow-hidden pointer-events-none">
            <img src={manga.coverUrl} alt="" className="w-full h-full object-cover opacity-[0.07] blur-2xl scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
          </div>
        )}

        <div className="relative z-10 max-w-[960px] mx-auto px-4 md:px-8 pt-24 pb-16">
          <button onClick={() => navigate('/manga')}
            className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-[12px] mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Hub
          </button>

          <div className="flex flex-col md:flex-row gap-8 mb-12">
            {/* Cover */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: ease.emphasized }}
              className="w-full md:w-[220px] flex-shrink-0">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06] relative shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                {manga.coverUrl ? (
                  <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0e0e0e] to-[#080808]">
                    <BookOpen size={40} className="text-[#1a1a1a]" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-[3px] rounded-md border border-white/[0.08] text-[9px] font-bold text-white/70 uppercase tracking-widest">
                  {manga.genre}
                </div>
                {manga.status === 'Ongoing' && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                )}
              </div>

              {chapters.length > 0 && (
                <button onClick={() => navigate(`/manga/read/${id}/${chapters[0].id}`)}
                  className="w-full mt-4 py-3 bg-[#b76e79] hover:bg-[#c48090] text-white rounded-xl font-semibold text-[13px] transition-colors shadow-[0_4px_16px_rgba(183,110,121,0.15)] flex items-center justify-center gap-2">
                  <BookOpen size={15} /> Start Reading
                </button>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, delay: 0.1, ease: ease.emphasized }}
              className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-[1.5px] bg-[#b76e79]/60" />
                <span className="text-[9px] font-semibold text-[#b76e79]/80 uppercase tracking-[0.15em]">
                  {manga.status || 'Ongoing'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                {manga.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {[
                  { icon: Eye, label: `${(manga.views || 0).toLocaleString()} views` },
                  { icon: Layers, label: `${chapters.length} chapters` },
                  { icon: List, label: `${totalPages} pages` },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#666] bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                    <m.icon size={11} className="text-[#555]" /> {m.label}
                  </div>
                ))}
              </div>

              {/* Synopsis */}
              {manga.synopsis && (
                <div className="mb-8">
                  <h3 className="text-[13px] font-semibold text-[#888] mb-2 uppercase tracking-wider">Synopsis</h3>
                  <p className="text-[14px] text-[#999] leading-[1.7]">{manga.synopsis}</p>
                </div>
              )}

              {/* Chapter list */}
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-4 flex items-center gap-2">
                  <List size={14} className="text-[#b76e79]" /> Chapters
                </h3>

                {chapters.length === 0 ? (
                  <div className="p-8 text-center bg-white/[0.01] border border-white/[0.04] rounded-xl">
                    <p className="text-[12px] text-[#555]">No chapters published yet.</p>
                  </div>
                ) : (
                  <motion.div variants={makeStagger('fast')} initial="hidden" animate="visible" className="space-y-1.5">
                    {chapters.map((ch) => (
                      <motion.button key={ch.id} variants={staggerItem} onClick={() => navigate(`/manga/read/${id}/${ch.id}`)}
                        className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] rounded-xl transition-all group text-left">
                        <div className="flex items-center gap-3.5">
                          <span className="text-[15px] font-bold text-[#333] group-hover:text-[#b76e79] transition-colors w-7 text-center tabular-nums">
                            {ch.chapterNumber}
                          </span>
                          <div>
                            <div className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">{ch.title}</div>
                            <div className="text-[10px] text-[#555] mt-0.5 flex items-center gap-2">
                              <span>{ch.pages?.length || 0} pages</span>
                              <span className="flex items-center gap-0.5"><Eye size={9} />{ch.views || 0}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-[#333] group-hover:text-white/50 transition-colors" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     READER — viewing a chapter
     ════════════════════════════════════════════════ */
  const currentIndex = chapters.findIndex(c => c.id === activeChapter.id);
  const hasNext = currentIndex < chapters.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col pt-[60px]">
      {/* Reader toolbar */}
      <div className="fixed top-[60px] left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.04] py-2.5 px-4">
        <div className="max-w-[800px] mx-auto flex justify-between items-center">
          <button onClick={() => navigate(`/manga/${id}`)} className="flex items-center gap-2 text-[#666] hover:text-white text-[12px] transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline truncate max-w-[120px]">{manga.title}</span>
          </button>

          <div className="text-center flex-1 mx-4">
            <div className="text-[12px] font-semibold text-white truncate">
              Ch. {activeChapter.chapterNumber}
              <span className="text-[#555] font-normal ml-1.5 hidden sm:inline">— {activeChapter.title}</span>
            </div>
            <div className="text-[9px] text-[#444] mt-0.5">
              {activeChapter.pages?.length || 0} pages
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => navigateChapter(-1)} disabled={!hasPrev}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-20 text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] text-[#555] tabular-nums min-w-[32px] text-center">
              {currentIndex + 1}/{chapters.length}
            </span>
            <button onClick={() => navigateChapter(1)} disabled={!hasNext}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-20 text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 max-w-[800px] w-full mx-auto pb-24 pt-14">
        {(!activeChapter.pages || activeChapter.pages.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-28 text-[#444]">
            <BookOpen size={36} className="mb-3 opacity-30" />
            <p className="text-[13px]">This chapter has no pages.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {activeChapter.pages.map((page, index) => (
              <div key={index} className="w-full relative bg-[#080808]" style={{ minHeight: imagesLoaded[page.pageNumber] ? 'auto' : '600px' }}>
                {/* Skeleton loader */}
                {!imagesLoaded[page.pageNumber] && (
                  <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={18} className="animate-spin text-[#222]" />
                      <span className="text-[9px] text-[#333] tabular-nums">{page.pageNumber}/{activeChapter.pages.length}</span>
                    </div>
                  </div>
                )}
                <motion.img
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-auto relative z-10"
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imagesLoaded[page.pageNumber] ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  onLoad={() => onImageLoad(page.pageNumber)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom nav */}
        {activeChapter.pages?.length > 0 && (
          <div className="mt-16 px-4">
            <div className="flex items-center justify-between py-6 border-t border-white/[0.04]">
              <button onClick={() => navigateChapter(-1)} disabled={!hasPrev}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-medium transition-all ${
                  hasPrev ? 'bg-white/[0.04] hover:bg-white/[0.08] text-white' : 'opacity-0 pointer-events-none'
                }`}>
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="text-center">
                <div className="text-[10px] text-[#444]">Chapter {activeChapter.chapterNumber}</div>
                <div className="text-[11px] text-[#666] font-medium">{activeChapter.title}</div>
              </div>

              <button onClick={() => navigateChapter(1)} disabled={!hasNext}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-medium transition-all ${
                  hasNext ? 'bg-[#b76e79] hover:bg-[#c48090] text-white shadow-[0_2px_12px_rgba(183,110,121,0.15)]' : 'opacity-0 pointer-events-none'
                }`}>
                Next <ChevronRight size={16} />
              </button>
            </div>

            {!hasNext && (
              <div className="text-center pb-8">
                <p className="text-[12px] text-[#555] mb-3">You're caught up.</p>
                <Link to={`/manga/${id}`} className="text-[11px] text-[#b76e79] hover:text-white transition-colors font-medium">
                  ← Back to series overview
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MangaReader;
