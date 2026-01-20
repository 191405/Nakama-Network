import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MessageBubble = ({ message, isUser, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%] md:max-w-[60%]">
          <div className="relative">
            {}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-2xl blur-lg" />
            
            {}
            <div className="relative px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <Sparkles className="text-blue-300 animate-spin" size={20} />
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] md:max-w-[60%] ${isUser ? '' : ''}`}>
        {!isUser && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 mb-2 px-2"
          >
            <Sparkles className="text-blue-300" size={16} />
            <span className="text-xs font-semibold text-blue-200" style={{ fontFamily: 'var(--font-accent)' }}>
              The Oracle
            </span>
          </motion.div>
        )}

        <div className="relative group">
          {}
          <div
            className={`absolute -inset-1 bg-gradient-to-r rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isUser
                ? 'from-purple-400/30 via-blue-400/30 to-purple-400/30'
                : 'from-blue-400/30 via-cyan-400/30 to-blue-400/30'
            }`}
          />

          {}
          <div
            className={`relative px-6 py-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
              isUser
                ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/30 text-white'
                : 'bg-gradient-to-br from-blue-400/10 to-cyan-400/10 border-blue-400/30 text-blue-50'
            }`}
          >
            <p
              className="leading-relaxed text-sm md:text-base break-words"
              style={{
                fontFamily: 'var(--font-body)',
                lineHeight: '1.6',
              }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
