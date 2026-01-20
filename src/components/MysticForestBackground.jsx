import React, { useEffect, useRef } from 'react';

const MysticForestBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawScene = () => {
      
      ctx.fillStyle = 'rgba(15, 23, 42, 1)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(30, 41, 59, 0.9)'); 
      gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.95)'); 
      gradient.addColorStop(1, 'rgba(10, 15, 35, 1)'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 30; i++) {
        const x = (i * canvas.width / 15 + time * 0.01) % canvas.width;
        const y = canvas.height * 0.3 + Math.sin(time * 0.001 + i) * 50;
        
        ctx.fillStyle = `rgba(168, 85, 247, ${0.1 + Math.sin(time * 0.002 + i) * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, 40 + Math.sin(time * 0.002 + i) * 20, 0, Math.PI * 2);
        ctx.fill();
      }

      const orbCount = 5;
      for (let i = 0; i < orbCount; i++) {
        const angle = (time * 0.0002 + i * (Math.PI * 2 / orbCount));
        const radius = canvas.height * 0.2;
        const x = canvas.width * 0.5 + Math.cos(angle) * radius;
        const y = canvas.height * 0.4 + Math.sin(angle) * radius * 0.5;

        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
        glowGradient.addColorStop(0, `rgba(168, 85, 247, ${0.4 + Math.sin(time * 0.003) * 0.2})`);
        glowGradient.addColorStop(0.7, `rgba(168, 85, 247, ${0.1 + Math.sin(time * 0.003) * 0.05})`);
        glowGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - 70, y - 70, 140, 140);

        ctx.fillStyle = `rgba(218, 112, 214, ${0.6 + Math.sin(time * 0.004 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(10, 10, 25, 0.8)';

      for (let tree = 0; tree < 8; tree++) {
        const treeX = (tree * canvas.width / 6) - (time * 0.02) % canvas.width;
        const treeBaseY = canvas.height * 0.7;

        ctx.fillRect(treeX + 40, treeBaseY, 20, canvas.height * 0.3);

        ctx.beginPath();
        ctx.moveTo(treeX + 50, treeBaseY - 80);
        ctx.lineTo(treeX + 20, treeBaseY);
        ctx.lineTo(treeX + 80, treeBaseY);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(treeX + 50, treeBaseY - 50);
        ctx.lineTo(treeX + 35, treeBaseY);
        ctx.lineTo(treeX + 65, treeBaseY);
        ctx.fill();
      }

      const bottomGlow = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      bottomGlow.addColorStop(0, 'rgba(168, 85, 247, 0)');
      bottomGlow.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

      const starCount = 30;
      for (let i = 0; i < starCount; i++) {
        const x = (i * canvas.width / 10 + time * 0.0005) % canvas.width;
        const y = canvas.height * 0.15 + Math.sin(time * 0.001 + i * 0.5) * 50 + (i * canvas.height / 100);
        
        const brightness = 0.3 + Math.sin(time * 0.003 + i) * 0.4;
        ctx.fillStyle = `rgba(200, 150, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 1;
      animationId = requestAnimationFrame(drawScene);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawScene();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default MysticForestBackground;
