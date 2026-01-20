import React from 'react';
import { motion } from 'framer-motion';

const Slider = ({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label = '',
  variant = 'default',
  showValue = true,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const variants = {
    default: 'from-purple-600 to-blue-600',
    success: 'from-green-600 to-emerald-600',
    warning: 'from-yellow-600 to-orange-600',
    danger: 'from-red-600 to-pink-600',
    anime: 'from-pink-500 to-purple-600',
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-3">
          {label && (
            <label className="text-sm font-medium text-gray-300">{label}</label>
          )}
          {showValue && (
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
            >
              {value}
            </motion.span>
          )}
        </div>
      )}

      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden group cursor-pointer">
        {}
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${variants[variant]} rounded-full`}
          style={{ boxShadow: `0 0 15px rgba(236, 72, 153, 0.5)` }}
        />

        {}
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {}
        <motion.div
          animate={{ left: `calc(${percentage}% - 8px)` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r ${variants[variant]} shadow-lg pointer-events-none`}
        />
      </div>
    </div>
  );
};

export default Slider;
