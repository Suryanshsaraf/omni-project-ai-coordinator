import React from 'react';
import { useProject } from './context/ProjectContext';
import { MissionBackground } from './components/global/MissionBackground';
import { MissionOrb } from './components/global/MissionOrb';
import { TopBar } from './components/global/TopBar';
import { DockNav } from './components/global/DockNav';
import { SplashCursor } from './components/global/SplashCursor';

import { TabScoping } from './components/tabs/TabScoping';
import { TabKanban } from './components/tabs/TabKanban';
import { TabRisk } from './components/tabs/TabRisk';
import { TabAgent } from './components/tabs/TabAgent';
import { TabBrief } from './components/tabs/TabBrief';
import { TabSettings } from './components/tabs/TabSettings';

export const App: React.FC = () => {
  const { activeTab, project, ragStatus } = useProject();

  const totalPoints = project.tasks.reduce((sum, t) => sum + t.story_points, 0);
  const donePoints = project.tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + t.story_points, 0);
  const velocityPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  const blockedCount = project.tasks.filter(t => t.status === 'Blocked').length;

  return (
    <div className="relative min-h-screen bg-night-base text-ice flex flex-col selection:bg-plasma/30">
      {/* Background Simulation */}
      <MissionBackground />
      <SplashCursor />

      {/* Header Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Hero Section: Project Identity + Interactive Energy Orb */}
        <section className="mb-8 rounded-3xl bg-gradient-to-b from-night-surface/90 to-night-card/70 border border-night-border p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Identity & Metrics (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-plasma animate-ping" />
                <span className="text-xs font-mono uppercase tracking-widest text-plasma font-semibold">
                  Active Mission Scope • {project.methodology}
                </span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                {project.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {project.description}
              </p>

              {/* Quick Mission Metrics */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-night-base/80 border border-night-border flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Velocity:</span>
                  <strong className="text-white tabular-nums">{velocityPct}%</strong>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-night-base/80 border border-night-border flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Tasks:</span>
                  <strong className="text-white tabular-nums">{project.tasks.length}</strong>
                </div>

                <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono ${
                  blockedCount > 0 ? 'bg-signal-red/15 border-signal-red/30 text-signal-red' : 'bg-night-base/80 border-night-border text-slate-400'
                }`}>
                  <span>Blockers:</span>
                  <strong className="tabular-nums">{blockedCount}</strong>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-night-base/80 border border-night-border flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Team:</span>
                  <strong className="text-white tabular-nums">{project.team_members.length} Leads</strong>
                </div>
              </div>
            </div>

            {/* Interactive Hologram / Energy Orb (4 cols) */}
            <div className="lg:col-span-4 flex justify-center">
              <MissionOrb />
            </div>
          </div>
        </section>

        {/* Tab Router Content */}
        <section className="relative z-10 transition-all duration-300">
          {activeTab === 'scoping' && <TabScoping />}
          {activeTab === 'kanban' && <TabKanban />}
          {activeTab === 'risk' && <TabRisk />}
          {activeTab === 'agent' && <TabAgent />}
          {activeTab === 'brief' && <TabBrief />}
          {activeTab === 'settings' && <TabSettings />}
        </section>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <DockNav />
    </div>
  );
};
