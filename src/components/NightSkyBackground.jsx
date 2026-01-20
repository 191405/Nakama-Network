import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Star = ({ size, top, left, delay, duration }) => (
    <motion.div
        className="absolute rounded-full"
        style={{
            width: size,
            height: size,
            top: `${top}%`,
            left: `${left}%`,
            background: 'white',
            boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`,
        }}
        animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: 'easeInOut',
        }}
    />
);

const ShootingStar = ({ delay }) => {
    const startTop = Math.random() * 40;
    const startLeft = Math.random() * 60 + 20;

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                top: `${startTop}%`,
                left: `${startLeft}%`,
                width: '2px',
                height: '2px',
                background: 'white',
                borderRadius: '50%',
                boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.8), -80px 0 20px 1px rgba(255, 255, 255, 0.3)',
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                x: [0, 200],
                y: [0, 120],
            }}
            transition={{
                duration: 1.5,
                delay: delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 15 + 10,
                ease: 'easeOut',
            }}
        />
    );
};

const NightSkyBackground = () => {
    const [stars, setStars] = useState([]);
    const [shootingStars, setShootingStars] = useState([]);

    useEffect(() => {
        
        const generatedStars = Array.from({ length: 150 }, (_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2,
        }));
        setStars(generatedStars);

        const generatedShootingStars = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            delay: i * 5 + Math.random() * 5,
        }));
        setShootingStars(generatedShootingStars);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to bottom, #000000 0%, #0a0a15 30%, #0d0d1a 50%, #050510 100%)',
                }}
            />

            {}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 20% 20%, rgba(30, 30, 80, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(60, 30, 60, 0.1) 0%, transparent 40%)',
                }}
            />

            {}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%)',
                    filter: 'blur(30px)',
                }}
            />

            {}
            {stars.map((star) => (
                <Star key={star.id} {...star} />
            ))}

            {}
            {shootingStars.map((ss) => (
                <ShootingStar key={ss.id} delay={ss.delay} />
            ))}

            {}
            <div
                className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{
                    background: 'linear-gradient(to top, rgba(10, 10, 30, 0.5), transparent)',
                }}
            />
        </div>
    );
};

export default NightSkyBackground;
