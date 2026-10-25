import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Volume2, VolumeX, Radio, Sparkles, Orbit } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { activeScenario, setActiveScenario, ragStatus, cycleRAGOverride, ragOverride, settings, updateSettings } = useProject();

  const ragPillStyles = {
    green: 'bg-signal-green/15 text-signal-green border-signal-green/30 shadow-[0_0_15px_rgba(46,230,166,0.25)]',
    amber: 'bg-signal-amber/15 text-signal-amber border-signal-amber/30 shadow-[0_0_15px_rgba(255,178,36,0.25)]',
    red: 'bg-signal-red/15 text-signal-red border-signal-red/30 shadow-[0_0_15px_rgba(255,59,92,0.3)]'
  }[ragStatus];

  const ragText = {
    green: 'Green: Mission Nominal',
    amber: 'Amber: Attention Advised',
    red: 'Red: Critical Drift'
  }[ragStatus];

  return (
    <header className="relative z-30 w-full border-b border-night-border bg-night-base/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Mission Badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-plasma to-indigo-600 flex items-center justify-center shadow-lg shadow-plasma/25 border border-white/20">
          <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '24s' }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-lg text-white tracking-tight">
              OmniProject
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-plasma/15 text-plasma border border-plasma/30 font-medium">
              Mission Control
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Autonomous digital project coordinator
          </p>
        </div>
      </div>

      {/* Scenario Switcher Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-night-card border border-night-border">
        <button
          onClick={() => setActiveScenario('telemedicine_app')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 ${
            activeScenario === 'telemedicine_app'
              ? 'bg-plasma text-white shadow-md shadow-plasma/30'
              : 'text-slate-400 hover:text-ice'
          }`}
        >
          <span>🩺</span>
          <span>Telemedicine</span>
        </button>

        <button
          onClick={() => setActiveScenario('fintech_kyc')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 ${
            activeScenario === 'fintech_kyc'
              ? 'bg-plasma text-white shadow-md shadow-plasma/30'
              : 'text-slate-400 hover:text-ice'
          }`}
        >
          <span>💳</span>
          <span>Fintech KYC</span>
        </button>
      </div>

      {/* Controls & RAG Heartbeat Pill */}
      <div className="flex items-center gap-2.5">
        {/* Interactive RAG Heartbeat Pill + Key R indicator */}
        <button
          onClick={cycleRAGOverride}
          title="Press 'R' or click to cycle RAG states for demonstration"
          className={`group px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${ragPillStyles}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
          <span className="font-sans font-semibold tracking-wide">{ragText}</span>
          <span className="text-[10px] font-mono opacity-60 bg-black/30 px-1.5 py-0.2 rounded group-hover:opacity-100 transition-opacity">
            Key [R]
          </span>
        </button>

        {/* Audio Toggle Button */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          title={settings.soundEnabled ? 'Mute Mission Audio' : 'Enable Mission Audio'}
          className="w-8 h-8 rounded-lg bg-night-card hover:bg-night-surface border border-night-border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
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
