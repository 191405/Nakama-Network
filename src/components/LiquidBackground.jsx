import React, { useEffect, useRef } from 'react';

const LiquidBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createWaveLayer = (delay, speed, amplitude, color, frequency) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 1200 120');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.style.position = 'absolute';
      svg.style.bottom = '0';
      svg.style.left = '0';
      svg.style.width = '200%';
      svg.style.height = '120px';
      svg.style.opacity = '0.4';
      svg.style.zIndex = String(5 - delay);
      svg.style.filter = `blur(${delay * 0.5}px)`;

      const points = [];
      let pathData = `M0,60 `;
      
      for (let i = 0; i <= 4; i++) {
        const x = i * 300;
        const y = 60 + Math.sin((i * frequency) * Math.PI) * amplitude;
        const cp1x = x - 75;
        const cp1y = y + amplitude * 0.5;
        const cp2x = x + 75;
        const cp2y = y - amplitude * 0.5;
        
        if (i === 0) {
          pathData += `Q${cp2x},${cp2y} ${x + 300},${y + amplitude * Math.sin(frequency * 0.5)} `;
        } else {
          pathData += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${x + 300},${y + amplitude * Math.sin(frequency * 0.5)} `;
        }
      }
      
      pathData += `L1200,120 L0,120 Z`;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', color);
      path.style.animation = `wave-${delay} ${speed}s cubic-bezier(0.4, 0.0, 0.2, 1) infinite`;

      const styleId = `wave-style-${delay}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @keyframes wave-${delay} {
            0% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-150px) translateY(-8px); }
            50% { transform: translateX(-300px) translateY(0); }
            75% { transform: translateX(-150px) translateY(8px); }
            100% { transform: translateX(0) translateY(0); }
          }
          
          @media (prefers-reduced-motion: reduce) {
            @keyframes wave-${delay} {
              0%, 100% { transform: translateX(0) translateY(0); }
            }
          }
        `;
        document.head.appendChild(style);
      }

      svg.appendChild(path);
      return svg;
    };

    const waves = [
      createWaveLayer('1', '18', '25', '#00d4ff20', 0.5),
      createWaveLayer('2', '15', '20', '#b400ff15', 0.6),
      createWaveLayer('3', '12', '15', '#ff00ea10', 0.7),
      createWaveLayer('4', '20', '18', '#00d4ff18', 0.4),
    ];

    waves.forEach(wave => container.appendChild(wave));

    const shimmerOverlay = document.createElement('div');
    shimmerOverlay.style.position = 'absolute';
    shimmerOverlay.style.inset = '0';
    shimmerOverlay.style.background = 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.05) 50%, transparent 100%)';
    shimmerOverlay.style.animation = 'shimmer 8s ease-in-out infinite';
    shimmerOverlay.style.pointerEvents = 'none';
    
    const shimmerStyle = document.createElement('style');
    if (!document.getElementById('liquid-shimmer-style')) {
      shimmerStyle.id = 'liquid-shimmer-style';
      shimmerStyle.textContent = `
        @keyframes shimmer {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.5; transform: translateX(100%); }
        }
      `;
      document.head.appendChild(shimmerStyle);
    }
    
    container.appendChild(shimmerOverlay);

    return () => {
      container.innerHTML = '';
      for (let i = 1; i <= 4; i++) {
        const style = document.getElementById(`wave-style-${i}`);
        if (style) {
          style.remove();
        }
      }
      const shimmerStyle = document.getElementById('liquid-shimmer-style');
      if (shimmerStyle) {
        shimmerStyle.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 w-full h-40 pointer-events-none z-[1] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.05) 100%)'
      }}
    />
  );
};

export default LiquidBackground;
