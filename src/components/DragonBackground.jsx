import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DragonBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        style={{
          filter: 'drop-shadow(0 0 40px rgba(236, 72, 153, 0.3))',
        }}
      >
        {}
        <defs>
          <linearGradient id="dragonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff006e" stopOpacity="1" />
            <stop offset="25%" stopColor="#8338ec" stopOpacity="1" />
            <stop offset="50%" stopColor="#3a86ff" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#8338ec" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff006e" stopOpacity="1" />
          </linearGradient>

          <filter id="dragonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="eyeGlow" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffff00" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {}
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={`particle-${i}`}
            cx={100 + i * 90}
            cy={Math.random() * 1080}
            r="2"
            fill="#ec4899"
            opacity="0.4"
            animate={{
              y: [0, -200, 0],
              x: [0, Math.cos(i) * 50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {}
        <motion.g
          animate={{
            x: Math.sin(Date.now() / 3000) * 20,
            y: Math.cos(Date.now() / 4000) * 15,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          filter="url(#dragonGlow)"
        >
          {}
          <motion.g
            animate={{
              rotateZ: Math.sin(Date.now() / 2000) * 5,
            }}
            style={{
              transformOrigin: '400px 300px',
            }}
          >
            {}
            <ellipse
              cx="400"
              cy="300"
              rx="120"
              ry="100"
              fill="url(#dragonGradient)"
              opacity="0.9"
            />

            {}
            <path
              d="M 350 250 Q 350 180 400 160 Q 450 180 450 250"
              stroke="url(#dragonGradient)"
              strokeWidth="4"
              fill="none"
              opacity="0.8"
            />

            {}
            <ellipse
              cx="480"
              cy="320"
              rx="70"
              ry="50"
              fill="url(#dragonGradient)"
              opacity="0.85"
            />

            {}
            <circle
              cx="350"
              cy="280"
              r="20"
              fill="url(#eyeGlow)"
            />
            <motion.circle
              cx="350"
              cy="280"
              r="12"
              fill="#000"
              animate={{
                r: [12, 15, 12],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {}
            <circle
              cx="450"
              cy="280"
              r="20"
              fill="url(#eyeGlow)"
            />
            <motion.circle
              cx="450"
              cy="280"
              r="12"
              fill="#000"
              animate={{
                r: [12, 15, 12],
              }}
              transition={{
                duration: 2,
                delay: 0.3,
                repeat: Infinity,
              }}
            />

            {}
            <path
              d="M 320 200 Q 300 120 310 80"
              stroke="url(#dragonGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 480 200 Q 500 120 490 80"
              stroke="url(#dragonGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />

            {}
            <path
              d="M 510 300 L 620 280"
              stroke="url(#dragonGradient)"
              strokeWidth="3"
              opacity="0.7"
              strokeLinecap="round"
            />
            <path
              d="M 510 330 L 620 350"
              stroke="url(#dragonGradient)"
              strokeWidth="3"
              opacity="0.7"
              strokeLinecap="round"
            />

            {}
            <motion.g
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <path
                d="M 550 310 Q 650 250 750 200 Q 680 280 600 350 Z"
                fill="#ff6b00"
                opacity="0.6"
              />
              <path
                d="M 560 310 Q 680 260 800 220 Q 720 310 620 380 Z"
                fill="#ff00ff"
                opacity="0.4"
              />
            </motion.g>
          </motion.g>

          {}
          <motion.path
            d="M 300 380 Q 250 450 200 550 Q 180 650 150 750"
            stroke="url(#dragonGradient)"
            strokeWidth="80"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                "M 300 380 Q 250 450 200 550 Q 180 650 150 750",
                "M 300 380 Q 280 440 220 530 Q 200 630 170 740",
                "M 300 380 Q 250 450 200 550 Q 180 650 150 750",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            opacity="0.8"
          />

          {}
          {[0, 1, 2, 3].map((section) => (
            <motion.ellipse
              key={`body-${section}`}
              cx={150 + section * 200}
              cy={750 + section * 50}
              rx="90"
              ry="70"
              fill="url(#dragonGradient)"
              opacity={0.8 - section * 0.1}
              animate={{
                x: Math.sin(Date.now() / 2500 + section) * 30,
                y: Math.cos(Date.now() / 3500 + section) * 25,
              }}
              transition={{
                type: 'spring',
                stiffness: 50,
                damping: 20,
              }}
            />
          ))}

          {}
          <motion.path
            d="M 800 850 Q 900 800 1000 750 Q 1100 700 1200 650 Q 1300 600 1400 550"
            stroke="url(#dragonGradient)"
            strokeWidth="70"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                "M 800 850 Q 900 800 1000 750 Q 1100 700 1200 650 Q 1300 600 1400 550",
                "M 800 850 Q 920 760 1020 700 Q 1120 650 1220 600 Q 1320 550 1420 500",
                "M 800 850 Q 900 800 1000 750 Q 1100 700 1200 650 Q 1300 600 1400 550",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            opacity="0.7"
          />

          {}
          <motion.path
            d="M 1400 550 L 1500 450 L 1450 550 L 1500 650 Z"
            fill="url(#dragonGradient)"
            opacity="0.8"
            animate={{
              rotate: [0, -20, 20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            style={{
              transformOrigin: '1400px 550px',
            }}
          />
        </motion.g>

        {}
        <motion.text
          x="1700"
          y="150"
          fontSize="80"
          fill="url(#dragonGradient)"
          opacity="0.2"
          animate={{
            y: [150, 100, 150],
            x: [1700, 1720, 1700],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          龍
        </motion.text>

        {}
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={`orb-${i}`}
            cx={500 + Math.cos(i) * 400}
            cy={400 + Math.sin(i) * 300}
            r="8"
            fill="#ffd700"
            opacity="0.4"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

      {}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(236, 72, 153, 0.1), transparent 50%)`,
        }}
      />
    </div>
  );
};

export default DragonBackground;
