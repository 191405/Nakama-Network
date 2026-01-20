import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  showLabel = true,
  showPercentage = true,
  variant = 'default',
  animated = true,
  className = '',
}) => {
  const percentage = (value / max) * 100;

  const variants = {
    default: 'from-amber-500 to-yellow-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-orange-500',
    anime: 'from-amber-400 to-yellow-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && label && (
            <span className="text-sm font-medium text-slate-300">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${percentage}%` : `${percentage}%` }}
          transition={{ duration: animated ? 0.6 : 0, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${variants[variant]} rounded-full`}
          style={{ boxShadow: `0 0 20px rgba(245, 158, 11, 0.4)` }}
        />
      </div>
    </div>
  );
};

export const CircularProgress = ({
  value = 0,
  max = 100,
  label = '',
  size = 'md',
  variant = 'default',
}) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: { container: 80, text: 'text-xs' },
    md: { container: 120, text: 'text-lg' },
    lg: { container: 160, text: 'text-2xl' },
  };

  const variants = {
    default: 'from-amber-500 to-yellow-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-orange-500',
    anime: 'from-amber-400 to-yellow-400',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: sizes[size].container, height: sizes[size].container }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(75, 85, 99, 0.3)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="2"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${variants[variant]} ${sizes[size].text}`}
          >
            {Math.round(percentage)}%
          </motion.div>
          {label && (
            <div className="text-xs text-slate-400 text-center mt-1">{label}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
