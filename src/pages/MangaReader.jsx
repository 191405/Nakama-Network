import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2, List } from 'lucide-react';
import { mangaAPI } from '../utils/mangaAPI';

const MangaReader = () => {
    const { id, chapterId } = useParams();
    const navigate = useNavigate();
    
    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id, chapterId]);

    const loadData = async () => {
        setLoading(true);
        window.scrollTo(0, 0);
        try {
            const mData = await mangaAPI.getSeries(id);
            setManga(mData);

            const cData = await mangaAPI.getChapters(id);
            setChapters(cData);

            if (chapterId) {
                const chapter = await mangaAPI.getChapter(chapterId);
                // Ensure pages are sorted by pageNumber
                if (chapter.pages) {
                    chapter.pages.sort((a, b) => a.pageNumber - b.pageNumber);
                }
                setActiveChapter(chapter);
            } else {
                setActiveChapter(null);
            }
        } catch (e) {
            toast.error('Failed to load manga');
            navigate('/manga');
        }
        setLoading(false);
    };

    const navigateChapter = (direction) => {
        if (!activeChapter || chapters.length === 0) return;
        const currentIndex = chapters.findIndex(c => c.id === activeChapter.id);
        const nextIndex = currentIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < chapters.length) {
            navigate(`/manga/${id}/${chapters[nextIndex].id}`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#b76e79]" />
        </div>
    );

    if (!manga) return null;

    // ─── 1. MANGA OVERVIEW (No chapter selected) ───
    if (!chapterId || !activeChapter) {
        return (
            <div className="min-h-screen bg-[#050505] pt-24 pb-16">
                <div className="max-w-[1000px] mx-auto px-4 md:px-8">
                    <button onClick={() => navigate('/manga')} className="flex items-center gap-2 text-[#666] hover:text-white transition-colors text-sm mb-8">
                        <ArrowLeft size={16} /> Back to Hub
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        {/* Cover */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06] shadow-2xl relative">
                                {manga.coverUrl ? (
                                    <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BookOpen size={48} className="text-[#333]" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest leading-none">
                                    {manga.genre}
                                </div>
                            </div>
                            
                            {chapters.length > 0 && (
                                <button onClick={() => navigate(`/manga/${id}/${chapters[0].id}`)} 
                                    className="w-full mt-4 py-3.5 bg-[#b76e79] hover:bg-[#f26065] text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(183,110,121,0.2)]">
                                    Read Chapter 1
                                </button>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                                {manga.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#888]">
                                <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{manga.views} Views</span>
                                <span>{chapters.length} Chapters</span>
                                <span>Status: <span className="text-[#b76e79] font-medium">{manga.status}</span></span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Synopsis</h3>
                                <p className="text-[#aaa] leading-relaxed">{manga.synopsis}</p>
                            </div>

                            {/* Chapter List */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                    <List size={18} className="text-[#b76e79]" /> Chapters
                                </h3>
                                
                                {chapters.length === 0 ? (
                                    <div className="p-6 text-center bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-[#666]">
                                        No chapters published yet.
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {chapters.map((ch, idx) => (
                                            <button key={ch.id} onClick={() => navigate(`/manga/${id}/${ch.id}`)}
                                                className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.15] hover:bg-[#0e0e0e] rounded-xl transition-all group text-left">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-[#444] group-hover:text-[#b76e79] transition-colors w-8">
                                                        {ch.chapterNumber}
                                                    </span>
                                                    <div>
                                                        <div className="text-white font-medium group-hover:text-[#b76e79] transition-colors">{ch.title}</div>
                                                        <div className="text-xs text-[#666] mt-0.5">{ch.pages?.length || 0} Pages</div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-[#444] group-hover:text-white transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── 2. MANGA READER (Viewing a chapter) ───
    const currentIndex = chapters.findIndex(c => c.id === activeChapter.id);
    const hasNext = currentIndex < chapters.length - 1;
    const hasPrev = currentIndex > 0;

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col pt-[60px]">
            {/* Top Reader Navbar */}
            <div className="fixed top-[60px] left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/[0.06] shadow-xl py-3 px-4 flex justify-between items-center transition-transform">
                <button onClick={() => navigate(`/manga/${id}`)} className="flex items-center gap-2 text-[#888] hover:text-white text-sm">
                    <ArrowLeft size={16} /> <span className="hidden sm:inline">{manga.title}</span>
                </button>
                <div className="text-center font-bold text-white flex-1 mx-4 truncate">
                    Chapter {activeChapter.chapterNumber}: <span className="text-[#b76e79]">{activeChapter.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateChapter(-1)} disabled={!hasPrev} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => navigateChapter(1)} disabled={!hasNext} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Reader Space */}
            <div className="flex-1 max-w-[800px] w-full mx-auto pb-24 pt-16 flex flex-col">
                {(!activeChapter.pages || activeChapter.pages.length === 0) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#555] py-20">
                        <BookOpen size={48} className="mb-4 opacity-50" />
                        <p>No pages found in this chapter.</p>
                    </div>
                ) : (
                    activeChapter.pages.map((page, index) => (
                        <div key={index} className="w-full relative min-h-[500px] bg-[#0e0e0e] flex items-center justify-center">
                            {/* Simple Loader Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                                <Loader2 size={24} className="animate-spin text-[#333]" />
                            </div>
                            <img 
                                src={page.url} 
                                alt={`Page ${page.pageNumber}`} 
                                className="w-full h-auto relative z-10"
                                loading="lazy" 
                            />
                        </div>
                    ))
                )}

                {/* Bottom Navigation */}
                <div className="mt-12 flex items-center justify-between px-4">
                    <button onClick={() => navigateChapter(-1)} disabled={!hasPrev} 
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-0 text-white font-semibold transition-all">
                        <ChevronLeft size={20} /> Prev Chapter
                    </button>
                    <button onClick={() => navigateChapter(1)} disabled={!hasNext} 
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b76e79] hover:bg-[#f26065] disabled:opacity-0 text-white font-semibold transition-all">
                        Next Chapter <ChevronRight size={20} />
                    </button>
                </div>
                
                {!hasNext && activeChapter.pages?.length > 0 && (
                    <div className="text-center mt-12 text-[#666] italic">
                        You have caught up to the latest chapter!
                    </div>
                )}
            </div>
        </div>
    );
};

export default MangaReader;
