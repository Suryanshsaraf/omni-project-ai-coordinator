import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Key, Sliders, Eye, EyeOff, Save, CheckCircle2, RotateCcw, BookOpen, Layers } from 'lucide-react';

export const TabSettings: React.FC = () => {
  const { settings, updateSettings, resetToInitial, addAgentLog } = useProject();
  const [form, setForm] = useState({ ...settings });
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showClickUp, setShowClickUp] = useState(false);
  const [showTrello, setShowTrello] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const promptCards = [
    {
      title: '1. Scoping & WBS Architecture',
      subtitle: 'Enforces Epics, User Stories & Gherkin Given-When-Then',
      prompt: `You are a Principal Agile Project Manager and Certified Scrum Master (PMI-ACP / CPMAI).
Your task is to take an unstructured project requirement brief and transform it into a mathematically coherent, high-velocity Work Breakdown Structure (WBS).

Strict Requirements:
1. Break down into 2-4 major Epics.
2. Under each Epic, create detailed User Stories following the format: 'As a [role], I want [action], so that [business value]'.
3. Every task MUST have Gherkin-style Acceptance Criteria: 'Given [context], When [action], Then [measurable outcome]'.
4. Assign realistic Story Points (Fibonacci: 1, 2, 3, 5, 8, 13) and estimated hours.
5. Identify explicit task dependencies (e.g., Task B depends on Task A).
6. Flag initial Risk Level (Low, Medium, High).`
    },
    {
      title: '2. Dynamic Probability × Impact Risk Matrix',
      subtitle: 'Scored Risk Analysis (1 to 25) with Actionable Mitigations',
      prompt: `You are an Enterprise Risk Management & PMO Governance Specialist.
Analyze the project tasks, critical paths, and dependencies to synthesize a rigorous Dynamic Risk Log.

For every identified risk:
1. Assign Probability (1 to 5, where 5 is almost certain).
2. Assign Impact (1 to 5, where 5 is project catastrophic failure).
3. Compute Score = Probability * Impact (1-25).
4. Severity thresholds:
   - 16-25: Critical (Red)
   - 12-15: High (Orange)
   - 6-11: Moderate (Yellow)
   - 1-5: Low (Green)
5. Provide a specific, actionable Mitigation Strategy and an Assigned Owner.`
    },
    {
      title: '3. C-Suite Executive Briefing Protocol',
      subtitle: 'Editorial RAG Status & Management Escalations',
      prompt: `You are a Senior Technical Program Manager (TPM) delivering a concise, high-impact Executive Status Brief for executive leadership (VP of Engineering, Head of Product, and C-Suite).

Your writing must be:
- Direct, data-driven, and crisp.
- Free of unnecessary filler words.
- Explicit with RAG status (Red, Amber, Green).
- Clear on management escalations and trade-off decisions.`
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    addAgentLog('SETTINGS_SAVED', 'API tokens and mission preferences updated.', 'info');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-plasma" />
            Mission Control Settings & Prompt Studio
          </h2>
          <p className="text-xs text-slate-400">
            Configure live cloud API integrations and explore the AI CERTs course prompt architectures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: API Keys Form */}
        <div className="rounded-2xl bg-night-surface/90 border border-night-border p-6 shadow-xl backdrop-blur-md space-y-5">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-plasma" />
            API & Platform Keys (Stored in LocalStorage)
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Gemini */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Google Gemini API Key:
              </label>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  value={form.geminiApiKey}
                  onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy... (Leave empty for smart offline mode)"
                  className="w-full rounded-xl bg-night-base border border-night-border p-3 text-ice focus:outline-none focus:border-plasma font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ClickUp */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ClickUp Personal API Token:
              </label>
              <div className="relative">
                <input
                  type={showClickUp ? 'text' : 'password'}
                  value={form.clickupToken}
                  onChange={(e) => setForm({ ...form, clickupToken: e.target.value })}
                  placeholder="pk_... (Optional for live sync)"
                  className="w-full rounded-xl bg-night-base border border-night-border p-3 text-ice focus:outline-none focus:border-plasma font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowClickUp(!showClickUp)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showClickUp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ClickUp List ID */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ClickUp Target List ID:
              </label>
              <input
                type="text"
                value={form.clickupListId}
                onChange={(e) => setForm({ ...form, clickupListId: e.target.value })}
                placeholder="9012345678"
                className="w-full rounded-xl bg-night-base border border-night-border p-3 text-ice focus:outline-none focus:border-plasma font-mono"
              />
            </div>

            {/* Trello API Key */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Trello API Key & Token:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.trelloKey}
                  onChange={(e) => setForm({ ...form, trelloKey: e.target.value })}
                  placeholder="Trello Key"
                  className="w-full rounded-xl bg-night-base border border-night-border p-2.5 text-ice focus:outline-none focus:border-plasma font-mono"
                />
                <input
                  type={showTrello ? 'text' : 'password'}
                  value={form.trelloToken}
                  onChange={(e) => setForm({ ...form, trelloToken: e.target.value })}
                  placeholder="Trello Token"
                  className="w-full rounded-xl bg-night-base border border-night-border p-2.5 text-ice focus:outline-none focus:border-plasma font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetToInitial}
                className="px-3.5 py-2 rounded-xl bg-night-card hover:bg-night-panel border border-night-border text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Factory Data</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-plasma hover:bg-plasma/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-plasma/30 transition-all hover:scale-[1.02]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-lg bg-signal-green/10 border border-signal-green/30 text-signal-green flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings persisted to browser storage!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Prompt Studio (CardSwap Deck) */}
        <div className="rounded-2xl bg-night-surface/90 border border-night-border p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-plasma" />
              Prompt Engineering Studio
            </h3>
            <span className="text-xs font-mono text-slate-400">Card {activePromptIndex + 1} of 3</span>
          </div>

          <p className="text-xs text-slate-400">
            Interactive reference deck of production prompt architectures taught in the AI CERTs course.
          </p>

          {/* Prompt Selector Pills */}
          <div className="flex gap-1.5 p-1 bg-night-card rounded-xl border border-night-border">
            {promptCards.map((p, idx) => (
              <button
                key={p.title}
                onClick={() => setActivePromptIndex(idx)}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                  activePromptIndex === idx
                    ? 'bg-plasma text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Prompt {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Card Content */}
          <div className="rounded-xl bg-night-base p-4 border border-night-border/70 space-y-3">
            <div>
              <h4 className="font-display font-bold text-sm text-white">
                {promptCards[activePromptIndex].title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {promptCards[activePromptIndex].subtitle}
              </p>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-night-border/50 text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-72 whitespace-pre-wrap">
              {promptCards[activePromptIndex].prompt}
            </pre>

            <button
              onClick={() => {
                navigator.clipboard.writeText(promptCards[activePromptIndex].prompt);
                alert('Copied prompt template to clipboard!');
              }}
              className="text-plasma hover:text-plasma/80 font-mono text-xs font-semibold"
            >
              📋 Copy Prompt Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
