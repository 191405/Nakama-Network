import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const EnhancedCard = ({ 
  children, 
  className = '', 
  glowColor = '#eab308',
  hoverable = true,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={hoverable ? { y: -5, scale: 1.02 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative rounded-2xl overflow-hidden
        bg-gradient-to-br from-slate-900/95 to-slate-800/95
        border border-slate-700/50
        backdrop-blur-xl
        transition-all duration-300
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: isHovered 
          ? `0 20px 60px -15px ${glowColor}40, 0 0 0 1px ${glowColor}30`
          : '0 4px 20px rgba(0,0,0,0.4)'
      }}
      {...props}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={{
          opacity: isHovered ? 0.1 : 0,
          background: isHovered 
            ? `radial-gradient(circle at center, ${glowColor}, transparent 70%)`
            : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: 0.2 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}80, transparent)`
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`
        relative rounded-2xl p-6
        bg-white/5 backdrop-blur-2xl
        border border-white/10
        shadow-xl
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5 rounded-2xl pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color = '#eab308',
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer
        bg-gradient-to-br from-slate-900/95 to-slate-800/95
        border border-slate-700/50
        overflow-hidden
        ${className}
      `}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isHovered 
            ? `radial-gradient(circle at center, ${color}20, transparent 70%)`
            : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative"
          style={{ 
            background: `${color}15`,
            border: `2px solid ${color}30`
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
          >
            {Icon && <Icon size={28} style={{ color }} />}
          </motion.div>
        </motion.div>

        {/* Content */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default EnhancedCard;
