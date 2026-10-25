import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Bot, Terminal, Send, CheckCircle2, RefreshCw, Copy, Check } from 'lucide-react';

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Agent Status Hero */}
      <div 
        className="rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'rgba(28, 23, 69, 0.85)', border: '1px solid rgba(177, 75, 255, 0.22)' }}
      >
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-plasma to-indigo-600 flex items-center justify-center shadow-lg shadow-plasma/30 border border-white/20">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-night-surface animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Autonomous Digital PM Coordinator</h2>
            <p className="text-xs text-slate-400 mt-1">
              Virtual agent actively monitoring sprint velocity, unblocking dependencies, and balancing cognitive load.
            </p>
          </div>
        </div>

        <button
          onClick={handleManualAudit}
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-2"
          style={{ background: 'rgba(22, 19, 56, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
        >
          <RefreshCw className="w-3.5 h-3.5 text-plasma" />
          <span>Execute Telemetry Audit</span>
        </button>
      </div>

      {/* Team Nudge Station */}
      <div 
        className="rounded-2xl p-6 shadow-xl space-y-4"
        style={{ background: 'rgba(28, 23, 69, 0.85)', border: '1px solid rgba(177, 75, 255, 0.22)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-plasma" />
              Automated Team Unblock Nudges
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Context-rich messages prepared automatically for blocked assignees and stakeholders.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {nudges.length} pending
          </span>
        </div>

        {nudges.length === 0 ? (
          <div 
            className="rounded-xl p-6 text-center text-xs text-slate-400"
            style={{ background: 'rgba(22, 19, 56, 0.8)', border: '1px solid rgba(177, 75, 255, 0.15)' }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
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
                  className="rounded-xl p-4 space-y-2.5 transition-all"
                  style={{ background: 'rgba(22, 19, 56, 0.85)', border: '1px solid rgba(177, 75, 255, 0.18)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
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

                  <div 
                    className="rounded-lg p-3 text-xs text-slate-300 font-mono leading-relaxed"
                    style={{ background: '#100e26', border: '1px solid rgba(177, 75, 255, 0.15)' }}
                  >
                    "{nudge.message}"
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(nudge.taskId, nudge.message)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      style={{ background: 'rgba(18, 16, 43, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleSend(nudge.taskId)}
                      disabled={isSent}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isSent
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden font-mono text-xs"
        style={{ background: '#0a091a', border: '1px solid rgba(177, 75, 255, 0.25)' }}
      >
        <div 
          className="px-4 py-2.5 border-b flex items-center justify-between"
          style={{ background: 'rgba(22, 19, 56, 0.9)', borderColor: 'rgba(177, 75, 255, 0.2)' }}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-plasma" />
            <span className="font-bold text-slate-300">OMNI-COORDINATOR-RUNTIME // LIVE CONSOLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
        </div>

        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {agentLogs.map((log) => {
            const levelColor = log.level === 'urgent'
              ? 'text-rose-400'
              : log.level === 'warning'
              ? 'text-amber-400'
              : 'text-emerald-400';

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
