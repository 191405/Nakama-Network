import React from 'react';
import { motion } from 'framer-motion';

export const ProfessionalLoader = ({ size = 'md', text = '', variant = 'spinner' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          className={`${sizes[size]} rounded-full border-4 border-yellow-500/30 border-t-yellow-500`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-yellow-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-1.5 items-end h-12">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-yellow-500 to-amber-500 rounded-full"
              animate={{
                height: ['20%', '100%', '20%']
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
      </div>
    );
  }

  return null;
};

export const SkeletonLoader = ({ className = '', variant = 'card' }) => {
  if (variant === 'card') {
    return (
      <div className={`rounded-2xl overflow-hidden ${className}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundSize: '200% 100%'
          }}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {[100, 80, 90].map((width, i) => (
          <motion.div
            key={i}
            className="h-4 rounded-lg bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
            style={{ width: `${width}%`, backgroundSize: '200% 100%' }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default ProfessionalLoader;
