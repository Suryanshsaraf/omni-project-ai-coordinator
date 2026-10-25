import React from 'react';
import { useProject, TabId } from '../../context/ProjectContext';
import { FileText, LayoutGrid, AlertTriangle, Bot, TrendingUp, Sliders } from 'lucide-react';

interface DockItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const DockNav: React.FC = () => {
  const { activeTab, setActiveTab, project, nudges } = useProject();

  const blockedCount = project.tasks.filter(t => t.status === 'Blocked').length;
  const criticalRiskCount = project.risks.filter(r => r.severity === 'Critical').length;

  const items: DockItem[] = [
    { id: 'scoping', label: 'Scoping & WBS', icon: FileText },
    { id: 'kanban', label: 'Sprint Kanban', icon: LayoutGrid, badge: blockedCount > 0 ? blockedCount : undefined },
    { id: 'risk', label: 'Risk & Matrix', icon: AlertTriangle, badge: criticalRiskCount > 0 ? criticalRiskCount : undefined },
    { id: 'agent', label: 'AI Coordinator', icon: Bot, badge: nudges.length > 0 ? nudges.length : undefined },
    { id: 'brief', label: 'Executive Brief', icon: TrendingUp },
    { id: 'settings', label: 'Settings & Prompts', icon: Sliders }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
      <nav 
        aria-label="Mission Navigation Dock"
        className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-2xl bg-night-surface/90 backdrop-blur-xl border border-night-border shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-plasma text-white shadow-lg shadow-plasma/40 scale-105'
                  : 'text-slate-400 hover:text-ice hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap text-xs">
                {item.label}
              </span>

              {/* Notification Badge */}
              {item.badge !== undefined && (
                <span className={`w-4 h-4 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white text-night-base' : 'bg-signal-red text-white'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Active Bottom Glow Pill */}
              {isActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
