import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { TrendingUp, Copy, Check, Download, AlertOctagon, CheckCircle2, FileText } from 'lucide-react';

export const TabBrief: React.FC = () => {
  const { project, ragStatus } = useProject();
  const [copied, setCopied] = useState(false);

  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const blockedTasks = project.tasks.filter(t => t.status === 'Blocked');
  const inProgressTasks = project.tasks.filter(t => t.status === 'In Progress');
  const totalStoryPoints = project.tasks.reduce((sum, t) => sum + t.story_points, 0);
  const donePoints = doneTasks.reduce((sum, t) => sum + t.story_points, 0);
  const completionPct = totalStoryPoints > 0 ? Math.round((donePoints / totalStoryPoints) * 100) : 0;

  const ragPillColor = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    red: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
  }[ragStatus];

  const generateMarkdown = () => {
    return `# C-SUITE EXECUTIVE STATUS BRIEF: ${project.title.toUpperCase()}
**Reporting Date:** ${new Date().toISOString().split('T')[0]}
**RAG Status:** ${ragStatus.toUpperCase()} (${ragStatus === 'green' ? 'Nominal Flow' : ragStatus === 'amber' ? 'Attention Advised' : 'Critical Drift'})
**Sprint Velocity / Progress:** ${completionPct}% (${donePoints}/${totalStoryPoints} Points)
**Active Methodology:** ${project.methodology} (${project.sprint_duration_weeks}-week cadence)

---

## 1. Executive Summary & Accomplishments
${doneTasks.length > 0 
  ? doneTasks.map(t => `- [DONE] **${t.title}** (${t.story_points} Pts) — Completed by ${t.assignee}`).join('\n')
  : '- Sprint kickoff underway. Baseline epics prioritized.'}

## 2. In-Flight Execution
${inProgressTasks.map(t => `- [IN PROGRESS] **${t.title}** (${t.story_points} Pts, ${t.estimated_hours}h est.) — Lead: ${t.assignee}`).join('\n')}

## 3. Critical Blockers & Escalation Targets
${blockedTasks.length > 0
  ? blockedTasks.map(t => `- **[BLOCKED - ${t.id}] ${t.title}**\n  *Reason:* ${t.blocker_reason}\n  *Assignee:* ${t.assignee}\n  *Recommended Escalation:* Coordinate unblocking in today's standup with infrastructure leadership.`).join('\n\n')
  : '- Zero blockers recorded. Critical path proceeding on schedule.'}

## 4. Key Risk Horizon & Strategic Mitigations
${project.risks.filter(r => r.severity === 'Critical' || r.severity === 'High').map(r => `- **[${r.severity.toUpperCase()} RISK - ${r.id}] ${r.description}** (Score: ${r.score})\n  *Mitigation Strategy:* ${r.mitigation_strategy}\n  *Owner:* ${r.owner}`).join('\n\n')}

---
*Generated autonomously by OmniProject AI Coordinator.*`;
  };

  const handleExport = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive-Brief-${project.id}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Brief Header & Action Bar */}
      <div 
        className="rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 transition-all duration-300"
        style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-border)' }}
      >
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-plasma" />
            C-Suite Executive Status Brief
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized briefing document for VP of Product, Engineering Leadership, and C-Suite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-plasma flex items-center gap-1.5 transition-colors"
            style={{ background: 'var(--app-surface-bg)', border: '1px solid var(--app-border)' }}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Brief'}</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-plasma hover:bg-plasma/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-plasma/30 transition-all hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Editorial Document Body */}
      <div 
        className="rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 text-ice transition-all duration-300"
        style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-border)' }}
      >
        {/* Document Title & Meta */}
        <div className="pb-6 border-b border-neutral-700/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Technical Program Management Brief
            </span>
            <h1 className="font-display font-bold text-xl sm:text-2xl mt-1">
              {project.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {project.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider border ${ragPillColor}`}>
              RAG: {ragStatus}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Sprint Velocity: {completionPct}%
            </span>
          </div>
        </div>

        {/* Section 1: Accomplishments */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-emerald-400 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            1. Key Milestones Completed
          </h3>
          <div 
            className="rounded-xl p-4 space-y-2 text-xs transition-colors"
            style={{ background: 'var(--app-surface-bg)', border: '1px solid var(--app-border)' }}
          >
            {doneTasks.length === 0 ? (
              <p className="text-slate-400 italic">No tasks marked Done in this sprint yet.</p>
            ) : (
              doneTasks.map(t => (
                <div key={t.id} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>[{t.id}] {t.title}</strong> — Delivered by {t.assignee} ({t.story_points} Pts)</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Critical Blockers */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-rose-400 uppercase tracking-wide flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            2. Critical Blockers & Escalations Required
          </h3>
          <div 
            className="rounded-xl p-4 space-y-2.5 text-xs transition-colors"
            style={{ background: 'var(--app-surface-bg)', border: '1px solid var(--app-border)' }}
          >
            {blockedTasks.length === 0 ? (
              <p className="text-emerald-400 font-semibold">No active blockers. Critical path is clear.</p>
            ) : (
              blockedTasks.map(t => (
                <div 
                  key={t.id} 
                  className="p-3 rounded-lg text-rose-400 space-y-1"
                  style={{ background: 'rgba(255, 59, 92, 0.12)', border: '1px solid rgba(255, 59, 92, 0.3)' }}
                >
                  <p className="font-bold">[{t.id}] {t.title}</p>
                  <p className="text-slate-200">Impact: Halts subsequent sprint deliverables. Reason: <em>{t.blocker_reason}</em></p>
                  <p className="text-[11px] font-mono text-slate-400">Assignee: {t.assignee} • Escalation Target: VP of Engineering</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Risk Summary */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" />
            3. Predictive Risk Horizon & Mitigations
          </h3>
          <div 
            className="rounded-xl p-4 space-y-2 text-xs transition-colors"
            style={{ background: 'var(--app-surface-bg)', border: '1px solid var(--app-border)' }}
          >
            {project.risks.filter(r => r.severity === 'Critical' || r.severity === 'High').map(r => (
              <div key={r.id} className="p-2.5 border-b border-neutral-700/15 last:border-0">
                <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
                  <span>[{r.id}] {r.description}</span>
                  <span className="font-mono text-amber-400 font-bold">Score: {r.score}</span>
                </div>
                <p className="text-slate-400">Mitigation: {r.mitigation_strategy} (Owner: {r.owner})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
