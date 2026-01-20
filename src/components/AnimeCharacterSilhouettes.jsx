import React from 'react';
import { motion } from 'framer-motion';

const AnimeCharacterSilhouettes = () => {
  
  const characters = [
    {
      id: 1,
      name: 'warrior',
      viewBox: '0 0 100 200',
      path: 'M50,20 C60,20 65,30 65,40 L60,80 L70,120 L65,180 L50,180 L50,100 L50,100 L35,120 L30,180 L15,180 L20,120 L30,80 L25,40 C25,30 30,20 40,20 Z',
      top: '10%',
      left: '5%',
      delay: 0,
    },
    {
      id: 2,
      name: 'dancer',
      viewBox: '0 0 100 200',
      path: 'M50,30 C58,30 65,37 65,45 L70,80 L75,130 L60,180 L45,180 L50,130 L50,100 L35,130 L30,180 L15,180 L10,130 L15,80 L20,45 C20,37 27,30 35,30 Z',
      top: '15%',
      right: '10%',
      delay: 0.5,
    },
    {
      id: 3,
      name: 'mage',
      viewBox: '0 0 100 200',
      path: 'M50,25 C62,25 70,33 70,45 L65,85 L60,140 L55,180 L45,180 L40,140 L35,85 L30,45 C30,33 38,25 50,25 Z M30,90 L20,85 M70,90 L80,85',
      top: '25%',
      right: '5%',
      delay: 1,
    },
  ];

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const glowVariants = {
    animate: {
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {characters.map((char) => (
        <motion.div
          key={char.id}
          className="absolute"
          style={{
            top: char.top,
            left: char.left,
            right: char.right,
          }}
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: char.delay }}
        >
          {}
          <motion.div
            className="absolute inset-0 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(180, 0, 255, 0.4), transparent)',
            }}
            variants={glowVariants}
            animate="animate"
          />

          {}
          <svg
            viewBox={char.viewBox}
            width="150"
            height="300"
            className="filter drop-shadow-2xl"
            style={{
              filter: `drop-shadow(0 0 20px rgba(180, 0, 255, 0.5))`,
            }}
          >
            <path
              d={char.path}
              fill="url(#silhouetteGradient)"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b400ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff00ea" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default AnimeCharacterSilhouettes;
