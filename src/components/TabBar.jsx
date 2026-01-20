import React from 'react';
import { motion } from 'framer-motion';

const TabBar = ({ tabs, activeTab, onTabChange, variant = 'default' }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (variant === 'pill') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-3 flex-wrap justify-center mb-8"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            variants={tabVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-amber-400 border border-slate-700'
              }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex border-b border-amber-500/20 overflow-x-auto mb-8 scrollbar-thin"
      style={{ scrollbarWidth: 'thin' }}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          variants={tabVariants}
          whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-4 font-semibold whitespace-nowrap transition-all relative ${activeTab === tab.id
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-amber-300'
            }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default TabBar;
