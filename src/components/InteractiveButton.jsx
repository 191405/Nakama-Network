import React from 'react';
import { motion } from 'framer-motion';

export const InteractiveButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-yellow-500/30',
    secondary: 'bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500',
    outline: 'border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/10',
    ghost: 'text-yellow-400 hover:bg-yellow-500/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-xl font-bold flex items-center justify-center gap-2 
        transition-all duration-300 relative overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={20} />}
      <span>{children}</span>
      
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 0.3 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};

export const GlowButton = ({ children, onClick, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative px-8 py-4 rounded-2xl font-bold text-black overflow-hidden
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 animate-gradient" />
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      
      <motion.div
        className="absolute inset-0 blur-xl opacity-50"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(234,179,8,0.8), transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(251,146,60,0.8), transparent 50%)',
            'radial-gradient(circle at 0% 100%, rgba(234,179,8,0.8), transparent 50%)',
            'radial-gradient(circle at 100% 0%, rgba(251,146,60,0.8), transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(234,179,8,0.8), transparent 50%)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.button>
  );
};

export default InteractiveButton;
