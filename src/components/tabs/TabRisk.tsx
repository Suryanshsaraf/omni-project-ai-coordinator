import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Risk } from '../../types';
import { getWorkloadStats, findBottlenecks } from '../../utils/helpers';
import { AlertTriangle, AlertOctagon, ShieldCheck, Flame, User } from 'lucide-react';

export const TabRisk: React.FC = () => {
  const { project } = useProject();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(project.risks[0] || null);

  const workload = getWorkloadStats(project.tasks, project.team_members);
  const bottlenecks = findBottlenecks(project.tasks);

  const criticalCount = project.risks.filter(r => r.severity === 'Critical').length;
  const highCount = project.risks.filter(r => r.severity === 'High').length;
  const moderateCount = project.risks.filter(r => r.severity === 'Moderate').length;
  const lowCount = project.risks.filter(r => r.severity === 'Low').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div 
          className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm"
          style={{ background: 'rgba(255, 59, 92, 0.12)', border: '1px solid rgba(255, 59, 92, 0.35)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-rose-400">
                Critical Bottleneck Active
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Task <strong>[{bottlenecks[0].taskId}] {bottlenecks[0].title}</strong> is blocking {bottlenecks[0].downstreamCount} dependent paths.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Escalation Required
          </span>
        </div>
      )}

      {/* Main Grid: 5x5 Heatmap & Radar Sweep + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 5x5 Interactive Risk Matrix (7 cols) */}
        <div 
          className="lg:col-span-7 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden"
          style={{ background: 'rgba(28, 23, 69, 0.85)', border: '1px solid rgba(177, 75, 255, 0.22)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-plasma" />
                Dynamic Probability × Impact Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Interactive 5×5 radar grid. Click any pulsing quantum node to inspect mitigation.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Score = P × I (1-25)</span>
          </div>

          {/* 5x5 Grid Container */}
          <div className="relative aspect-square max-w-[440px] mx-auto p-2">
            {/* Radar Sweep Effect */}
            <div className="absolute inset-2 rounded-xl pointer-events-none overflow-hidden z-10 opacity-25">
              <div 
                className="w-full h-full rounded-full border border-plasma/40 animate-radar-sweep origin-center"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(177, 75, 255, 0.5) 0deg, transparent 60deg, transparent 360deg)'
                }}
              />
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-5 grid-rows-5 gap-1.5 h-full w-full">
              {[5, 4, 3, 2, 1].map((impact) =>
                [1, 2, 3, 4, 5].map((prob) => {
                  const score = impact * prob;
                  const isCritical = score >= 16;
                  const isHigh = score >= 12 && score < 16;
                  const isModerate = score >= 6 && score < 12;

                  const cellStyle = isCritical
                    ? { background: 'rgba(255, 59, 92, 0.16)', borderColor: 'rgba(255, 59, 92, 0.35)' }
                    : isHigh
                    ? { background: 'rgba(255, 178, 36, 0.14)', borderColor: 'rgba(255, 178, 36, 0.3)' }
                    : isModerate
                    ? { background: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.22)' }
                    : { background: 'rgba(46, 230, 166, 0.1)', borderColor: 'rgba(46, 230, 166, 0.22)' };

                  const matchingRisks = project.risks.filter(
                    r => r.probability === prob && r.impact === impact
                  );

                  return (
                    <div
                      key={`${prob}-${impact}`}
                      style={cellStyle}
                      className="relative rounded-lg border flex items-center justify-center transition-all"
                    >
                      <span className="absolute top-1 left-1 text-[9px] font-mono text-slate-500 font-bold select-none">
                        {score}
                      </span>

                      {matchingRisks.map((r) => {
                        const isSelected = selectedRisk?.id === r.id;
                        const dotClass = r.severity === 'Critical'
                          ? 'bg-rose-500 text-white shadow-rose-500/80 ring-rose-400'
                          : r.severity === 'High'
                          ? 'bg-amber-500 text-black shadow-amber-500/80 ring-amber-400'
                          : 'bg-emerald-400 text-black shadow-emerald-400/80 ring-emerald-300';

                        return (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRisk(r)}
                            className={`relative z-20 w-8 h-8 rounded-full font-mono font-bold text-[10px] flex items-center justify-center transition-transform shadow-lg ${dotClass} ${
                              isSelected ? 'scale-125 ring-2 ring-white z-30' : 'hover:scale-110'
                            }`}
                            title={`${r.id}: ${r.description}`}
                          >
                            {r.id.replace('RSK-', '').replace('RISK-', '')}
                            {r.severity === 'Critical' && (
                              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75 pointer-events-none" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Grid Axes Labels */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 px-1">
              <span>← Rare (P:1)</span>
              <span className="font-bold text-slate-300">PROBABILITY →</span>
              <span>Almost Certain (P:5) →</span>
            </div>
          </div>
        </div>

        {/* Right Column: Risk Detail Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div 
            className="rounded-2xl p-5 shadow-xl backdrop-blur-md"
            style={{ background: 'rgba(28, 23, 69, 0.85)', border: '1px solid rgba(177, 75, 255, 0.22)' }}
          >
            {selectedRisk ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded text-plasma"
                      style={{ background: 'rgba(177, 75, 255, 0.15)', border: '1px solid rgba(177, 75, 255, 0.3)' }}
                    >
                      {selectedRisk.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedRisk.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : selectedRisk.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {selectedRisk.severity} (Score: {selectedRisk.score})
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">P:{selectedRisk.probability} × I:{selectedRisk.impact}</span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-white">
                  {selectedRisk.description}
                </h4>

                <div 
                  className="rounded-xl p-3.5 space-y-2 text-xs"
                  style={{ background: '#0f0e24', border: '1px solid rgba(177, 75, 255, 0.18)' }}
                >
                  <div className="flex items-center gap-1.5 text-plasma font-bold text-[11px] uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Actionable Mitigation Protocol</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {selectedRisk.mitigation_strategy}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Assigned Owner: <strong className="text-slate-200">{selectedRisk.owner}</strong></span>
                  <span className="font-mono text-slate-300">Status: {selectedRisk.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click a node on the matrix to view mitigation.</p>
            )}
          </div>

          {/* Severity Distribution Pills */}
          <div 
            className="rounded-2xl p-5 shadow-xl"
            style={{ background: 'rgba(28, 23, 69, 0.85)', border: '1px solid rgba(177, 75, 255, 0.22)' }}
          >
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">
              Severity Distribution
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(255, 59, 92, 0.12)', border: '1px solid rgba(255, 59, 92, 0.3)' }}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Critical</span>
                  <p className="font-display font-bold text-xl text-rose-400 tabular-nums">{criticalCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              </div>

              <div 
                className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(255, 178, 36, 0.12)', border: '1px solid rgba(255, 178, 36, 0.3)' }}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">High</span>
                  <p className="font-display font-bold text-xl text-amber-400 tabular-nums">{highCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>

              <div 
                className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)' }}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Moderate</span>
                  <p className="font-display font-bold text-xl text-yellow-400 tabular-nums">{moderateCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              </div>

              <div 
                className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(46, 230, 166, 0.1)', border: '1px solid rgba(46, 230, 166, 0.25)' }}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Low</span>
                  <p className="font-display font-bold text-xl text-emerald-400 tabular-nums">{lowCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wrike Capacity & Workload Balancing Section */}
      <div 
        className="rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4"
        style={{ background: 'rgba(28, 23, 69, 0.85)', border: '1px solid rgba(177, 75, 255, 0.22)' }}
      >
        <div>
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Smart Resource Workload Balancing (Wrike Optimization)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates weekly allocated story hours against nominal 40h capacity. Highlights burnout risks that overflow 100%.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {workload.map((m) => {
            const barWidth = Math.min(m.loadPct, 100);
            const overflowWidth = Math.max(0, m.loadPct - 100);

            return (
              <div 
                key={m.name} 
                className="space-y-1.5 p-3 rounded-xl"
                style={{ background: 'rgba(22, 19, 56, 0.85)', border: '1px solid rgba(177, 75, 255, 0.18)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-white">{m.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({m.role})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300 tabular-nums">
                      {m.allocatedHours}h / {m.capacityHours}h
                    </span>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      m.isOverloaded
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {m.loadPct}%
                    </span>
                  </div>
                </div>

                {/* Overflow Progress Bar */}
                <div 
                  className="w-full h-3 rounded-full overflow-hidden flex relative"
                  style={{ background: '#12102B' }}
                >
                  <div
                    className={`h-full transition-all duration-500 ${
                      m.isOverloaded ? 'bg-amber-400' : 'bg-plasma'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  {overflowWidth > 0 && (
                    <div
                      className="h-full bg-rose-500 animate-pulse"
                      style={{ width: `${Math.min(overflowWidth, 40)}%` }}
                      title="Overloaded past 100% capacity"
                    />
                  )}
                </div>

                {m.isOverloaded && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Burnout Warning: Exceeds sustainable velocity by {m.allocatedHours - m.capacityHours} hours. Rebalance advised.</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
