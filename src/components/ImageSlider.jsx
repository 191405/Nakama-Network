import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

const ImageSlider = ({ 
  images = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  height = 'h-96',
  showDots = true,
  showArrows = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, images.length]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex(
      (prev) => (prev + newDirection + images.length) % images.length
    );
  };

  if (images.length === 0) {
    return <div className={`${height} bg-gray-800 rounded-lg flex items-center justify-center`}>No images</div>;
  }

  return (
    <div className={`relative ${height} rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm group`}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="slider"
        />
      </AnimatePresence>

      {}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-10" />

      {}
      {showArrows && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
        >
          <ChevronLeft size={24} />
        </motion.button>
      )}

      {}
      {showArrows && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
        >
          <ChevronRight size={24} />
        </motion.button>
      )}

      {}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.2 }}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`transition-all ${
                idx === currentIndex
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 w-3 h-3'
                  : 'bg-white/40 hover:bg-white/70 w-2 h-2'
              } rounded-full`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
