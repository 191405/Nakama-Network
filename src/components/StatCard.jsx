import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Flame, Shield } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, change, suffix = '', color = 'amber' }) => {
  const colors = {
    amber: 'from-amber-600 to-yellow-600 shadow-amber-500/20',
    green: 'from-green-600 to-emerald-600 shadow-green-500/20',
    red: 'from-red-600 to-orange-600 shadow-red-500/20',
    yellow: 'from-yellow-500 to-amber-500 shadow-yellow-500/20',
    blue: 'from-blue-600 to-cyan-600 shadow-blue-500/20',
    purple: 'from-amber-500 to-yellow-500 shadow-amber-500/20', 
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${colors[color] || colors.amber} border border-white/10 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-3 rounded-lg bg-black/20"
        >
          <Icon className="text-white" size={24} />
        </motion.div>
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-sm font-bold px-2 py-1 rounded ${isPositive
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
              }`}
          >
            {isPositive ? '+' : ''}{change}%
          </motion.div>
        )}
      </div>
      <p className="text-slate-200 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">
        {value}
        <span className="text-lg ml-2 opacity-70">{suffix}</span>
      </p>
    </motion.div>
  );
};

export default StatCard;
