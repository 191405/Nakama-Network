import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Sparkles } from 'lucide-react';

const EntryAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 2500),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => onComplete(), 5500),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-cyber-black overflow-hidden"
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 grid-background opacity-30"></div>
        
        {/* Nebula Effect */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/30 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/30 rounded-full blur-[100px]"
          />
        </div>

        {/* Central Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Stage 0: Initial Logo Appearance */}
            {stage === 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-3xl flex items-center justify-center animate-pulse-glow">
                  <span className="text-6xl font-bold">NK</span>
                </div>
              </motion.div>
            )}

            {/* Stage 1: Network Formation */}
            {stage === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-3xl flex items-center justify-center">
                  <span className="text-6xl font-bold">NK</span>
                </div>
                
                {/* Orbiting Icons */}
                {[0, 120, 240].map((angle, index) => {
                  const icons = [Zap, Shield, Sparkles];
                  const Icon = icons[index];
                  const x = Math.cos((angle * Math.PI) / 180) * 100;
                  const y = Math.sin((angle * Math.PI) / 180) * 100;
                  
                  return (
                    <motion.div
                      key={angle}
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{ 
                        x, 
                        y, 
                        opacity: 1,
                        rotate: 360 
                      }}
                      transition={{ 
                        duration: 1, 
                        ease: "easeOut",
                        rotate: { 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-12 h-12 bg-neon-blue/30 border border-neon-blue rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Icon className="text-neon-blue" size={24} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Stage 2: Title Reveal */}
            {stage === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8 }}
              >
                <motion.h1 
                  className="text-6xl md:text-8xl font-bold mb-4"
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6)',
                      '0 0 20px rgba(180, 0, 255, 0.8), 0 0 40px rgba(180, 0, 255, 0.6)',
                      '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  NK NETWORK
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-xl md:text-2xl text-gray-400 font-mono"
                >
                  The Hidden Layer of Anime
                </motion.p>
              </motion.div>
            )}

            {/* Stage 3: Loading Bar */}
            {stage === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <h1 className="text-6xl md:text-8xl font-bold neon-text mb-4">
                  NK NETWORK
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-400 font-mono mb-8">
                  The Hidden Layer of Anime
                </p>

                {/* Loading Bar */}
                <div className="w-80 mx-auto">
                  <div className="h-2 bg-void-gray rounded-full overflow-hidden border border-neon-blue/30">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
                    />
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-500 mt-3 font-mono"
                  >
                    Initializing Neural Network...
                  </motion.p>
                </div>

                {/* Scanning Lines */}
                <motion.div
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-sm text-neon-blue font-mono space-y-1"
                >
                  <div>&gt; Loading AI Modules...</div>
                  <div>&gt; Connecting to Firebase...</div>
                  <div>&gt; Initializing Chakra System...</div>
                  <div>&gt; Ready to Enter</div>
                </motion.div>
              </motion.div>
            )}

            {/* Scan Lines Effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: '-100%' }}
                  animate={{ y: '200%' }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "linear"
                  }}
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-30"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-blue opacity-50"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-purple opacity-50"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-pink opacity-50"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-neon-blue opacity-50"></div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EntryAnimation;
