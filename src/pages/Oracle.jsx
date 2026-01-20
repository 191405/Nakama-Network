import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Moon, Sparkles, Eye, Zap, Brain, MessageCircle } from 'lucide-react';
import { askTheOracle } from '../utils/gemini';
import { GuestGuard } from '../components/GuestGuard';

const AIFeatureBadge = ({ icon: Icon, label }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
    style={{
      background: 'rgba(234, 179, 8, 0.1)',
      border: '1px solid rgba(234, 179, 8, 0.2)',
    }}
  >
    <Icon size={14} className="text-yellow-400" />
    <span className="text-xs text-yellow-400/80 font-medium">{label}</span>
  </div>
);

const Oracle = () => {
  const [messages, setMessages] = useState([
    {
      role: 'oracle',
      content: '✨ Greetings, wanderer. I am the Oracle—keeper of infinite anime knowledge. The stars have aligned for your arrival. Ask, and I shall pierce the veil of wisdom to illuminate your path...',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const response = await askTheOracle(input, conversationHistory);

    setMessages((prev) => [...prev, { role: 'oracle', content: response }]);
    setLoading(false);
  };

  return (
    <GuestGuard feature="oracle">
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20" style={{ background: '#050505' }}>
        {}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(234, 179, 8, 0.06) 0%, transparent 50%)',
          }}
        />

        {}
        <div className="fixed inset-0 flex items-start justify-center pointer-events-none overflow-hidden">
          <motion.img
            src="/oracle-hands-moon.png"
            alt=""
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.25, y: 0 }}
            transition={{ duration: 2 }}
            className="w-full max-w-2xl mt-16"
            style={{
              filter: 'blur(1px)',
              maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 70%)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">

          {}
          <div className="text-center mb-8">
            {}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15), transparent)',
                border: '2px solid rgba(234, 179, 8, 0.3)',
                boxShadow: '0 0 40px rgba(234, 179, 8, 0.2)',
              }}
            >
              <Eye className="text-yellow-400" size={30} />
            </motion.div>

            {}
            <h1 className="text-5xl md:text-7xl font-black mb-3">
              <span
                style={{
                  color: '#eab308',
                  textShadow: '0 0 40px rgba(234, 179, 8, 0.5), 0 0 80px rgba(234, 179, 8, 0.3), 0 2px 4px rgba(0,0,0,1)',
                }}
              >
                Oracle
              </span>
            </h1>

            {}
            <p className="text-slate-400 text-sm md:text-base mb-4">
              Ancient wisdom meets artificial intelligence
            </p>

            {}
            <div className="flex flex-wrap justify-center gap-2">
              <AIFeatureBadge icon={Brain} label="AI Powered" />
              <AIFeatureBadge icon={Sparkles} label="Anime Expert" />
              <AIFeatureBadge icon={Zap} label="Instant Insights" />
              <AIFeatureBadge icon={MessageCircle} label="Conversational" />
            </div>
          </div>

          {}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'rgba(10, 10, 10, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.15)',
              minHeight: '300px',
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
          >
            {}
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-xs md:max-w-md lg:max-w-lg px-5 py-4 rounded-2xl"
                      style={{
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.15))'
                          : 'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(15, 15, 15, 0.95))',
                        border: msg.role === 'user'
                          ? '1px solid rgba(234, 179, 8, 0.4)'
                          : '1px solid rgba(234, 179, 8, 0.2)',
                      }}
                    >
                      {msg.role === 'oracle' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Moon size={14} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400/70 font-medium">Oracle</span>
                        </div>
                      )}
                      <p className="text-slate-100 leading-relaxed text-sm md:text-base">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-5 py-4 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(15, 15, 15, 0.95))',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Moon size={14} className="text-yellow-400" />
                      <span className="text-xs text-yellow-400/70 font-medium">Oracle is divining...</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 bg-yellow-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {}
          <div
            className="flex gap-3 p-2 rounded-2xl"
            style={{
              background: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Seek wisdom from the Oracle..."
              disabled={loading}
              className="flex-1 px-5 py-4 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-base"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-4 rounded-xl font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                boxShadow: '0 0 20px rgba(234, 179, 8, 0.3)',
              }}
            >
              <Send size={18} />
              <span className="hidden md:inline">Ask</span>
            </motion.button>
          </div>

          {}
          <p className="text-xs text-slate-600 text-center mt-3">
            ✨ The Oracle sees all • Powered by advanced AI
          </p>
        </div>
      </div>
    </GuestGuard>
  );
};

export default Oracle;
