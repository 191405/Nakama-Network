import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CinematicSkyBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const drawSky = () => {
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(0, '#f5f3ee');      
      gradient.addColorStop(0.2, '#e8dcc8');    
      gradient.addColorStop(0.4, '#d4b5a0');    
      gradient.addColorStop(0.6, '#9b8b7e');    
      gradient.addColorStop(0.8, '#6b6258');    
      gradient.addColorStop(1, '#2a2520');      

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawClouds = () => {
      
      const cloudCount = 5;
      for (let i = 0; i < cloudCount; i++) {
        const cloudY = (canvas.height * 0.1) + (i * (canvas.height * 0.15));
        const cloudX = ((time * (0.02 + i * 0.005)) % (canvas.width + 300)) - 150;
        const cloudSize = 100 + i * 20;

        const cloudGradient = ctx.createRadialGradient(
          cloudX + cloudSize / 2,
          cloudY,
          0,
          cloudX + cloudSize / 2,
          cloudY,
          cloudSize * 1.2
        );
        cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        cloudGradient.addColorStop(0.5, 'rgba(255, 250, 240, 0.15)');
        cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.ellipse(cloudX, cloudY, cloudSize, cloudSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(cloudX, cloudY, cloudSize, cloudSize * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawSunrays = () => {
      
      const sunX = canvas.width * 0.7;
      const sunY = canvas.height * 0.2;

      const rayGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 500);
      rayGradient.addColorStop(0, 'rgba(255, 200, 100, 0.15)');
      rayGradient.addColorStop(0.5, 'rgba(255, 160, 80, 0.05)');
      rayGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

      ctx.fillStyle = rayGradient;
      ctx.fillRect(sunX - 600, sunY - 600, 1200, 1200);

      ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawLandscape = () => {
      
      const hillHeight = canvas.height * 0.35;
      const hillPoints = 80;

      ctx.fillStyle = 'rgba(100, 80, 70, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - hillHeight);
      
      for (let i = 0; i <= hillPoints; i++) {
        const x = (i / hillPoints) * canvas.width;
        const y = canvas.height - hillHeight +
          Math.sin(x * 0.005 + time * 0.00005) * 40 +
          Math.cos(x * 0.003 + time * 0.00003) * 30;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      ctx.fillStyle = 'rgba(130, 110, 95, 0.9)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - hillHeight * 0.7);
      
      for (let i = 0; i <= hillPoints; i++) {
        const x = (i / hillPoints) * canvas.width;
        const y = canvas.height - hillHeight * 0.7 +
          Math.sin(x * 0.008 + time * 0.00008) * 35 +
          Math.cos(x * 0.004 + time * 0.00004) * 25;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();
    };

    const drawStars = () => {
      
      const starOpacity = Math.max(0, (1 - (time % 40000) / 40000) * 0.5);
      
      if (starOpacity > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity * 0.6})`;
        
        if (!window.starsCache) {
          window.starsCache = [];
          for (let i = 0; i < 50; i++) {
            window.starsCache.push({
              x: Math.random() * canvas.width,
              y: Math.random() * (canvas.height * 0.5),
              size: Math.random() * 1.5,
              brightness: Math.random() * 0.6 + 0.4,
            });
          }
        }

        window.starsCache.forEach((star, idx) => {
          const twinkle = Math.sin(time * 0.001 + idx) * 0.5 + 0.5;
          ctx.globalAlpha = twinkle * star.brightness * starOpacity;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
    };

    const drawMist = () => {
      
      const mistIntensity = Math.sin(time * 0.0001) * 0.15 + 0.2;
      
      const mistGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      mistGradient.addColorStop(0, `rgba(200, 190, 180, ${mistIntensity * 0.3})`);
      mistGradient.addColorStop(1, `rgba(180, 170, 160, ${mistIntensity * 0.6})`);

      ctx.fillStyle = mistGradient;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    };

    const animate = () => {
      time += 16;

      ctx.fillStyle = 'rgba(245, 243, 238, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawSky();
      drawSunrays();
      drawClouds();
      drawLandscape();
      drawMist();
      drawStars();

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
      transition={{ duration: 3 }}
      className="fixed inset-0 z-0"
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default CinematicSkyBackground;
