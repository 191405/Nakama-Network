import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  UploadCloud, Image as ImageIcon, X, ArrowLeft, Loader2, Save,
  Trash2, ChevronUp, ChevronDown, BookOpen, Layers, Eye, Clock, Plus
} from 'lucide-react';
import { mangaAPI } from '../utils/mangaAPI';
import Reveal from '../motion/Reveal';
import { modalContent, staggerContainer as makeStagger, staggerItem } from '../motion/motionPresets';
import { duration, ease } from '../motion/motionTokens';

const MangaUploader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [chapNum, setChapNum] = useState('');
  const [chapTitle, setChapTitle] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadMangaData();
  }, [id, user]);

  const loadMangaData = async () => {
    setLoading(true);
    try {
      const mData = await mangaAPI.getSeries(id);
      if (mData.authorId !== user.uid) {
        toast.error('You don\'t own this series');
        navigate('/manga');
        return;
      }
      setManga(mData);
      const cData = await mangaAPI.getChapters(id);
      setChapters(cData);
      setChapNum(String(cData.length + 1));
    } catch {
      toast.error('Failed to load series');
      navigate('/manga');
    }
    setLoading(false);
  };

  const onDrop = useCallback(acceptedFiles => {
    const images = acceptedFiles.filter(f => f.type.startsWith('image/'));
    if (images.length < acceptedFiles.length) toast('Non-image files were skipped', { icon: '⚠️' });
    setFiles(prev => [...prev, ...images]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const moveFile = (i, dir) => {
    if (i + dir < 0 || i + dir >= files.length) return;
    const next = [...files];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setFiles(next);
  };

  const handleUpload = async () => {
    if (!chapNum || !chapTitle.trim()) return toast.error('Chapter number and title required');
    if (files.length === 0) return toast.error('Add at least one page');

    setIsUploading(true);
    const tid = toast.loading(`Uploading ${files.length} pages...`);
    try {
      await mangaAPI.uploadChapter(id, { title: chapTitle, chapterNumber: chapNum }, files);
      toast.success('Chapter published', { id: tid });
      setShowUploadModal(false);
      setFiles([]); setChapTitle('');
      const cData = await mangaAPI.getChapters(id);
      setChapters(cData);
      setChapNum(String(cData.length + 1));
    } catch { toast.error('Upload failed', { id: tid }); }
    setIsUploading(false);
  };

  if (loading || !manga) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-[#b76e79]" />
    </div>
  );

  const totalPages = chapters.reduce((s, c) => s + (c.pages?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' } }} />

      {/* ─── HEADER ─── */}
      <div className="border-b border-white/[0.04] bg-[#050505]">
        <div className="max-w-[960px] mx-auto px-4 md:px-8 pt-24 pb-8">
          <button onClick={() => navigate('/manga')}
            className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-[12px] mb-6 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Hub
          </button>

          <div className="flex gap-5 items-start">
            {manga.coverUrl ? (
              <img src={manga.coverUrl} alt="" className="w-20 h-[106px] object-cover rounded-lg border border-white/[0.06] flex-shrink-0 shadow-lg" />
            ) : (
              <div className="w-20 h-[106px] rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0">
                <BookOpen size={20} className="text-[#222]" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-4 h-[1.5px] bg-[#b76e79]/60" />
                <span className="text-[9px] font-semibold text-[#b76e79]/80 uppercase tracking-[0.15em]">Workspace</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>{manga.title}</h1>
              <p className="text-[12px] text-[#555] line-clamp-1 mt-1 max-w-lg">{manga.synopsis || 'No synopsis'}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-[#666]">
                <span className="flex items-center gap-1.5"><Layers size={11} className="text-[#444]" />{chapters.length} chapters</span>
                <span className="flex items-center gap-1.5"><ImageIcon size={11} className="text-[#444]" />{totalPages} pages</span>
                <span className="flex items-center gap-1.5"><Eye size={11} className="text-[#444]" />{manga.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CHAPTERS ─── */}
      <div className="max-w-[960px] mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-semibold text-white flex items-center gap-2">
            Chapters
            <span className="text-[11px] font-normal text-[#444]">({chapters.length})</span>
          </h2>
          <button onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#b76e79] hover:bg-[#c48090] text-white rounded-lg text-[11px] font-semibold transition-colors shadow-[0_2px_10px_rgba(183,110,121,0.12)]">
            <Plus size={13} /> Add Chapter
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="flex flex-col items-center py-20 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
            <div className="w-14 h-14 rounded-xl bg-white/[0.03] flex items-center justify-center mb-4">
              <BookOpen size={22} className="text-[#222]" />
            </div>
            <p className="text-[13px] text-[#555] mb-1">No chapters yet</p>
            <p className="text-[11px] text-[#444]">Add your first chapter to start publishing.</p>
          </div>
        ) : (
          <motion.div variants={makeStagger('fast')} initial="hidden" animate="visible" className="space-y-2">
            {chapters.map(ch => (
              <motion.div key={ch.id} variants={staggerItem}
                className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] hover:bg-white/[0.03] transition-all group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[13px] font-bold text-[#555] group-hover:text-[#b76e79] transition-colors">
                    {ch.chapterNumber}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white/90">{ch.title}</div>
                    <div className="text-[10px] text-[#555] mt-0.5 flex items-center gap-3">
                      <span>{ch.pages?.length || 0} pages</span>
                      <span className="flex items-center gap-0.5"><Eye size={9} />{ch.views || 0}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate(`/manga/read/${manga.id}/${ch.id}`)}
                  className="text-[11px] font-medium text-[#666] hover:text-white px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors opacity-0 group-hover:opacity-100">
                  Read
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── UPLOAD MODAL ─── */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
            onClick={() => !isUploading && setShowUploadModal(false)}>
            <motion.div {...modalContent}
              className="w-full max-w-[780px] bg-[#0a0a0a] border border-white/[0.06] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[88vh]"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between bg-[#080808]">
                <div>
                  <h3 className="text-[14px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>New Chapter</h3>
                  <p className="text-[10px] text-[#555] mt-0.5">{manga.title}</p>
                </div>
                <button onClick={() => !isUploading && setShowUploadModal(false)} className="text-[#555] hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Inputs */}
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1.5 font-medium uppercase tracking-wider">Number</label>
                    <input type="number" value={chapNum} onChange={e => setChapNum(e.target.value)} disabled={isUploading}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5 text-white text-[13px] outline-none focus:border-white/[0.12] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1.5 font-medium uppercase tracking-wider">Title</label>
                    <input type="text" value={chapTitle} onChange={e => setChapTitle(e.target.value)} disabled={isUploading}
                      placeholder="e.g. The Beginning" 
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5 text-white text-[13px] outline-none focus:border-white/[0.12] placeholder-[#333] transition-colors" />
                  </div>
                </div>

                {/* Dropzone */}
                <div {...getRootProps()} className={`border border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer
                  ${isDragActive ? 'border-[#b76e79]/50 bg-[#b76e79]/[0.03]' : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.1]'}`}>
                  <input {...getInputProps()} disabled={isUploading} />
                  <UploadCloud size={32} className={`mb-3 ${isDragActive ? 'text-[#b76e79]' : 'text-[#333]'}`} />
                  <p className="text-[13px] text-white/80 font-medium mb-1">
                    {isDragActive ? 'Drop pages here' : 'Drag & drop manga pages'}
                  </p>
                  <p className="text-[10px] text-[#555]">JPG, PNG, WEBP — or click to browse</p>
                </div>

                {/* Page thumbnails */}
                {files.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-medium text-white">{files.length} pages</span>
                      <button onClick={() => setFiles([])} className="text-[10px] text-[#555] hover:text-red-400 transition-colors">Clear all</button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/[0.05] bg-[#080808]">
                          <div className="aspect-[3/4]">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          </div>

                          {/* Hover controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                            <div className="flex gap-1">
                              <button onClick={() => moveFile(idx, -1)} disabled={idx === 0}
                                className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-20 text-white transition-colors"><ChevronUp size={12} /></button>
                              <button onClick={() => moveFile(idx, 1)} disabled={idx === files.length - 1}
                                className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-20 text-white transition-colors"><ChevronDown size={12} /></button>
                            </div>
                            <button onClick={() => removeFile(idx)}
                              className="p-1 rounded bg-red-500/60 hover:bg-red-500 text-white transition-colors"><Trash2 size={12} /></button>
                          </div>

                          {/* Page number */}
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center">
                            <span className="text-[8px] font-mono text-white/50">{idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 border-t border-white/[0.04] bg-[#080808] flex justify-end gap-2.5">
                <button onClick={() => setShowUploadModal(false)} disabled={isUploading}
                  className="px-4 py-2 rounded-lg text-[11px] font-medium text-[#777] bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpload} disabled={isUploading || files.length === 0}
                  className="px-5 py-2 rounded-lg text-[11px] font-semibold text-white bg-[#b76e79] hover:bg-[#c48090] disabled:opacity-30 transition-all flex items-center gap-1.5 shadow-[0_2px_12px_rgba(183,110,121,0.15)]">
                  {isUploading ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : <><Save size={13} /> Publish</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MangaUploader;
