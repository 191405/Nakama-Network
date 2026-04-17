import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { UploadCloud, Image as ImageIcon, X, ArrowLeft, Plus, Loader2, Save, Trash2, GripVertical } from 'lucide-react';
import { mangaAPI } from '../utils/mangaAPI';

const MangaUploader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // New Chapter Form
    const [chapNum, setChapNum] = useState('');
    const [chapTitle, setChapTitle] = useState('');
    const [files, setFiles] = useState([]); // Array of File objects

    useEffect(() => {
        if (!user) return;
        loadMangaData();
    }, [id, user]);

    const loadMangaData = async () => {
        setLoading(true);
        try {
            const mData = await mangaAPI.getSeries(id);
            if (mData.authorId !== user.uid) {
                toast.error('Unauthorized access');
                navigate('/manga');
                return;
            }
            setManga(mData);
            
            const cData = await mangaAPI.getChapters(id);
            setChapters(cData);
            setChapNum(cData.length + 1); // Auto-suggest next chapter
        } catch (e) {
            toast.error('Failed to load project details');
            navigate('/manga');
        }
        setLoading(false);
    };

    const onDrop = useCallback(acceptedFiles => {
        // Only accept images
        const imageFiles = acceptedFiles.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length !== acceptedFiles.length) {
            toast.error('Some files were rejected. Images only.');
        }
        setFiles(prev => [...prev, ...imageFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Very simple move up/down for array
    const moveFile = (index, dir) => {
        if (index + dir < 0 || index + dir >= files.length) return;
        const newFiles = [...files];
        const temp = newFiles[index];
        newFiles[index] = newFiles[index + dir];
        newFiles[index + dir] = temp;
        setFiles(newFiles);
    };

    const handleUpload = async () => {
        if (!chapNum || !chapTitle.trim()) return toast.error('Chapter number and title are required');
        if (files.length === 0) return toast.error('Please add at least one page');

        setIsUploading(true);
        const toastId = toast.loading(`Uploading Chapter ${chapNum} (${files.length} pages)...`);
        
        try {
            await mangaAPI.uploadChapter(id, {
                title: chapTitle,
                chapterNumber: chapNum
            }, files);

            toast.success('Chapter published successfully!', { id: toastId });
            setShowUploadModal(false);
            setFiles([]);
            setChapTitle('');
            
            // Reload chapters
            const cData = await mangaAPI.getChapters(id);
            setChapters(cData);
            setChapNum(cData.length + 1);
        } catch (e) {
            toast.error('Phase upload failed', { id: toastId });
        }
        setIsUploading(false);
    };

    if (loading || !manga) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#b76e79]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] pt-20 pb-16">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' } }} />
            
            {/* Header */}
            <div className="border-b border-white/[0.06] bg-[#0a0a0a]">
                <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-6">
                    <button onClick={() => navigate('/manga')} className="flex items-center gap-2 text-[#666] hover:text-white transition-colors text-sm mb-4">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex gap-6 items-start">
                        {manga.coverUrl && (
                            <img src={manga.coverUrl} alt="Cover" className="w-24 h-32 object-cover rounded-xl border border-white/[0.06] flex-shrink-0 shadow-lg" />
                        )}
                        <div>
                            <span className="text-[10px] font-bold text-[#b76e79] uppercase tracking-widest bg-[#b76e79]/10 px-2 py-1 rounded-md border border-[#b76e79]/20 mb-2 inline-block">Manga Workspace</span>
                            <h1 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{manga.title}</h1>
                            <p className="text-sm text-[#888] line-clamp-2 max-w-2xl">{manga.synopsis}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapters List */}
            <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon size={18} className="text-[#555]" /> Published Chapters ({chapters.length})
                    </h2>
                    <button onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#b76e79] hover:bg-[#f26065] text-white rounded-xl text-sm font-semibold transition-colors">
                        <UploadCloud size={16} /> New Chapter
                    </button>
                </div>

                {chapters.length === 0 ? (
                    <div className="text-center py-20 border border-white/[0.06] border-dashed rounded-2xl bg-[#0a0a0a]">
                        <ImageIcon size={32} className="mx-auto mb-3 text-[#333]" />
                        <h3 className="text-white font-medium mb-1">No chapters yet</h3>
                        <p className="text-sm text-[#555]">Add your first chapter to begin publishing.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {chapters.map(ch => (
                            <div key={ch.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center font-bold text-[#b76e79]">
                                        {ch.chapterNumber}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white text-sm">{ch.title}</div>
                                        <div className="text-xs text-[#666] mt-0.5">{ch.pages?.length || 0} Pages · {ch.views} Views</div>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/manga/read/${manga.id}/${ch.id}`)} className="text-sm font-medium text-[#888] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-4 py-1.5 rounded-lg border border-white/[0.04] transition-colors">
                                    Read
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-4xl bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between font-bold text-white bg-[#0e0e0e]">
                            <span>Upload New Chapter</span>
                            <button onClick={() => !isUploading && setShowUploadModal(false)} className="text-[#666] hover:text-white"><X size={18} /></button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-[#666] block mb-1.5 tracking-wider uppercase">Chapter Number</label>
                                    <input type="number" value={chapNum} onChange={e => setChapNum(e.target.value)} disabled={isUploading}
                                        className="w-full bg-[#050505] border border-white/[0.06] focus:border-[#b76e79] rounded-xl px-4 py-2.5 text-white outline-none" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-[#666] block mb-1.5 tracking-wider uppercase">Chapter Title</label>
                                    <input type="text" value={chapTitle} onChange={e => setChapTitle(e.target.value)} disabled={isUploading}
                                        placeholder="e.g. The Beginning"
                                        className="w-full bg-[#050505] border border-white/[0.06] focus:border-[#b76e79] rounded-xl px-4 py-2.5 text-white outline-none" />
                                </div>
                            </div>

                            {/* Dropzone */}
                            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer text-center
                                ${isDragActive ? 'border-[#b76e79] bg-[#b76e79]/5' : 'border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                <input {...getInputProps()} disabled={isUploading} />
                                <UploadCloud size={40} className={`mb-3 ${isDragActive ? 'text-[#b76e79]' : 'text-[#444]'}`} />
                                <p className="text-white font-medium mb-1">Drag & Drop manga pages here</p>
                                <p className="text-xs text-[#666]">Supports JPG, PNG, WEBP (Files are ordered automatically)</p>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3 text-sm font-bold text-white">
                                        <span>Pages Sequence ({files.length})</span>
                                        <span className="text-xs font-normal text-[#666]">Use arrows to reorder</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="relative group bg-[#050505] border border-white/[0.06] rounded-xl p-2 pb-0 flex flex-col">
                                                <div className="aspect-[3/4] relative rounded-lg overflow-hidden mb-2 bg-[#111]">
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
                                                    
                                                    {/* Overlays */}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                        <div className="flex justify-between">
                                                            <button onClick={(e) => { e.stopPropagation(); moveFile(idx, -1); }} disabled={idx===0} className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-black disabled:opacity-30"><GripVertical size={14} className="-rotate-90"/></button>
                                                            <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white"><Trash2 size={14}/></button>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); moveFile(idx, 1); }} disabled={idx===files.length-1} className="w-fit p-1 rounded bg-white/20 hover:bg-white text-white hover:text-black disabled:opacity-30"><GripVertical size={14} className="-rotate-90"/></button>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-center text-[#888] font-mono truncate pb-2">Page {idx + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/[0.06] bg-[#0e0e0e] flex justify-end gap-3">
                            <button onClick={() => setShowUploadModal(false)} disabled={isUploading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#888] hover:bg-white/[0.05] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleUpload} disabled={isUploading || files.length === 0} 
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#b76e79] to-[#f26065] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2 shadow-lg">
                                {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Save size={16} /> Publish Chapter</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MangaUploader;
