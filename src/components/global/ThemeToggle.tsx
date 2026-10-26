import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useProject();
  const isWhite = theme === 'white';

  return (
    <button
      id="theme-toggle-btn"
      data-testid="theme-toggle"
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isWhite}
      aria-label={`Current theme is ${theme}. Click to switch to ${isWhite ? 'black' : 'white'} theme.`}
      title={isWhite ? 'Switch to Black Theme' : 'Switch to White Theme'}
      className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-plasma/40 shadow-sm"
      style={{
        background: isWhite ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 20, 20, 0.9)',
        borderColor: isWhite ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)',
        boxShadow: isWhite ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 10px rgba(0,0,0,0.5)'
      }}
    >
      {/* Icon Indicator */}
      <span className="flex items-center justify-center text-xs">
        {isWhite ? (
          <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow transition-transform group-hover:rotate-45" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-slate-300 transition-transform group-hover:-rotate-12" />
        )}
      </span>

      {/* Label */}
      <span 
        className="text-[11px] font-sans font-medium hidden sm:inline-block tracking-tight"
        style={{ color: isWhite ? '#0F172A' : '#E2E8F0' }}
      >
        {isWhite ? 'White' : 'Black'}
      </span>

      {/* Crisp White Toggle Switch Element */}
      <div 
        className="relative w-8 h-4 rounded-full transition-colors duration-300 p-0.5 flex items-center"
        style={{
          background: isWhite ? '#8B5CF6' : '#2A2A2A',
          border: isWhite ? '1px solid #7C3AED' : '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Toggle Thumb: Bright White Circle */}
        <div 
          className="w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-out"
          style={{
            transform: isWhite ? 'translateX(16px)' : 'translateX(0px)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 6px rgba(255, 255, 255, 0.8)'
          }}
        />
      </div>
    </button>
  );
};
