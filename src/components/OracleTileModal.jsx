import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, MessageCircle, Star } from 'lucide-react';
import { askAboutAnime } from '../utils/gemini';

const SUGGESTED_QUESTIONS = [
    "Is this anime worth watching?",
    "What makes this anime unique?",
    "Who are the main characters?",
    "What genre does this best fit?",
    "How does the story end?",
];

const OracleTileModal = ({ anime, isOpen, onClose }) => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
        if (!isOpen) {
            setMessages([]);
            setQuestion('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAsk = async (q) => {
        const userQ = q || question.trim();
        if (!userQ || loading) return;

        setMessages(prev => [...prev, { role: 'user', content: userQ }]);
        setQuestion('');
        setLoading(true);

        try {
            const context = {
                title: anime?.title || anime?.title_english || 'Unknown',
                synopsis: anime?.synopsis || '',
                genres: anime?.genres || [],
                score: anime?.score,
                episodes: anime?.episodes,
                status: anime?.status,
                studios: anime?.studios || [],
            };
            const response = await askAboutAnime(context, userQ);
            setMessages(prev => [...prev, { role: 'oracle', content: response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'oracle', content: 'The Oracle\'s vision is clouded... Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-lg max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
                    style={{
                        background: 'linear-gradient(180deg, #0c0a12 0%, #080610 100%)',
                        border: '1px solid rgba(200, 160, 120, 0.15)',
                        boxShadow: '0 0 60px rgba(200, 160, 120, 0.08), 0 0 120px rgba(0,0,0,0.5)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(200, 160, 120, 0.1)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, rgba(200,160,120,0.15), rgba(200,160,120,0.05))' }}>
                                <Sparkles size={16} style={{ color: '#c8a078' }} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">The Oracle</h3>
                                <p className="text-[11px]" style={{ color: 'rgba(200,160,120,0.5)' }}>
                                    Ask about: {anime?.title?.slice(0, 30)}{anime?.title?.length > 30 ? '…' : ''}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                            <X size={18} className="text-white/40" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[200px] max-h-[50vh]">
                        {messages.length === 0 && (
                            <div className="text-center py-6">
                                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(200,160,120,0.1), rgba(200,160,120,0.03))' }}>
                                    <MessageCircle size={22} style={{ color: 'rgba(200,160,120,0.4)' }} />
                                </div>
                                <p className="text-white/30 text-sm mb-1">What would you like to know?</p>
                                <p className="text-white/15 text-xs">The Oracle knows all about this anime.</p>

                                {/* Suggested Questions */}
                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAsk(q)}
                                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-[1.02]"
                                            style={{
                                                background: 'rgba(200,160,120,0.06)',
                                                border: '1px solid rgba(200,160,120,0.12)',
                                                color: 'rgba(200,160,120,0.6)',
                                            }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-white/[0.06] text-white/80'
                                        : ''
                                }`}
                                    style={msg.role === 'oracle' ? {
                                        background: 'linear-gradient(135deg, rgba(200,160,120,0.08), rgba(200,160,120,0.02))',
                                        border: '1px solid rgba(200,160,120,0.1)',
                                        color: 'rgba(220,200,180,0.85)',
                                    } : {}}
                                >
                                    {msg.role === 'oracle' && (
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Sparkles size={10} style={{ color: '#c8a078' }} />
                                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'rgba(200,160,120,0.5)' }}>Oracle</span>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                                    style={{ background: 'rgba(200,160,120,0.05)', border: '1px solid rgba(200,160,120,0.08)' }}>
                                    <Loader2 size={14} className="animate-spin" style={{ color: '#c8a078' }} />
                                    <span className="text-xs" style={{ color: 'rgba(200,160,120,0.4)' }}>The Oracle is contemplating...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(200, 160, 120, 0.08)' }}>
                        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask about this anime..."
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-white/[0.03] border border-white/[0.06] focus:border-[rgba(200,160,120,0.3)] focus:outline-none transition-colors disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className="p-2.5 rounded-xl transition-all disabled:opacity-30"
                                style={{
                                    background: question.trim() ? 'linear-gradient(135deg, rgba(200,160,120,0.2), rgba(200,160,120,0.1))' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${question.trim() ? 'rgba(200,160,120,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                }}
                            >
                                <Send size={16} style={{ color: question.trim() ? '#c8a078' : 'rgba(255,255,255,0.2)' }} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OracleTileModal;
