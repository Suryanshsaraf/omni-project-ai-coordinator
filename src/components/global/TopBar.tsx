import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Volume2, VolumeX, Orbit } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const TopBar: React.FC = () => {
  const { activeScenario, setActiveScenario, ragStatus, cycleRAGOverride, settings, updateSettings } = useProject();

  const ragPillStyles = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(46,230,166,0.25)]',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(255,178,36,0.25)]',
    red: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(255,59,92,0.3)]'
  }[ragStatus];

  const ragText = {
    green: 'Nominal Flow',
    amber: 'Attention Advised',
    red: 'Critical Drift'
  }[ragStatus];

  return (
    <header 
      className="relative z-30 w-full px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b transition-colors duration-300"
      style={{
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--topbar-border)'
      }}
    >
      {/* Brand & Mission Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-plasma to-indigo-600 flex items-center justify-center shadow-lg shadow-plasma/30 border border-white/20">
          <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '28s' }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-base sm:text-lg tracking-tight">
              OmniProject
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-plasma/20 text-plasma border border-plasma/30 font-semibold">
              Mission Control
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
            Autonomous digital project coordinator
          </p>
        </div>
      </div>

      {/* Scenario Switcher Pills */}
      <div 
        className="flex items-center gap-1.5 p-1 rounded-full border transition-colors duration-300"
        style={{
          background: 'var(--app-inset-bg)',
          borderColor: 'var(--app-border)'
        }}
      >
        <button
          onClick={() => setActiveScenario('telemedicine_app')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 ${
            activeScenario === 'telemedicine_app'
              ? 'bg-plasma text-white shadow-md shadow-plasma/40 font-semibold'
              : 'text-slate-400 hover:text-plasma'
          }`}
        >
          <span>🩺</span>
          <span>Telemedicine</span>
        </button>

        <button
          onClick={() => setActiveScenario('fintech_kyc')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 ${
            activeScenario === 'fintech_kyc'
              ? 'bg-plasma text-white shadow-md shadow-plasma/40 font-semibold'
              : 'text-slate-400 hover:text-plasma'
          }`}
        >
          <span>💳</span>
          <span>Fintech KYC</span>
        </button>
      </div>

      {/* Controls: Theme White Toggle + RAG Heartbeat Pill + Audio */}
      <div className="flex items-center gap-2.5">
        {/* White / Black Theme Toggle */}
        <ThemeToggle />

        {/* Interactive RAG Heartbeat Pill + Key R indicator */}
        <button
          onClick={cycleRAGOverride}
          title="Press 'R' or click to cycle RAG states for demonstration"
          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${ragPillStyles}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
          <span className="font-sans font-semibold tracking-wide">RAG: {ragText}</span>
          <span className="text-[10px] font-mono opacity-70 bg-black/40 px-1.5 py-0.2 rounded border border-white/10 text-white">
            [R]
          </span>
        </button>

        {/* Audio Toggle Button */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          title={settings.soundEnabled ? 'Mute Mission Audio' : 'Enable Mission Audio'}
          className="w-8 h-8 rounded-lg border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{
            background: 'var(--app-surface-bg)',
            borderColor: 'var(--app-border)'
          }}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-plasma" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};
