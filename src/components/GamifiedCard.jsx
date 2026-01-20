import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const GamifiedCard = ({
  title,
  subtitle = '',
  children,
  icon: Icon = null,
  level = null,
  rarity = 'common',
  onClick = null,
  hoverEffect = true,
  className = '',
}) => {
  const rarityColors = {
    common: 'from-slate-700 to-slate-800 border-slate-600',
    uncommon: 'from-green-600/80 to-green-700/80 border-green-500',
    rare: 'from-blue-600/80 to-blue-700/80 border-blue-500',
    epic: 'from-amber-600/80 to-amber-700/80 border-amber-500',
    legendary: 'from-yellow-500/80 to-amber-600/80 border-yellow-500',
    mythic: 'from-amber-500/80 to-orange-600/80 border-amber-400',
  };

  const rarityGlow = {
    common: 'shadow-slate-500/20',
    uncommon: 'shadow-green-500/20',
    rare: 'shadow-blue-500/20',
    epic: 'shadow-amber-500/20',
    legendary: 'shadow-yellow-500/30',
    mythic: 'shadow-amber-500/30',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, y: -3 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`relative h-full bg-gradient-to-br ${rarityColors[rarity]} border-2 rounded-xl p-6 cursor-pointer overflow-hidden group transition-all shadow-xl ${rarityGlow[rarity]} ${className}`}
    >
      {}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {}
      <div className="relative z-10">
        {}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {Icon && (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-amber-400 mt-1"
              >
                <Icon size={24} />
              </motion.div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
              {subtitle && (
                <p className="text-sm text-slate-300 opacity-80">{subtitle}</p>
              )}
            </div>
          </div>

          {level !== null && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="px-3 py-1 rounded-full bg-black/40 border border-amber-400/50 text-amber-400 font-bold text-sm"
            >
              Lv. {level}
            </motion.div>
          )}
        </div>

        {}
        <div className="mt-4">{children}</div>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-amber-500/20"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-400">{rarity}</span>
          </div>
        </motion.div>
      </div>

      {}
      <motion.div
        className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};

export default GamifiedCard;
