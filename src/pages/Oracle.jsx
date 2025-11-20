import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { askTheOracle } from '../utils/gemini';

const Oracle = () => {
  const [messages, setMessages] = useState([
    { role: 'oracle', content: 'Greetings, seeker. I am The Oracle, keeper of anime knowledge across all dimensions. What wisdom do you seek today?' }
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
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await askTheOracle(input, conversationHistory);
    
    setMessages(prev => [...prev, { role: 'oracle', content: response }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="neon-text">The Oracle</span>
          </h1>
          <p className="text-gray-400 font-mono">Ask, and You Shall Receive</p>
        </motion.div>

        <div className="glass-panel rounded-2xl border border-neon-blue/30 h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] p-4 rounded-xl
                  ${msg.role === 'user' 
                    ? 'bg-neon-blue/20 border border-neon-blue/50' 
                    : 'bg-neon-purple/20 border border-neon-purple/50'
                  }
                `}>
                  {msg.role === 'oracle' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="text-neon-purple" size={16} />
                      <span className="text-xs font-bold text-neon-purple">The Oracle</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-xl bg-neon-purple/20 border border-neon-purple/50">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neon-blue/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask The Oracle anything about anime..."
                className="flex-1 px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold cyber-button disabled:opacity-50">
                <Send size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Oracle;
