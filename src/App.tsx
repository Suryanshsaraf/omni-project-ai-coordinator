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
    <div className="relative min-h-screen bg-[#12102B] text-[#DDE7FF] flex flex-col selection:bg-purple-600/30">
      {/* Background Simulation */}
      <MissionBackground />
      <SplashCursor />

      {/* Header Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full pb-28">
        {/* Hero Section: Project Identity + Interactive Energy Orb */}
        <section 
          className="mb-8 rounded-3xl p-6 sm:p-8 overflow-hidden relative"
          style={{
            background: 'linear-gradient(180deg, rgba(28, 23, 69, 0.9) 0%, rgba(22, 19, 56, 0.75) 100%)',
            border: '1px solid rgba(177, 75, 255, 0.22)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
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
                <div 
                  className="px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono"
                  style={{ background: 'rgba(18, 16, 43, 0.85)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
                >
                  <span className="text-slate-400">Velocity:</span>
                  <strong className="text-white tabular-nums">{velocityPct}%</strong>
                </div>

                <div 
                  className="px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono"
                  style={{ background: 'rgba(18, 16, 43, 0.85)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
                >
                  <span className="text-slate-400">Tasks:</span>
                  <strong className="text-white tabular-nums">{project.tasks.length}</strong>
                </div>

                <div 
                  className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono ${
                    blockedCount > 0 ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'text-slate-400'
                  }`}
                  style={{ border: blockedCount > 0 ? '1px solid rgba(255, 59, 92, 0.4)' : '1px solid rgba(177, 75, 255, 0.2)', background: blockedCount > 0 ? 'rgba(255, 59, 92, 0.15)' : 'rgba(18, 16, 43, 0.85)' }}
                >
                  <span>Blockers:</span>
                  <strong className="tabular-nums font-bold">{blockedCount}</strong>
                </div>

                <div 
                  className="px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono"
                  style={{ background: 'rgba(18, 16, 43, 0.85)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
                >
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
