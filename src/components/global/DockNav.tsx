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
    { id: 'scoping', label: '1. Scoping', icon: FileText },
    { id: 'kanban', label: '2. Kanban', icon: LayoutGrid, badge: blockedCount > 0 ? blockedCount : undefined },
    { id: 'risk', label: '3. Risk Grid', icon: AlertTriangle, badge: criticalRiskCount > 0 ? criticalRiskCount : undefined },
    { id: 'agent', label: '4. Coordinator', icon: Bot, badge: nudges.length > 0 ? nudges.length : undefined },
    { id: 'brief', label: '5. Exec Brief', icon: TrendingUp },
    { id: 'settings', label: '6. Settings', icon: Sliders }
  ];

  return (
    <div 
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50
      }}
    >
      <nav 
        aria-label="Mission Navigation Dock"
        className="flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-2xl glass-panel shadow-2xl"
        style={{
          background: 'rgba(28, 23, 69, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(177, 75, 255, 0.28)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(177, 75, 255, 0.15)'
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-plasma text-white shadow-lg shadow-plasma/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-white shadow-[0_0_10px_white]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
