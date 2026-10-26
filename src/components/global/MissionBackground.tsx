import React, { useEffect, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';

export const MissionBackground: React.FC = () => {
  const { ragStatus, theme } = useProject();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isWhite = theme === 'white';

    // Color definitions based on RAG state & current theme
    const colorThemes = {
      green: {
        primary: isWhite ? 'rgba(16, 185, 129, 0.08)' : 'rgba(46, 230, 166, 0.1)',
        secondary: isWhite ? 'rgba(139, 92, 246, 0.06)' : 'rgba(177, 75, 255, 0.07)',
        accent: isWhite ? 'rgba(16, 185, 129, 0.03)' : 'rgba(46, 230, 166, 0.03)',
        speed: 0.003
      },
      amber: {
        primary: isWhite ? 'rgba(245, 158, 11, 0.09)' : 'rgba(255, 178, 36, 0.12)',
        secondary: isWhite ? 'rgba(139, 92, 246, 0.07)' : 'rgba(177, 75, 255, 0.08)',
        accent: isWhite ? 'rgba(245, 158, 11, 0.04)' : 'rgba(255, 178, 36, 0.04)',
        speed: 0.007
      },
      red: {
        primary: isWhite ? 'rgba(239, 68, 68, 0.11)' : 'rgba(255, 59, 92, 0.16)',
        secondary: isWhite ? 'rgba(139, 92, 246, 0.08)' : 'rgba(177, 75, 255, 0.1)',
        accent: isWhite ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 59, 92, 0.06)',
        speed: 0.015
      }
    };

    let step = 0;
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      velocity: Math.random() * 0.2 + 0.05
    }));

    const render = () => {
      const activeColor = colorThemes[ragStatus];
      step += activeColor.speed;

      ctx.clearRect(0, 0, width, height);

      // Deep space base - True Black in black mode, Crisp light in white mode
      ctx.fillStyle = isWhite ? '#F8FAFC' : '#000000';
      ctx.fillRect(0, 0, width, height);

      // Aurora Wave 1
      const g1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(step) * 120,
        height * 0.25 + Math.cos(step * 0.8) * 80,
        50,
        width * 0.3,
        height * 0.25,
        width * 0.7
      );
      g1.addColorStop(0, activeColor.primary);
      g1.addColorStop(0.6, activeColor.secondary);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Aurora Wave 2 (opposite quadrant)
      const g2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(step * 1.1) * 140,
        height * 0.7 + Math.sin(step * 0.9) * 100,
        80,
        width * 0.75,
        height * 0.7,
        width * 0.65
      );
      g2.addColorStop(0, activeColor.secondary);
      g2.addColorStop(0.5, activeColor.accent);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // Ambient Star Dust
      ctx.fillStyle = isWhite ? '#94A3B8' : '#FFFFFF';
      stars.forEach(star => {
        star.y -= star.velocity;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        ctx.globalAlpha = star.alpha * (0.6 + Math.sin(step * 2 + star.x) * 0.4);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ragStatus, theme]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
        aria-hidden="true"
      />
      {/* Subtle Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </>
  );
};
