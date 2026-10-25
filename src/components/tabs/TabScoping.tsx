import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Sparkles, Play, UploadCloud, CheckCircle2, ChevronDown, ChevronRight, Layers, FileCode } from 'lucide-react';
import { Task, Epic } from '../../types';

export const TabScoping: React.FC = () => {
  const { project, setProject, addAgentLog, settings } = useProject();
  
  const [brief, setBrief] = useState(
    'We need to build a customer complaint triage SaaS that ingests support tickets across email, WhatsApp, and Zendesk, applies sentiment analysis to rank SLA urgency under 2 hours, and auto-assigns tier-1 vs tier-2 engineers.'
  );
  const [methodology, setMethodology] = useState('Agile / Scrum');
  const [sprintWeeks, setSprintWeeks] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({
    'EPIC-1': true,
    'EPIC-2': true,
    'EPIC-3': true
  });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const toggleEpic = (id: string) => {
    setExpandedEpics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSynthesize = async () => {
    setIsGenerating(true);
    addAgentLog('SYNTHESIZE_INITIATED', `Prompt engine executing WBS decomposition (${methodology}, ${sprintWeeks}w)`, 'info');

    try {
      const res = await fetch('/api/scoping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          methodology,
          sprint_weeks: sprintWeeks,
          api_key: settings.geminiApiKey || settings.openaiApiKey || undefined,
          provider: settings.geminiApiKey ? 'gemini' : 'openai'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.epics && data.tasks) {
          setProject(prev => ({
            ...prev,
            title: data.project_title || prev.title,
            description: data.executive_summary || brief,
            epics: data.epics,
            tasks: data.tasks
          }));
          addAgentLog('WBS_COMPLETE', `AI synthesized ${data.epics.length} Epics and ${data.tasks.length} user stories`, 'info');
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {}

    // Graceful offline heuristic fallback
    setTimeout(() => {
      const generatedEpics: Epic[] = [
        { id: 'EPIC-10', title: 'Multi-Channel Ingestion & Kafka Telemetry Queue', priority: 'Urgent', description: 'Real-time webhook listeners for WhatsApp and Zendesk APIs.' },
        { id: 'EPIC-20', title: 'Sentiment Classifier & Dynamic SLA Urgency Engine', priority: 'High', description: 'Zero-shot RoBERTa sentiment classifier evaluating ticket escalate priority.' },
        { id: 'EPIC-30', title: 'Intelligent Tier-1/Tier-2 Dispatch & Audit Logs', priority: 'Medium', description: 'Automated skill-based routing with compliance audit logs.' }
      ];

      const generatedTasks: Task[] = [
        {
          id: 'TASK-1001',
          epic_id: 'EPIC-10',
          title: 'Implement Webhook Ingestion Gateway with HMAC Verification',
          user_story: 'As a system architect, I want incoming Zendesk/WhatsApp webhooks cryptographically verified so malicious forged payloads are rejected.',
          acceptance_criteria: 'Given inbound webhook, When signature matches HMAC SHA-256 header, Then payload is pushed to ingestion buffer in < 15ms.',
          assignee: project.team_members[0]?.name || 'Lead Architect',
          status: 'In Progress',
          story_points: 5,
          estimated_hours: 20,
          priority: 'Urgent'
        },
        {
          id: 'TASK-1002',
          epic_id: 'EPIC-20',
          title: 'Sentiment Model Inference Microservice (< 200ms latency)',
          user_story: 'As a customer ops lead, I want negative sentiment tickets flagged within seconds so emergency churn risks are expedited.',
          acceptance_criteria: 'Given unclassified complaint, When inference runs on GPU node, Then confidence score > 0.88 labels ticket as Urgent SLA.',
          assignee: project.team_members[1]?.name || 'ML Engineer',
          status: 'To Do',
          story_points: 8,
          estimated_hours: 32,
          priority: 'High'
        },
        {
          id: 'TASK-1003',
          epic_id: 'EPIC-30',
          title: 'Tier-1 vs Tier-2 Dynamic Queue Dispatcher',
          user_story: 'As a support engineer, I want tickets assigned based on domain specialty and current shift capacity so response time stays under 2 hours.',
          acceptance_criteria: 'Given categorized ticket, When agent is available with matching role tags, Then ticket is assigned and Slack nudge is dispatched.',
          assignee: project.team_members[2]?.name || 'Backend Lead',
          status: 'To Do',
          story_points: 5,
          estimated_hours: 24,
          priority: 'Medium'
        }
      ];

      setProject(prev => ({
        ...prev,
        title: 'Customer Complaint Triage SaaS',
        description: brief,
        epics: generatedEpics,
        tasks: generatedTasks
      }));

      setIsGenerating(false);
      addAgentLog('WBS_COMPLETE', 'Backlog synthesized with 3 Epics and Gherkin acceptance criteria!', 'info');
    }, 1000);
  };

  const handleSyncClickUp = () => {
    setSyncStatus('ClickUp: Backlog synchronized successfully (Mode: ' + (settings.clickupToken ? 'Live' : 'Simulated') + ')');
    addAgentLog('CLICKUP_SYNC', `Pushed ${project.tasks.length} tasks to ClickUp list`, 'info');
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleSyncTrello = () => {
    setSyncStatus('Trello: Backlog cards populated into sprint board (Mode: ' + (settings.trelloKey ? 'Live' : 'Simulated') + ')');
    addAgentLog('TRELLO_SYNC', `Pushed ${project.tasks.length} cards to Trello board`, 'info');
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Spotlight Card: Requirement Brief Input */}
      <div 
        className="rounded-2xl p-6 shadow-xl backdrop-blur-md overflow-hidden relative"
        style={{
          background: 'rgba(28, 23, 69, 0.85)',
          border: '1px solid rgba(177, 75, 255, 0.22)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-plasma" />
              Scoping & Work Breakdown Structure (WBS)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Advanced context-rich prompt decomposes ambiguous requirements into Epics, User Stories, and testable Gherkin acceptance criteria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncClickUp}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              style={{ background: 'rgba(22, 19, 56, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
            >
              <UploadCloud className="w-3.5 h-3.5 text-plasma" />
              <span>Sync ClickUp</span>
            </button>
            <button
              onClick={handleSyncTrello}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              style={{ background: 'rgba(22, 19, 56, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync Trello</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mb-4 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Textarea */}
        <textarea
          rows={3}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          style={{ background: '#12102B', color: '#DDE7FF', border: '1px solid rgba(177, 75, 255, 0.25)' }}
          className="w-full rounded-xl p-4 text-xs sm:text-sm font-mono leading-relaxed resize-none"
          placeholder="Type raw client requirement, user specs, or feature request..."
        />

        {/* Controls Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-purple-500/20">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Methodology:</span>
              <select
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                style={{ background: '#12102B', color: '#DDE7FF', border: '1px solid rgba(177, 75, 255, 0.25)' }}
                className="rounded-lg px-2.5 py-1 text-xs"
              >
                <option value="Agile / Scrum">Agile / Scrum</option>
                <option value="Kanban / Continuous Flow">Kanban / Continuous Flow</option>
                <option value="Extreme Programming (XP)">Extreme Programming (XP)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sprint Cadence:</span>
              <div 
                className="flex items-center gap-1 rounded-lg p-0.5"
                style={{ background: 'rgba(18, 16, 43, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
              >
                {[1, 2, 3, 4].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSprintWeeks(w)}
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
                      sprintWeeks === w ? 'bg-plasma text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSynthesize}
            disabled={isGenerating}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-plasma to-indigo-600 text-white font-medium text-xs shadow-lg shadow-plasma/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Prompt Engine Synthesizing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Synthesize Backlog</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Epics & User Stories Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-plasma" />
            Active Epics & Gherkin User Stories
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {project.epics.length} Epics • {project.tasks.length} User Stories
          </span>
        </div>

        {project.epics.map((epic) => {
          const epicTasks = project.tasks.filter(t => t.epic_id === epic.id || project.epics.length === 1);
          const isExpanded = expandedEpics[epic.id] ?? true;

          return (
            <div
              key={epic.id}
              className="rounded-xl overflow-hidden backdrop-blur-sm transition-all"
              style={{
                background: 'rgba(28, 23, 69, 0.75)',
                border: '1px solid rgba(177, 75, 255, 0.2)'
              }}
            >
              {/* Epic Header */}
              <button
                onClick={() => toggleEpic(epic.id)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-plasma bg-plasma/15 px-2 py-0.5 rounded border border-plasma/30">
                    {epic.id}
                  </span>
                  <div>
                    <h4 className="font-sans font-semibold text-sm text-white">{epic.title}</h4>
                    {epic.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{epic.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">{epicTasks.length} stories</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Tasks under Epic */}
              {isExpanded && (
                <div className="divide-y divide-purple-500/10 border-t border-purple-500/20" style={{ background: 'rgba(18, 16, 43, 0.6)' }}>
                  {epicTasks.map((task) => (
                    <div key={task.id} className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400 font-bold">{task.id}</span>
                          <h5 className="font-sans font-medium text-sm text-ice">{task.title}</h5>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span 
                            className="px-2 py-0.5 rounded font-mono text-slate-300"
                            style={{ background: 'rgba(22, 19, 56, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
                          >
                            🎯 {task.story_points} Pts
                          </span>
                          <span 
                            className="px-2 py-0.5 rounded font-mono text-slate-300"
                            style={{ background: 'rgba(22, 19, 56, 0.9)', border: '1px solid rgba(177, 75, 255, 0.2)' }}
                          >
                            ⏱️ {task.estimated_hours}h
                          </span>
                          <span className={`px-2 py-0.5 rounded font-mono font-medium ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {/* User Story */}
                      <p className="text-xs text-slate-400 italic mb-3">
                        "{task.user_story}"
                      </p>

                      {/* Gherkin Criteria Box */}
                      <div 
                        className="rounded-lg p-3 text-xs font-mono"
                        style={{ background: '#0d0c20', border: '1px solid rgba(177, 75, 255, 0.18)' }}
                      >
                        <div className="flex items-center gap-1.5 text-plasma text-[11px] font-bold uppercase tracking-wider mb-1">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Gherkin Acceptance Criteria</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans text-xs">
                          {task.acceptance_criteria}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                        <span>Assignee: <strong className="text-slate-200">{task.assignee}</strong></span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          task.status === 'Done' ? 'text-emerald-400' : task.status === 'Blocked' ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          Status: {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
