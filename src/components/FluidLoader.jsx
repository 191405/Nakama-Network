import React from 'react';
import { motion } from 'framer-motion';

const FluidLoader = ({ 
  size = 'md',
  variant = 'default',
  label = 'Loading...',
  showLabel = true,
}) => {
  const sizes = {
    sm: { container: 40, dot: 6 },
    md: { container: 60, dot: 8 },
    lg: { container: 80, dot: 10 },
  };

  const colors = {
    default: ['#ec4899', '#8b5cf6', '#3b82f6'],
    purple: ['#8b5cf6', '#ec4899', '#3b82f6'],
    anime: ['#ff006e', '#8338ec', '#3a86ff'],
  };

  const dots = colors[variant] || colors.default;

  const containerVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  const dotVariants = (delay) => ({
    animate: {
      y: [0, -20, 0],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.2,
        ease: 'easeInOut',
        repeat: Infinity,
        delay,
      },
    },
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        variants={containerVariants}
        animate="animate"
        className="flex gap-2"
      >
        {dots.map((color, idx) => (
          <motion.div
            key={idx}
            variants={dotVariants(idx * 0.15)}
            animate="animate"
            className="rounded-full"
            style={{
              width: sizes[size].dot,
              height: sizes[size].dot,
              backgroundColor: color,
            }}
          />
        ))}
      </motion.div>
      {showLabel && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-gray-400 text-sm font-medium"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

export const CircularFluidLoader = ({ 
  size = 'md',
  variant = 'default',
  label = '',
}) => {
  const sizes = {
    sm: 60,
    md: 100,
    lg: 140,
  };

  const colors = {
    default: { stop1: '#ec4899', stop2: '#8b5cf6' },
    purple: { stop1: '#8b5cf6', stop2: '#3b82f6' },
    anime: { stop1: '#ff006e', stop2: '#3a86ff' },
  };

  const colorConfig = colors[variant] || colors.default;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 100 100"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorConfig.stop1} />
            <stop offset="100%" stopColor={colorConfig.stop2} />
          </linearGradient>
        </defs>

        {}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="3"
          opacity="0.6"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {}
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="2"
          opacity="0.4"
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="url(#loaderGradient)"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-gray-400 text-sm font-medium"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

export default FluidLoader;
