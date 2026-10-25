import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Risk, RiskSeverity } from '../../types';
import { getWorkloadStats, findBottlenecks } from '../../utils/helpers';
import { AlertTriangle, AlertOctagon, ShieldCheck, Flame, User, X, Info } from 'lucide-react';

export const TabRisk: React.FC = () => {
  const { project } = useProject();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(project.risks[0] || null);

  const workload = getWorkloadStats(project.tasks, project.team_members);
  const bottlenecks = findBottlenecks(project.tasks);

  // Group risks by severity
  const criticalCount = project.risks.filter(r => r.severity === 'Critical').length;
  const highCount = project.risks.filter(r => r.severity === 'High').length;
  const moderateCount = project.risks.filter(r => r.severity === 'Moderate').length;
  const lowCount = project.risks.filter(r => r.severity === 'Low').length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Banner: Bottlenecks & Executive Warnings */}
      {bottlenecks.length > 0 && (
        <div className="rounded-xl bg-signal-red/10 border border-signal-red/30 p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-signal-red/20 flex items-center justify-center text-signal-red shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-signal-red">
                Critical Bottleneck Active
              </h3>
              <p className="text-xs text-slate-200">
                Task <strong>[{bottlenecks[0].taskId}] {bottlenecks[0].title}</strong> is blocking {bottlenecks[0].downstreamCount} dependent paths.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-signal-red/20 text-signal-red border border-signal-red/30">
            Escalation Required
          </span>
        </div>
      )}

      {/* Main Grid: 5x5 Heatmap & Radar Sweep + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 5x5 Interactive Risk Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-night-surface/80 border border-night-border p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-plasma" />
                Dynamic Probability × Impact Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Interactive 5×5 radar grid. Click any pulsing quantum node to inspect mitigation.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Score = P × I (1-25)</span>
          </div>

          {/* 5x5 Grid Container */}
          <div className="relative aspect-square max-w-[460px] mx-auto p-2">
            {/* Radar Sweep Effect */}
            <div className="absolute inset-2 rounded-xl pointer-events-none overflow-hidden z-10 opacity-30">
              <div 
                className="w-full h-full rounded-full border border-plasma/40 animate-radar-sweep origin-center"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(177, 75, 255, 0.4) 0deg, transparent 60deg, transparent 360deg)'
                }}
              />
            </div>

            {/* Grid Cells (5 rows for Impact 5 to 1, 5 cols for Prob 1 to 5) */}
            <div className="grid grid-cols-5 grid-rows-5 gap-1.5 h-full w-full">
              {[5, 4, 3, 2, 1].map((impact) =>
                [1, 2, 3, 4, 5].map((prob) => {
                  const score = impact * prob;
                  const isCritical = score >= 16;
                  const isHigh = score >= 12 && score < 16;
                  const isModerate = score >= 6 && score < 12;

                  // Background tint based on severity zone
                  const cellBg = isCritical
                    ? 'bg-signal-red/15 hover:bg-signal-red/25 border-signal-red/30'
                    : isHigh
                    ? 'bg-signal-amber/15 hover:bg-signal-amber/25 border-signal-amber/30'
                    : isModerate
                    ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20'
                    : 'bg-signal-green/10 hover:bg-signal-green/20 border-signal-green/20';

                  // Check if any risk matches this cell
                  const matchingRisks = project.risks.filter(
                    r => r.probability === prob && r.impact === impact
                  );

                  return (
                    <div
                      key={`${prob}-${impact}`}
                      className={`relative rounded-lg border flex items-center justify-center transition-all ${cellBg}`}
                    >
                      {/* Cell Coordinate watermark */}
                      <span className="absolute top-1 left-1 text-[9px] font-mono text-slate-600 font-bold select-none">
                        {score}
                      </span>

                      {/* Render Risk Nodes */}
                      {matchingRisks.map((r) => {
                        const isSelected = selectedRisk?.id === r.id;
                        const dotColor = r.severity === 'Critical'
                          ? 'bg-signal-red text-white shadow-signal-red/80'
                          : r.severity === 'High'
                          ? 'bg-signal-amber text-black shadow-signal-amber/80'
                          : 'bg-signal-green text-black shadow-signal-green/80';

                        return (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRisk(r)}
                            className={`relative z-20 w-8 h-8 rounded-full font-mono font-bold text-[10px] flex items-center justify-center transition-transform shadow-lg ${dotColor} ${
                              isSelected ? 'scale-125 ring-2 ring-white z-30' : 'hover:scale-110'
                            } ${r.severity === 'Critical' ? 'animate-bounce' : ''}`}
                            title={`${r.id}: ${r.description}`}
                          >
                            {r.id.replace('RSK-', '').replace('RISK-', '')}

                            {/* Pulsing ring for critical */}
                            {r.severity === 'Critical' && (
                              <span className="absolute inset-0 rounded-full bg-signal-red animate-ping opacity-75 pointer-events-none" />
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

        {/* Right Column: Risk Detail Panel & Severity Donut (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selected Risk Inspection Card */}
          <div className="rounded-2xl bg-night-surface border border-night-border p-5 shadow-xl backdrop-blur-md">
            {selectedRisk ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-plasma/15 text-plasma border border-plasma/30">
                      {selectedRisk.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedRisk.severity === 'Critical'
                        ? 'bg-signal-red/20 text-signal-red'
                        : selectedRisk.severity === 'High'
                        ? 'bg-signal-amber/20 text-signal-amber'
                        : 'bg-signal-green/20 text-signal-green'
                    }`}>
                      {selectedRisk.severity} (Score: {selectedRisk.score})
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">P:{selectedRisk.probability} × I:{selectedRisk.impact}</span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-white">
                  {selectedRisk.description}
                </h4>

                <div className="rounded-xl bg-night-base p-3.5 border border-night-border/70 space-y-2 text-xs">
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
          <div className="rounded-2xl bg-night-surface border border-night-border p-5 shadow-xl">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">
              Severity Distribution
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-signal-red/10 border border-signal-red/20 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Critical</span>
                  <p className="font-display font-bold text-xl text-signal-red tabular-nums">{criticalCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-signal-red animate-ping" />
              </div>

              <div className="rounded-xl bg-signal-amber/10 border border-signal-amber/20 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">High</span>
                  <p className="font-display font-bold text-xl text-signal-amber tabular-nums">{highCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-signal-amber" />
              </div>

              <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Moderate</span>
                  <p className="font-display font-bold text-xl text-yellow-400 tabular-nums">{moderateCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              </div>

              <div className="rounded-xl bg-signal-green/10 border border-signal-green/20 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Low</span>
                  <p className="font-display font-bold text-xl text-signal-green tabular-nums">{lowCount}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-signal-green" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wrike Capacity & Workload Balancing Section */}
      <div className="rounded-2xl bg-night-surface/90 border border-night-border p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-signal-amber" />
              Smart Resource Workload Balancing (Wrike Optimization)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates weekly allocated story hours against nominal 40h capacity. Highlights burnout risks that overflow 100%.
            </p>
          </div>
        </div>

        {/* Member Capacity Bars */}
        <div className="space-y-4 pt-2">
          {workload.map((m) => {
            const barWidth = Math.min(m.loadPct, 100);
            const overflowWidth = Math.max(0, m.loadPct - 100);

            return (
              <div key={m.name} className="space-y-1.5 p-3 rounded-xl bg-night-card border border-night-border/70">
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
                        ? 'bg-signal-red/20 text-signal-red border border-signal-red/30'
                        : 'bg-signal-green/20 text-signal-green'
                    }`}>
                      {m.loadPct}%
                    </span>
                  </div>
                </div>

                {/* Overflow Progress Bar */}
                <div className="w-full h-3 rounded-full bg-night-base overflow-hidden flex relative">
                  {/* Nominal capacity bar up to 100% */}
                  <div
                    className={`h-full transition-all duration-500 ${
                      m.isOverloaded ? 'bg-signal-amber' : 'bg-plasma'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  {/* Visibly Overflowing Past 100% */}
                  {overflowWidth > 0 && (
                    <div
                      className="h-full bg-signal-red animate-pulse"
                      style={{ width: `${Math.min(overflowWidth, 40)}%` }}
                      title="Overloaded past 100% capacity"
                    />
                  )}
                </div>

                {/* Overload Callout */}
                {m.isOverloaded && (
                  <p className="text-[11px] text-signal-red flex items-center gap-1 mt-1 font-medium">
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
