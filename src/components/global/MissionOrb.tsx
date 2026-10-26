import React, { useEffect, useRef, useState } from 'react';
import { useProject } from '../../context/ProjectContext';

export const MissionOrb: React.FC = () => {
  const { ragStatus, healthScore, theme } = useProject();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  // Smooth CountUp for Health Score
  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (healthScore - start) * ease);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [healthScore]);

  // Canvas WebGL-style Particle Orb
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const size = 260;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = size / 2;
    const centerY = size / 2;

    const colors = {
      green: { core: '#2EE6A6', glow: 'rgba(46, 230, 166, 0.4)', arc: '#B14BFF', speed: 0.02 },
      amber: { core: '#FFB224', glow: 'rgba(255, 178, 36, 0.45)', arc: '#B14BFF', speed: 0.035 },
      red: { core: '#FF3B5C', glow: 'rgba(255, 59, 92, 0.55)', arc: '#FFB224', speed: 0.06 }
    };

    let angle = 0;
    const isWhite = theme === 'white';

    const renderOrb = () => {
      const activeTheme = colors[ragStatus];
      angle += activeTheme.speed * (isHovered ? 1.8 : 1);

      ctx.clearRect(0, 0, size, size);

      // Outer Glow Aura
      const radGlow = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 120);
      radGlow.addColorStop(0, activeTheme.glow);
      radGlow.addColorStop(0.7, isWhite ? 'rgba(255, 255, 255, 0.2)' : 'rgba(20, 20, 20, 0.3)');
      radGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      ctx.fill();

      // Orbital Ring 1 (Rotated)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.strokeStyle = activeTheme.core;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = activeTheme.core;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, 92, 42, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Orbital Ring 2 (Counter-rotated with Plasma violet)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 1.3);
      ctx.strokeStyle = '#B14BFF';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#B14BFF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, 96, 38, -Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Orbital Ring 3 (Outer fine ring)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.7);
      ctx.strokeStyle = isWhite ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(0, 0, 108, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Quantum Node
      const nodeX = Math.cos(angle * 2) * 108;
      const nodeY = Math.sin(angle * 2) * 108;
      ctx.fillStyle = activeTheme.core;
      ctx.shadowColor = activeTheme.core;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Core Glass Sphere
      const sphereGrad = ctx.createRadialGradient(
        centerX - 15 + mousePos.current.x * 10,
        centerY - 15 + mousePos.current.y * 10,
        10,
        centerX,
        centerY,
        70
      );
      if (isWhite) {
        sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sphereGrad.addColorStop(0.4, 'rgba(241, 245, 249, 0.85)');
        sphereGrad.addColorStop(1, 'rgba(226, 232, 240, 0.95)');
      } else {
        sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        sphereGrad.addColorStop(0.4, 'rgba(18, 18, 18, 0.7)');
        sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      }

      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = activeTheme.core;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Rim Border
      ctx.strokeStyle = activeTheme.core;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(renderOrb);
    };

    renderOrb();

    return () => cancelAnimationFrame(animId);
  }, [ragStatus, isHovered, theme]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mousePos.current = { x, y };
  };

  const statusLabel = {
    green: 'Optimal Flow',
    amber: 'Caution Flag',
    red: 'Critical Drift'
  }[ragStatus];

  const statusTextColor = {
    green: 'text-signal-green',
    amber: 'text-signal-amber',
    red: 'text-signal-red'
  }[ragStatus];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mousePos.current = { x: 0, y: 0 };
      }}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center justify-center p-2 cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
      title="Execution Health Core: Heartbeat reacts to blockers and burnout"
    >
      <div className="relative w-[240px] h-[240px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: '240px', height: '240px' }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Central Display */}
        <div className="relative z-10 flex flex-col items-center pointer-events-none select-none">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            Health Core
          </span>
          <div className="flex items-baseline gap-0.5">
            <span 
              className="font-display text-4xl sm:text-5xl font-black tracking-tighter tabular-nums drop-shadow-md transition-colors"
              style={{ color: theme === 'white' ? '#0F172A' : '#FFFFFF' }}
            >
              {displayScore}
            </span>
            <span className="text-sm font-mono text-slate-400">/100</span>
          </div>
          <span className={`text-[11px] font-semibold mt-1 flex items-center gap-1.5 ${statusTextColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-ping ${statusTextColor.replace('text-', 'bg-')}`} />
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
