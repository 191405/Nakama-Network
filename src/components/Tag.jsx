import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const Tag = ({
  label,
  variant = 'default',
  icon: Icon = null,
  onRemove = null,
  onClick = null,
  className = '',
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
    anime: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
    uncommon: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    rare: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    epic: 'bg-gradient-to-r from-amber-500 to-orange-500 text-black',
    legendary: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
    mythic: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${variants[variant] || variants.default
        } ${onRemove ? 'pr-2' : ''} ${className}`}
    >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
      {onRemove && (
        <motion.button
          whileHover={{ scale: 1.2 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-80"
        >
          <X size={14} />
        </motion.button>
      )}
    </motion.div>
  );
};

export const TagGroup = ({ tags, variant = 'default', className = '', onRemove = null }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, idx) => (
        <Tag
          key={idx}
          label={tag.label || tag}
          variant={variant}
          icon={tag.icon}
          onRemove={onRemove ? () => onRemove(idx) : null}
        />
      ))}
    </div>
  );
};

export default Tag;
