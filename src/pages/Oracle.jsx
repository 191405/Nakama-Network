import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Scroll, Sparkles, MessageCircle, Brain, Zap } from 'lucide-react';
import { askTheOracle } from '../utils/gemini';
import { GuestGuard } from '../components/GuestGuard';

const Badge = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
    style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', color: 'rgba(244,114,182,0.7)' }}>
    <Icon size={12} /> {label}
  </div>
);

const Oracle = () => {
  const [messages, setMessages] = useState([{
    role: 'oracle',
    content: '✨ Welcome, seeker. I am The Sensei — keeper of infinite anime wisdom. The threads of fate have brought you here. Ask freely, and I shall illuminate your path through the world of anime...',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    const response = await askTheOracle(input, messages.map(m => ({ role: m.role, content: m.content })));
    setMessages(prev => [...prev, { role: 'oracle', content: response }]);
    setLoading(false);
  };

  return (
    <GuestGuard feature="oracle">
      <div className="min-h-screen pt-20 pb-24 md:pb-8 relative bg-[#050505]">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px]"
            style={{ background: 'radial-gradient(ellipse, rgba(244,63,94,0.05), transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px]"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.04), transparent 70%)', filter: 'blur(60px)' }} />
          {/* Floating kanji */}
          {['知', '悟', '道', '術'].map((char, i) => (
            <span key={char} className="absolute text-7xl font-black select-none pointer-events-none"
              style={{ color: `rgba(244,63,94,0.025)`, left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 40}%`, fontFamily: '"Noto Sans JP", sans-serif' }}>
              {char}
            </span>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(244,63,94,0.2)', '0 0 40px rgba(244,63,94,0.5)', '0 0 20px rgba(244,63,94,0.2)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(244,63,94,0.2)' }}>
              <Scroll size={28} style={{ color: '#f43f5e' }} />
            </motion.div>

            <p className="text-xs tracking-[0.4em] mb-3" style={{ color: 'rgba(244,114,182,0.3)', fontFamily: '"Noto Sans JP", sans-serif' }}>師匠の知恵</p>
            <h1 className="font-black mb-2" style={{ fontFamily: 'var(--font-display, Cinzel, serif)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}>
              <span style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899,#fda4af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(244,63,94,0.4))' }}>The</span>
              {' '}<span style={{ color: '#e2d9f3' }}>Sensei</span>
            </h1>
            <p className="text-slate-600 text-sm mb-5">Ancient anime wisdom powered by AI</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge icon={Brain} label="AI-Powered" />
              <Badge icon={Sparkles} label="Anime Expert" />
              <Badge icon={Zap} label="Instant Insights" />
              <Badge icon={MessageCircle} label="Conversational" />
            </div>
          </div>

          {/* Messages */}
          <div className="rounded-3xl p-5 mb-4 overflow-y-auto"
            style={{ minHeight: 300, maxHeight: '50vh', background: 'rgba(10,7,20,0.8)', border: '1px solid rgba(244,63,94,0.1)' }}>
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%] px-5 py-4 rounded-2xl"
                      style={msg.role === 'user' ? {
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(236,72,153,0.1))',
                        border: '1px solid rgba(244,63,94,0.25)',
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(244,63,94,0.1)',
                      }}>
                      {msg.role === 'oracle' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Scroll size={12} style={{ color: '#f43f5e' }} />
                          <span className="text-xs font-semibold" style={{ color: 'rgba(244,114,182,0.6)' }}>The Sensei</span>
                        </div>
                      )}
                      <p className="text-slate-200 leading-relaxed text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,63,94,0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Scroll size={12} style={{ color: '#f43f5e' }} />
                      <span className="text-xs font-semibold" style={{ color: 'rgba(244,114,182,0.6)' }}>Contemplating...</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: '#f43f5e' }}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-3 p-2 rounded-2xl"
            style={{ background: 'rgba(10,7,20,0.9)', border: '1px solid rgba(244,63,94,0.15)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Seek wisdom from The Sensei..."
              disabled={loading}
              className="flex-1 px-5 py-4 bg-transparent outline-none text-slate-200 placeholder-slate-700 text-sm"
            />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleSend} disabled={loading || !input.trim()}
              className="px-6 py-4 rounded-xl font-bold text-white text-sm flex items-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', boxShadow: '0 4px 20px rgba(244,63,94,0.35)' }}>
              <Send size={16} />
              <span className="hidden md:inline">Ask</span>
            </motion.button>
          </div>

          <p className="text-center text-xs text-slate-700 mt-3">師匠はすべてを知っている · Powered by advanced AI</p>
        </div>
      </div>
    </GuestGuard>
  );
};

export default Oracle;
