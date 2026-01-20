import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const AudioVisualization = ({ isActive = true }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [bars, setBars] = useState(Array(64).fill(0));

  useEffect(() => {
    if (!isActive) return;

    const initAudio = async () => {
      try {
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContext.createMediaStreamAudioSource(stream);
          source.connect(analyser);
        } catch (err) {
          
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.connect(gain);
          gain.connect(analyser);
          gain.gain.setValueAtTime(0, audioContext.currentTime);
          oscillator.start();
        }

        const animate = () => {
          analyser.getByteFrequencyData(dataArray);

          const normalizedBars = Array.from(dataArray).slice(0, 64).map(v => v / 255);
          setBars(normalizedBars);

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.log('Audio context not available, using fallback visualization');
        
        const animate = () => {
          const newBars = Array(64)
            .fill(0)
            .map(() => Math.random() * 0.7);
          setBars(newBars);
          animationFrameRef.current = setTimeout(animate, 50);
        };
        animate();
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) {
        if (typeof animationFrameRef.current === 'number') {
          clearTimeout(animationFrameRef.current);
        } else {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0 flex items-end justify-center gap-1 px-4">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-gradient-to-t from-neon-blue via-neon-purple to-neon-pink rounded-t-lg"
          style={{
            height: `${height * 100}%`,
            minHeight: '4px',
            maxHeight: '120px',
            opacity: 0.3 + height * 0.4,
          }}
          animate={{
            height: `${height * 100}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualization;
