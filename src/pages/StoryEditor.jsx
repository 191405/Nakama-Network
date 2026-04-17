import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import {
    Feather, Plus, Loader2, Save, ChevronLeft, ChevronRight,
    PenTool, X, BookOpen, Scroll, ArrowRight,
    Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2,
    List, ListOrdered, Quote, Minus, RotateCcw, RotateCw, Type,
    AlignLeft, AlignCenter, AlignRight, Highlighter, Palette,
    FileText, Wand2, Trash2, Clock, Hash, Search
} from 'lucide-react';

// TipTap — Advanced Editor
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── API ─────────────────────────────────────────────────────────────────────
const storyAPI = {
    async createNovel(data) {
        const res = await fetch(`${API_BASE}/stories/novels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error('Failed to create novel');
        return res.json();
    },
    async listNovels(userId) {
        const res = await fetch(`${API_BASE}/stories/novels?user_id=${userId}`);
        if (!res.ok) throw new Error('Failed to load novels');
        return res.json();
    },
    async listChapters(novelId) {
        const res = await fetch(`${API_BASE}/stories/novels/${novelId}/chapters`);
        if (!res.ok) throw new Error('Failed to load chapters');
        return res.json();
    },
    async generateChapter(novelId, userPrompt, userId) {
        const res = await fetch(`${API_BASE}/stories/novels/${novelId}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_prompt: userPrompt, user_id: userId }) });
        if (!res.ok) throw new Error('Generation failed');
        return res.json();
    },
    async saveChapter(novelId, data) {
        const res = await fetch(`${API_BASE}/stories/novels/${novelId}/chapters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error('Failed to save');
        return res.json();
    },
    async getLore(novelId) {
        const res = await fetch(`${API_BASE}/stories/novels/${novelId}/lore`);
        return res.ok ? res.json() : [];
    },
    async deleteNovel(id, userId) {
        const res = await fetch(`${API_BASE}/stories/novels/${id}?user_id=${userId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        return res.json();
    }
};

const LORE_CATS = [
    { key: 'character', label: 'Characters' },
    { key: 'plot', label: 'Plot' },
    { key: 'world', label: 'World' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'relationship', label: 'Relations' },
];

// ─── Editor Toolbar ──────────────────────────────────────────────────────────
const EditorToolbar = ({ editor }) => {
    if (!editor) return null;

    const Btn = ({ onClick, active, children, title }) => (
        <button onClick={onClick} title={title}
            className={`p-1.5 rounded-md transition-colors ${active ? 'bg-white/[0.1] text-white' : 'text-[#555] hover:text-white hover:bg-white/[0.04]'}`}>
            {children}
        </button>
    );
    const Sep = () => <div className="w-px h-4 bg-white/[0.08] mx-1" />;

    return (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/[0.06] bg-[#080808] overflow-x-auto">
            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
                <Bold size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
                <Italic size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
                <UnderlineIcon size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
                <Highlighter size={14} />
            </Btn>
            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                <Heading1 size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                <Heading2 size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Body text">
                <Type size={14} />
            </Btn>
            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                <List size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                <ListOrdered size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                <Quote size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                <Minus size={14} />
            </Btn>
            <Sep />
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
                <AlignLeft size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
                <AlignCenter size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
                <AlignRight size={14} />
            </Btn>
            <Sep />
            <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
                <RotateCcw size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
                <RotateCw size={14} />
            </Btn>
        </div>
    );
};


// ═════════════════════════════════════════════════════════════════════════════
const StoryEditor = () => {
    const { user, openAuthModal } = useAuth();
    const userId = user?.uid || 'guest';
    const [searchQuery, setSearchQuery] = useState('');

    const [view, setView] = useState('library');
    const [novels, setNovels] = useState([]);
    const [activeNovel, setActiveNovel] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(null);

    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [showAssist, setShowAssist] = useState(false);

    const [lore, setLore] = useState([]);
    const [loreFilter, setLoreFilter] = useState(null);
    const [showLore, setShowLore] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSynopsis, setNewSynopsis] = useState('');
    const [newGenre, setNewGenre] = useState('Fantasy');
    const [newTone, setNewTone] = useState('dramatic');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // TipTap — full-featured editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Begin writing your story…' }),
            CharacterCount,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            Typography,
            TextStyle,
            Color,
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[60vh] px-8 py-6',
                style: "font-family: Georgia, 'Times New Roman', serif; font-size: 1.1rem; line-height: 1.9; color: #ccc;",
            },
        },
    });

    // ── Data loading ──────────────────────────────────────────────────────────
    const loadNovels = useCallback(async () => {
        if (!userId || userId === 'guest') return;
        setLoading(true);
        try {
            const data = await storyAPI.listNovels(userId);
            setNovels(Array.isArray(data) ? data : []);
        } catch (e) { toast.error('Could not load your stories'); }
        setLoading(false);
    }, [userId]);

    useEffect(() => { loadNovels(); }, [loadNovels]);

    const openNovel = async (novel) => {
        setActiveNovel(novel);
        setView('editor');
        setLoading(true);
        try {
            const [chapData, loreData] = await Promise.all([
                storyAPI.listChapters(novel.id), storyAPI.getLore(novel.id)
            ]);
            const chs = Array.isArray(chapData) ? chapData : [];
            setChapters(chs);
            setLore(Array.isArray(loreData) ? loreData : []);
            if (chs.length > 0) {
                const last = chs[chs.length - 1];
                setActiveChapter(last);
                editor?.commands.setContent(last.content || '');
            } else {
                setActiveChapter(null);
                editor?.commands.setContent('');
            }
        } catch (e) { toast.error('Failed to open novel'); }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!user || userId === 'guest') {
            openAuthModal();
            return;
        }
        if (!newTitle.trim()) return;
        const toastId = toast.loading('Creating novel…');
        try {
            const result = await storyAPI.createNovel({
                title: newTitle, synopsis: newSynopsis, genre: newGenre,
                tone: newTone, world_rules: '', user_id: userId
            });
            setShowCreate(false);
            setNewTitle(''); setNewSynopsis('');
            toast.success('Novel created', { id: toastId });
            await loadNovels();
            if (result.id) openNovel(result);
        } catch (e) { toast.error('Failed to create', { id: toastId }); }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || generating || !activeNovel) return;
        setGenerating(true);
        const toastId = toast.loading('Writing chapter…');
        try {
            const result = await storyAPI.generateChapter(activeNovel.id, prompt, userId);
            if (result.content) {
                editor?.commands.setContent(result.content);
                setActiveChapter(result);
                setPrompt('');
                const chapData = await storyAPI.listChapters(activeNovel.id);
                setChapters(Array.isArray(chapData) ? chapData : []);
                toast.success(`Chapter ${result.chapter_number} written`, { id: toastId });
                setTimeout(async () => {
                    const loreData = await storyAPI.getLore(activeNovel.id);
                    setLore(Array.isArray(loreData) ? loreData : []);
                }, 5000);
            } else {
                toast.error('No content returned', { id: toastId });
            }
        } catch (e) { toast.error('Chapter generation failed', { id: toastId }); }
        setGenerating(false);
    };

    const handleSave = async () => {
        const content = editor?.getHTML();
        if (!content?.trim() || !activeNovel) return;
        setSaving(true);
        try {
            const result = await storyAPI.saveChapter(activeNovel.id, { title: '', content, user_id: userId });
            const chapData = await storyAPI.listChapters(activeNovel.id);
            setChapters(Array.isArray(chapData) ? chapData : []);
            setActiveChapter(result);
            toast.success('Chapter saved');
        } catch (e) { toast.error('Failed to save'); }
        setSaving(false);
    };

    const handleDelete = async (novelId) => {
        if (!confirm('Delete this novel and all its chapters?')) return;
        try {
            await storyAPI.deleteNovel(novelId, userId);
            toast.success('Novel deleted');
            loadNovels();
        } catch (e) { toast.error('Failed to delete'); }
    };

    const selectChapter = (ch) => { setActiveChapter(ch); editor?.commands.setContent(ch.content || ''); };

    const wordCount = editor?.storage.characterCount?.words() || 0;
    const charCount = editor?.storage.characterCount?.characters() || 0;
    const filteredLore = loreFilter ? lore.filter(l => l.category === loreFilter) : lore;

    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Filter novels natively with grey suggestion prediction
    const filteredNovels = novels.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const predictiveHint = searchQuery && filteredNovels.length > 0
        ? filteredNovels[0].title.toLowerCase().startsWith(searchQuery.toLowerCase())
            ? searchQuery + filteredNovels[0].title.slice(searchQuery.length)
            : ''
        : '';
        
    // ═════════════════════════════════════════════════════════════════════════
    //  LIBRARY
    // ═════════════════════════════════════════════════════════════════════════
    if (view === 'library') {
        return (
            <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8">
                <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' } }} />
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Feather size={18} className="text-[#555]" />
                            <div>
                                <h1 className="text-lg font-bold text-white">Story Writer</h1>
                                <p className="text-[11px] text-[#444]">Write and publish web novels with continuity tracking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden sm:flex items-center w-64 bg-[#0a0a0a] rounded-xl border border-white/[0.06]">
                                <Search size={14} className="text-[#555] absolute left-3" />
                                <div className="absolute left-9 text-sm text-[#444] pointer-events-none truncate select-none">
                                    {predictiveHint}
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search stories..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab' && predictiveHint) {
                                            e.preventDefault();
                                            setSearchQuery(predictiveHint);
                                        }
                                    }}
                                    className="w-full bg-transparent text-white text-sm py-2 pl-9 pr-3 focus:outline-none relative z-10 placeholder-[#555]"
                                />
                            </div>
                            <button onClick={() => {
                                if (!user || userId === 'guest') {
                                    openAuthModal();
                                } else {
                                    setShowCreate(true);
                                }
                            }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b76e79] hover:bg-[#f26065] shadow-[0_0_15px_rgba(183,110,121,0.15)] text-white font-semibold text-sm transition-colors">
                                <Plus size={16} /> New Novel
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#555]" /></div>
                    ) : novels.length === 0 ? (
                        <div className="text-center py-24">
                            <BookOpen size={40} className="mx-auto mb-3 text-[#333]" />
                            <h3 className="text-[15px] font-semibold text-white mb-1">No stories yet</h3>
                            <p className="text-[13px] text-[#555]">Create your first novel to start writing</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredNovels.map((novel, i) => (
                                <motion.div key={novel.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                    className="group relative p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] bg-[#0a0a0a] hover:bg-[#0e0e0e] transition-all duration-300 cursor-pointer"
                                    onClick={() => openNovel(novel)}>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(novel.id); }}
                                        className="absolute top-3 right-3 p-1.5 rounded-lg text-transparent group-hover:text-[#444] hover:!text-[#b76e79] hover:bg-white/[0.04] transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                    <div className="flex items-start mb-3">
                                        <div className="p-2.5 rounded-xl bg-white/[0.04]">
                                            <Feather size={16} className="text-[#888]" />
                                        </div>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-white mb-1 line-clamp-1">{novel.title}</h3>
                                    <p className="text-[13px] text-[#666] leading-relaxed line-clamp-2 mb-3">{novel.synopsis || 'No synopsis'}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-[#444]">
                                        <span>{novel.chapter_count} ch</span>
                                        <span>·</span>
                                        <span>{(novel.total_words || 0).toLocaleString()} words</span>
                                        <span>·</span>
                                        <span className="capitalize">{novel.genre}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreate && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setShowCreate(false)}>
                            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                                className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#0a0a0a] border border-white/[0.06] overflow-hidden"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-white/10" /></div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-[15px] font-semibold text-white">New Novel</h2>
                                        <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.04]"><X size={16} /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[12px] text-[#666] mb-1.5 block">Title</label>
                                            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="The Last Swordsman..."
                                                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#444] bg-[#050505] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] text-[#666] mb-1.5 block">Synopsis</label>
                                            <textarea value={newSynopsis} onChange={e => setNewSynopsis(e.target.value)} placeholder="A brief overview..." rows={2}
                                                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#444] bg-[#050505] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none resize-none transition-colors" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[12px] text-[#666] mb-1.5 block">Genre</label>
                                                <select value={newGenre} onChange={e => setNewGenre(e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-[#050505] border border-white/[0.06] focus:outline-none">
                                                    {['Fantasy', 'Sci-Fi', 'Romance', 'Horror', 'Thriller', 'Mystery', 'Isekai', 'Slice of Life', 'Historical', 'Xianxia', 'LitRPG'].map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[12px] text-[#666] mb-1.5 block">Tone</label>
                                                <select value={newTone} onChange={e => setNewTone(e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-[#050505] border border-white/[0.06] focus:outline-none">
                                                    {['dramatic', 'comedic', 'dark', 'literary', 'action-packed', 'romantic', 'horror', 'philosophical'].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#888] bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] transition-colors">Cancel</button>
                                        <button onClick={handleCreate} disabled={!newTitle.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] disabled:opacity-40 transition-colors">Create</button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }


    // ═════════════════════════════════════════════════════════════════════════
    //  EDITOR
    // ═════════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#050505]">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' } }} />

            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <button onClick={() => { setView('library'); setActiveNovel(null); }}
                        className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.04] transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="hidden sm:block">
                        <h2 className="text-[13px] font-semibold text-white leading-tight">{activeNovel?.title}</h2>
                        <p className="text-[10px] text-[#444]">{chapters.length} chapters · {(activeNovel?.total_words || 0).toLocaleString()} words</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => { setShowLore(!showLore); setShowAssist(false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${showLore ? 'bg-white/[0.08] text-white' : 'text-[#666] hover:text-white hover:bg-white/[0.04]'}`}>
                        <Scroll size={13} /> Notes
                    </button>
                    <button onClick={() => { setShowAssist(!showAssist); setShowLore(false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${showAssist ? 'bg-white/[0.08] text-white' : 'text-[#666] hover:text-white hover:bg-white/[0.04]'}`}>
                        <Wand2 size={13} /> Assist
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] disabled:opacity-60 transition-colors ml-1">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                    </button>
                </div>
            </div>

            <div className="flex pt-14" style={{ height: 'calc(100vh)' }}>
                {/* Chapter List */}
                <div className="w-48 flex-shrink-0 overflow-y-auto hidden lg:block border-r border-white/[0.06]">
                    <div className="p-3">
                        <span className="text-[10px] font-semibold text-[#444] uppercase tracking-[0.15em] px-1">Chapters</span>
                    </div>
                    <div className="px-2 pb-4 space-y-0.5">
                        {chapters.map(ch => (
                            <button key={ch.id} onClick={() => selectChapter(ch)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors ${activeChapter?.id === ch.id
                                    ? 'bg-white/[0.06] text-white' : 'text-[#999] hover:text-white hover:bg-white/[0.03]'}`}>
                                <div className="font-medium">Ch {ch.chapter_number}</div>
                                <div className="text-[10px] opacity-50 truncate mt-0.5">{ch.title || 'Untitled'}</div>
                            </button>
                        ))}
                        {chapters.length === 0 && (
                            <p className="text-[11px] text-[#444] text-center py-6 px-2">
                                Open the Assist panel to draft your first chapter
                            </p>
                        )}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <EditorToolbar editor={editor} />
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                    {/* Status bar */}
                    <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#444]">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><Hash size={10} /> {wordCount.toLocaleString()} words</span>
                            <span className="flex items-center gap-1"><FileText size={10} /> {charCount.toLocaleString()} chars</span>
                            <span className="flex items-center gap-1"><Clock size={10} /> ~{readingTime} min read</span>
                        </div>
                        {activeChapter && (
                            <span>Ch {activeChapter.chapter_number}</span>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <AnimatePresence>
                    {(showAssist || showLore) && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0 overflow-y-auto border-l border-white/[0.06] hidden md:block">

                            {/* Assist Panel */}
                            {showAssist && (
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
                                            <Wand2 size={14} className="text-[#888]" /> Writing Assist
                                        </h3>
                                        <button onClick={() => setShowAssist(false)} className="p-1 rounded text-[#555] hover:text-white"><X size={14} /></button>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-[11px] text-[#555] mb-1.5 block">Direction for the next chapter</label>
                                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                                            placeholder="Describe what should happen next…"
                                            rows={4}
                                            className="w-full px-3 py-2.5 rounded-xl text-[13px] text-white placeholder-[#444] bg-[#050505] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none resize-none transition-colors" />
                                    </div>

                                    <button onClick={handleGenerate} disabled={generating || !prompt.trim()}
                                        className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] disabled:opacity-40 flex items-center justify-center gap-2 transition-colors mb-6">
                                        {generating ? (
                                            <><Loader2 size={14} className="animate-spin" /> Writing…</>
                                        ) : (
                                            <><PenTool size={14} /> Write Chapter {(activeNovel?.chapter_count || 0) + 1}</>
                                        )}
                                    </button>

                                    <div>
                                        <span className="text-[10px] font-semibold text-[#444] uppercase tracking-[0.15em]">Story Beats</span>
                                        <div className="mt-2 space-y-1">
                                            {[
                                                "Introduce a new character with a hidden agenda",
                                                "Reveal a betrayal that shifts alliances",
                                                "Build tension through an action sequence",
                                                "Develop a character through a quiet moment",
                                                "Deliver a twist that reframes past events",
                                            ].map(q => (
                                                <button key={q} onClick={() => setPrompt(q)}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-[#666] hover:text-white hover:bg-white/[0.03] transition-colors">
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/[0.06]">
                                        <span className="text-[10px] font-semibold text-[#444] uppercase tracking-[0.15em]">Continuity</span>
                                        <div className="mt-2 space-y-1.5 text-[11px]">
                                            <div className="flex justify-between text-[#555]"><span>Tracked details</span><span className="text-white">{lore.length}</span></div>
                                            <div className="flex justify-between text-[#555]"><span>Characters</span><span className="text-white">{lore.filter(l => l.category === 'character').length}</span></div>
                                            <div className="flex justify-between text-[#555]"><span>Plot threads</span><span className="text-white">{lore.filter(l => l.category === 'plot').length}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Story Notes (Lorebook) */}
                            {showLore && (
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
                                            <Scroll size={14} className="text-[#888]" /> Story Notes
                                        </h3>
                                        <button onClick={() => setShowLore(false)} className="p-1 rounded text-[#555] hover:text-white"><X size={14} /></button>
                                    </div>
                                    <p className="text-[11px] text-[#555] mb-4">
                                        Key details extracted from your chapters for continuity tracking.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <button onClick={() => setLoreFilter(null)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${!loreFilter ? 'bg-white/[0.08] text-white' : 'text-[#555] hover:text-white'}`}>All</button>
                                        {LORE_CATS.map(cat => (
                                            <button key={cat.key} onClick={() => setLoreFilter(cat.key)}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${loreFilter === cat.key ? 'bg-white/[0.08] text-white' : 'text-[#555] hover:text-white'}`}>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {filteredLore.length === 0 ? (
                                            <p className="text-[12px] text-[#444] text-center py-8">No notes yet. Write chapters to build your story bible.</p>
                                        ) : filteredLore.map(entry => (
                                            <div key={entry.id} className="p-3 rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[13px] font-medium text-white">{entry.key}</span>
                                                    <span className="text-[9px] text-[#444] uppercase">{entry.category}</span>
                                                </div>
                                                <p className="text-[11px] text-[#666] leading-relaxed">{entry.value}</p>
                                                <span className="text-[9px] text-[#333] mt-1.5 block">Source: Ch {entry.source_chapter === 0 ? '–' : entry.source_chapter}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StoryEditor;
