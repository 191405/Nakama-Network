import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  const breadcrumbVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
      <motion.div
        custom={0}
        variants={breadcrumbVariants}
        initial="hidden"
        animate="visible"
      >
        <Link
          to="/"
          className="flex items-center gap-1 text-gray-400 hover:text-purple-500 transition-colors"
        >
          <Home size={16} />
          <span>Home</span>
        </Link>
      </motion.div>

      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <motion.div
            custom={index + 1}
            variants={breadcrumbVariants}
            initial="hidden"
            animate="visible"
            className="text-gray-600"
          >
            <ChevronRight size={16} />
          </motion.div>
          <motion.div
            custom={index + 1.5}
            variants={breadcrumbVariants}
            initial="hidden"
            animate="visible"
          >
            {item.href ? (
              <Link
                to={item.href}
                className={`${
                  item.active
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-semibold'
                    : 'text-gray-400 hover:text-purple-500'
                } transition-colors`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`${
                  item.active
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            )}
          </motion.div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
