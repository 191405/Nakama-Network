import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const OceanBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrame = 0;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const drawNightSky = () => {
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a1628'); 
      gradient.addColorStop(0.3, '#1a2a4a'); 
      gradient.addColorStop(0.6, '#162d47'); 
      gradient.addColorStop(1, '#0f1f35'); 

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const moonGlow = ctx.createRadialGradient(
        canvas.width * 0.75,
        canvas.height * 0.2,
        0,
        canvas.width * 0.75,
        canvas.height * 0.2,
        300
      );
      moonGlow.addColorStop(0, 'rgba(255, 250, 205, 0.15)');
      moonGlow.addColorStop(0.5, 'rgba(200, 220, 255, 0.05)');
      moonGlow.addColorStop(1, 'rgba(100, 150, 200, 0)');

      ctx.fillStyle = moonGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fffacd';
      ctx.shadowColor = 'rgba(255, 250, 205, 0.8)';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.75, canvas.height * 0.2, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(200, 180, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.72, canvas.height * 0.15, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width * 0.78, canvas.height * 0.25, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const stars = generateStars(canvas.width, canvas.height);
      stars.forEach(star => {
        const twinkle = Math.sin(time * 0.001 + star.offset) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * star.brightness;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawOceanWaves = () => {
      const waveHeight = 120;
      const waveFrequency = 0.004;
      const waveAmplitude = 30;
      const oceanStartY = canvas.height * 0.4;

      const oceanGradient = ctx.createLinearGradient(0, oceanStartY, 0, canvas.height);
      oceanGradient.addColorStop(0, '#1a3a52');
      oceanGradient.addColorStop(0.5, '#0d2535');
      oceanGradient.addColorStop(1, '#081820');

      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 80;
        const layerY = oceanStartY + layerOffset;
        const layerAmplitude = waveAmplitude * (1 - layer * 0.3);
        const layerFrequency = waveFrequency * (1 + layer * 0.2);
        const layerSpeed = time * (0.12 - layer * 0.02);  

        ctx.beginPath();
        ctx.moveTo(0, layerY);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            layerY +
            Math.sin((x * layerFrequency) + layerSpeed) * layerAmplitude +
            Math.sin((x * layerFrequency * 0.5) + layerSpeed * 0.7) * (layerAmplitude * 0.6);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = oceanGradient;
        ctx.fill();

        ctx.strokeStyle = `rgba(200, 220, 255, ${0.15 - layer * 0.05})`;
        ctx.lineWidth = 2 - layer * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, layerY);
        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            layerY +
            Math.sin((x * layerFrequency) + layerSpeed) * layerAmplitude +
            Math.sin((x * layerFrequency * 0.5) + layerSpeed * 0.7) * (layerAmplitude * 0.6);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const drawMoonReflection = () => {
      const moonX = canvas.width * 0.75;
      const moonY = canvas.height * 0.2;
      const oceanStartY = canvas.height * 0.4;

      if (moonY < oceanStartY) {
        
        const reflectionY = oceanStartY + (oceanStartY - moonY) * 1.2;
        const reflectionGradient = ctx.createLinearGradient(
          moonX - 200,
          oceanStartY,
          moonX + 200,
          reflectionY + 200
        );
        reflectionGradient.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
        reflectionGradient.addColorStop(0.5, 'rgba(150, 180, 220, 0.15)');
        reflectionGradient.addColorStop(1, 'rgba(100, 150, 200, 0)');

        ctx.fillStyle = reflectionGradient;
        ctx.fillRect(moonX - 200, oceanStartY, 400, 300);
      }
    };

    const drawParticles = () => {
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 0.0001 + i) * 400 + canvas.width * 0.5) % canvas.width;
        const y = (Math.cos(time * 0.00008 + i) * 300 + canvas.height * 0.3) % canvas.height;
        const size = 1 + Math.sin(time * 0.0002 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const generateStars = (width, height) => {
      if (!window.starsCache) {
        window.starsCache = [];
        for (let i = 0; i < 100; i++) {
          window.starsCache.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.35,
            size: Math.random() * 1.5,
            brightness: Math.random() * 0.6 + 0.4,
            offset: Math.random() * Math.PI * 2,
          });
        }
      }
      return window.starsCache;
    };

    const animate = () => {
      time += 16; 

      ctx.fillStyle = 'rgba(10, 22, 40, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNightSky();
      drawOceanWaves();
      drawMoonReflection();
      drawParticles();

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 z-0"
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default OceanBackground;
