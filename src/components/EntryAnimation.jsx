import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EntryAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => onComplete(), 1800),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="entry"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]"
      >
        <div className="text-center">
          <AnimatePresence mode="wait">
            {stage >= 1 && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <h1
                  className="font-extrabold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
                >
                  Nakama<span className="text-white/30 font-normal ml-1.5">Network</span>
                </h1>

                {stage >= 2 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-[11px] uppercase text-white/25 tracking-[0.3em] font-medium"
                  >
                    est. 2026
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EntryAnimation;
