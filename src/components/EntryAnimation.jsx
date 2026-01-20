import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon } from 'lucide-react';

const EntryAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 2500),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => setStage(4), 5500),
      setTimeout(() => onComplete(), 7000),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  const containerVariants = {
    hidden: { opacity: 1 },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: { duration: 0.6 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="entry"
        variants={containerVariants}
        initial="hidden"
        exit="exit"
        className="fixed inset-0 z-[9999] overflow-hidden"
      >
        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-orange-100"
        />

        {}
        <motion.div
          animate={{
            x: 100,
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-0 w-full h-32"
        >
          <div className="relative w-full h-full">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 left-1/4 w-96 h-24 bg-gradient-to-r from-white via-blue-50 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute top-8 left-1/2 w-80 h-20 bg-gradient-to-r from-white via-blue-100 to-transparent rounded-full blur-3xl"
            />
          </div>
        </motion.div>

        {}
        <svg
          className="absolute bottom-0 w-full h-1/3"
          viewBox="0 0 1920 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(120, 100, 80, 0.7)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(80, 60, 40, 0.9)' }} />
            </linearGradient>
          </defs>

          <motion.path
            d="M 0 300 Q 240 100 480 300 T 960 300 T 1440 300 T 1920 300 L 1920 600 L 0 600 Z"
            fill="url(#hillGradient)"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          />

          <motion.path
            d="M 0 400 Q 320 200 640 400 T 1280 400 T 1920 400 L 1920 600 L 0 600 Z"
            fill="rgba(100, 80, 60, 0.8)"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />
        </svg>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-slate-700 via-slate-600 to-transparent"
        />

        {}
        <div className="relative z-20 h-full flex flex-col items-center justify-center">
          {}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={stage >= 1 ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <Moon className="text-orange-300" size={48} />
              <Sparkles className="text-amber-200" size={40} />
            </motion.div>

            <h1
              className="text-6xl md:text-7xl font-black mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em'
              }}
            >
              <span style={{
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))'
              }}>
                Nakama
              </span>
              {' '}
              <span style={{
                color: '#e2e8f0',
                textShadow: '0 4px 8px rgba(0,0,0,0.8)'
              }}>
                Network
              </span>
            </h1>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-xl md:text-2xl font-light"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(226, 232, 240, 0.8)',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              The Ultimate Anime Hub
            </motion.p>
          </motion.div>

          {}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={stage >= 2 ? "visible" : "hidden"}
            className="text-center max-w-2xl px-6 mb-12"
          >
            <p
              className="text-lg md:text-xl font-light"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Enter a world where anime transcends the screen. Discover, engage, and belong to a community of passionate fans.
            </p>
          </motion.div>

          {}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -300, 0],
                  x: [0, Math.sin(i) * 100, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 4 + i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${(i / 20) * 100}%`,
                  top: '60%',
                }}
              />
            ))}
          </div>

          {}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={stage >= 3 ? "visible" : "hidden"}
            className="mt-16"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full"
              />
              <p
                className="text-sm font-light"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                Preparing your journey...
              </p>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {}
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-600/10 via-transparent to-transparent"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default EntryAnimation;
