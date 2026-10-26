import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Key, Sliders, Eye, EyeOff, Save, CheckCircle2, RotateCcw, BookOpen, Palette, Sun, Moon } from 'lucide-react';
import { ThemeToggle } from '../global/ThemeToggle';

export const TabSettings: React.FC = () => {
  const { settings, updateSettings, resetToInitial, addAgentLog, theme, setTheme } = useProject();
  const [form, setForm] = useState({ ...settings });
  const [showGemini, setShowGemini] = useState(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5 text-plasma" />
            Mission Control Settings & Appearance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure visual themes, live cloud API integrations, and explore prompt architectures.
          </p>
        </div>
      </div>

      {/* Visual Theme Card */}
      <div 
        className="rounded-2xl p-6 shadow-xl space-y-4 transition-all duration-300"
        style={{
          background: 'var(--app-card-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--app-border)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-plasma" />
              Theme & Appearance
            </h3>
            <p className="text-xs text-slate-400">
              Active mode: <strong className="font-semibold capitalize">{theme} Theme</strong>. Use the toggle to switch between Pure Black and Clean White mode.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme('black')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                theme === 'black'
                  ? 'bg-neutral-900 text-white border border-white/30 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Black (Default)</span>
            </button>

            <button
              onClick={() => setTheme('white')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                theme === 'white'
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>White</span>
            </button>

            <div className="pl-2 border-l border-neutral-700/30">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: API Keys Form */}
        <div 
          className="rounded-2xl p-6 shadow-xl space-y-5 transition-all duration-300"
          style={{
            background: 'var(--app-card-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--app-border)'
          }}
        >
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-plasma" />
            API & Platform Keys (Stored in LocalStorage)
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Gemini */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Google Gemini API Key:
              </label>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  value={form.geminiApiKey}
                  onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy... (Leave empty for smart offline mode)"
                  style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--input-border)' }}
                  className="w-full rounded-xl p-3 font-mono pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-plasma"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OpenAI */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                OpenAI API Key:
              </label>
              <input
                type="password"
                value={form.openaiApiKey}
                onChange={(e) => setForm({ ...form, openaiApiKey: e.target.value })}
                placeholder="sk-proj-... (Optional fallback)"
                style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--input-border)' }}
                className="w-full rounded-xl p-3 font-mono text-xs"
              />
            </div>

            {/* ClickUp Token & List */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  ClickUp Token:
                </label>
                <div className="relative">
                  <input
                    type={showClickUp ? 'text' : 'password'}
                    value={form.clickupToken}
                    onChange={(e) => setForm({ ...form, clickupToken: e.target.value })}
                    placeholder="pk_..."
                    style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--input-border)' }}
                    className="w-full rounded-xl p-3 font-mono text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClickUp(!showClickUp)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-plasma"
                  >
                    {showClickUp ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  ClickUp List ID:
                </label>
                <input
                  type="text"
                  value={form.clickupListId}
                  onChange={(e) => setForm({ ...form, clickupListId: e.target.value })}
                  placeholder="901..."
                  style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--input-border)' }}
                  className="w-full rounded-xl p-3 font-mono text-xs"
                />
              </div>
            </div>

            {/* Trello Key & Token */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Trello API Key:
                </label>
                <input
                  type="text"
                  value={form.trelloKey}
                  onChange={(e) => setForm({ ...form, trelloKey: e.target.value })}
                  placeholder="API Key"
                  style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--input-border)' }}
                  className="w-full rounded-xl p-3 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Trello Token:
                </label>
                <input
                  type="password"
                  value={form.trelloToken}
                  onChange={(e) => setForm({ ...form, trelloToken: e.target.value })}
                  placeholder="Token"
                  style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--input-border)' }}
                  className="w-full rounded-xl p-3 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={resetToInitial}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-plasma flex items-center gap-1.5 transition-colors"
                style={{ background: 'var(--app-inset-bg)', border: '1px solid var(--app-border)' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
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
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Configuration credentials successfully preserved!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Prompt Studio */}
        <div 
          className="rounded-2xl p-6 shadow-xl space-y-4 transition-all duration-300"
          style={{
            background: 'var(--app-card-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--app-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-plasma" />
              Prompt Engineering Studio
            </h3>
            <span className="text-xs font-mono text-slate-400">Card {activePromptIndex + 1} of 3</span>
          </div>

          <p className="text-xs text-slate-400">
            Interactive reference deck of production prompt architectures taught in the AI CERTs course.
          </p>

          {/* Prompt Selector Pills */}
          <div 
            className="flex gap-1.5 p-1 rounded-xl"
            style={{ background: 'var(--app-inset-bg)', border: '1px solid var(--app-border)' }}
          >
            {promptCards.map((p, idx) => (
              <button
                key={p.title}
                onClick={() => setActivePromptIndex(idx)}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                  activePromptIndex === idx
                    ? 'bg-plasma text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-plasma'
                }`}
              >
                Prompt {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Card Content */}
          <div 
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--app-inset-bg)', border: '1px solid var(--app-border)' }}
          >
            <div>
              <h4 className="font-display font-bold text-sm">
                {promptCards[activePromptIndex].title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {promptCards[activePromptIndex].subtitle}
              </p>
            </div>

            <pre 
              className="p-3 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 whitespace-pre-wrap transition-colors"
              style={{ background: 'var(--app-surface-bg)', border: '1px solid var(--app-border)' }}
            >
              {promptCards[activePromptIndex].prompt}
            </pre>

            <button
              onClick={() => {
                navigator.clipboard.writeText(promptCards[activePromptIndex].prompt);
                alert('Copied prompt template to clipboard!');
              }}
              className="text-plasma hover:text-plasma/80 font-mono text-xs font-semibold cursor-pointer"
            >
              📋 Copy Prompt Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
