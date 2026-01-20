import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CinematicBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 4 + 0.5;
        this.opacity = Math.random() * 0.7 + 0.1;
        this.maxOpacity = this.opacity;
        this.color = ['#00d4ff', '#b400ff', '#ff00ea'][Math.floor(Math.random() * 3)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.mass = Math.random() * 0.5 + 0.5;
      }

      update() {
        
        this.vy += 0.0001; 
        this.vx *= 0.9985; 
        this.vy *= 0.9985;

        this.x += this.vx;
        this.y += this.vy;
        
        this.wobble += this.wobbleSpeed;
        this.pulsePhase += this.pulseSpeed;

        const wobbleX = Math.sin(this.wobble) * 0.015;
        const wobbleY = Math.cos(this.wobble * 0.7) * 0.015;
        this.vx += wobbleX;
        this.vy += wobbleY;

        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 200) {
          const force = (1 - distance / 200) * 0.15;
          const angle = Math.atan2(dy, dx);
          this.vx -= Math.cos(angle) * force;
          this.vy -= Math.sin(angle) * force;
        }

        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;

        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > 3) {
          this.vx = (this.vx / speed) * 3;
          this.vy = (this.vy / speed) * 3;
        }

        this.opacity = this.maxOpacity * (0.5 + 0.5 * Math.sin(this.pulsePhase));
      }

      draw() {
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color.replace(')', ', 0.3)'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          this.x - this.size * 3,
          this.y - this.size * 3,
          this.size * 6,
          this.size * 6
        );

        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.opacity * 0.5;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
      }
    }

    const particleCount = Math.min(250, Math.floor(window.innerWidth / 15));
    particlesRef.current = Array.from({ length: particleCount }, () => new Particle());

    const animate = () => {
      
      ctx.fillStyle = 'rgba(3, 0, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (dist < 150) {
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, p1.color);
            gradient.addColorStop(1, p2.color);
            
            ctx.strokeStyle = gradient;
            ctx.globalAlpha = (1 - dist / 150) * 0.15;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default CinematicBackground;
