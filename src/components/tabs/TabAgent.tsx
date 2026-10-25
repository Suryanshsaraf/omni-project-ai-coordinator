import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Bot, Terminal, Send, CheckCircle2, AlertOctagon, RefreshCw, Copy, Check } from 'lucide-react';

export const TabAgent: React.FC = () => {
  const { agentLogs, nudges, sendNudge, addAgentLog } = useProject();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSend = (id: string) => {
    sendNudge(id);
    setSentMap(prev => ({ ...prev, [id]: true }));
  };

  const handleManualAudit = () => {
    addAgentLog('MANUAL_AUDIT', 'User triggered autonomous full-board telemetry sweep.', 'info');
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Agent Status Hero */}
      <div className="rounded-2xl bg-night-surface/90 border border-night-border p-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-plasma to-indigo-600 flex items-center justify-center shadow-lg shadow-plasma/30 border border-white/20">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-signal-green ring-4 ring-night-surface animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Autonomous Digital PM Coordinator</h2>
            <p className="text-xs text-slate-400">
              Virtual agent actively monitoring sprint velocity, unblocking dependencies, and balancing cognitive load.
            </p>
          </div>
        </div>

        <button
          onClick={handleManualAudit}
          className="px-4 py-2 rounded-xl bg-night-card hover:bg-night-panel border border-night-border text-xs font-medium text-ice hover:text-white transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-plasma" />
          <span>Execute Telemetry Audit</span>
        </button>
      </div>

      {/* Team Nudge Station */}
      <div className="rounded-2xl bg-night-surface/80 border border-night-border p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-plasma" />
              Automated Team Unblock Nudges
            </h3>
            <p className="text-xs text-slate-400">
              Context-rich messages prepared automatically for blocked assignees and stakeholders.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {nudges.length} pending
          </span>
        </div>

        {nudges.length === 0 ? (
          <div className="rounded-xl bg-night-card p-6 text-center text-xs text-slate-400 border border-night-border">
            <CheckCircle2 className="w-6 h-6 text-signal-green mx-auto mb-2" />
            <span>No blocked tasks requiring nudges right now. Sprint execution nominal.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {nudges.map((nudge) => {
              const isSent = sentMap[nudge.taskId];
              const isCopied = copiedId === nudge.taskId;

              return (
                <div
                  key={nudge.taskId}
                  className="rounded-xl bg-night-card border border-night-border p-4 space-y-2.5 transition-all hover:border-plasma/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-signal-red bg-signal-red/10 px-2 py-0.5 rounded border border-signal-red/20">
                        {nudge.taskId}
                      </span>
                      <span className="font-sans font-medium text-xs text-white">
                        {nudge.taskTitle}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Recipient: <strong className="text-slate-200">{nudge.assignee}</strong>
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="rounded-lg bg-night-base p-3 border border-night-border/70 text-xs text-slate-300 font-mono leading-relaxed">
                    "{nudge.message}"
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(nudge.taskId, nudge.message)}
                      className="px-3 py-1.5 rounded-lg bg-night-surface hover:bg-night-panel border border-night-border text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-signal-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleSend(nudge.taskId)}
                      disabled={isSent}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isSent
                          ? 'bg-signal-green/20 text-signal-green border border-signal-green/30'
                          : 'bg-plasma hover:bg-plasma/90 text-white shadow-md shadow-plasma/30'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Transmitted</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Transmit Nudge</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terminal Style Agent Console */}
      <div className="rounded-2xl bg-black/90 border border-night-border shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-night-surface/90 border-b border-night-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-plasma" />
            <span className="font-bold text-slate-300">OMNI-COORDINATOR-RUNTIME // LIVE CONSOLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
        </div>

        {/* Terminal Logs Body */}
        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {agentLogs.map((log) => {
            const levelColor = log.level === 'urgent'
              ? 'text-signal-red'
              : log.level === 'warning'
              ? 'text-signal-amber'
              : 'text-signal-green';

            return (
              <div key={log.id} className="flex items-start gap-2 text-slate-300 leading-relaxed hover:bg-white/[0.02] p-1 rounded">
                <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                <span className={`font-bold select-none ${levelColor}`}>
                  [{log.type}]
                </span>
                <span className="text-slate-300 flex-1">{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
