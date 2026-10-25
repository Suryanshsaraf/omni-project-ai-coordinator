import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectData, Task, Risk, RAGStatus, AgentLogEntry, TeamNudge, TaskStatus } from '../types';
import { INITIAL_PROJECTS } from '../data/initialProjects';
import { calculateHealthScore, computeRAG, fireDoneConfetti, playMissionBeep } from '../utils/helpers';

export type TabId = 'scoping' | 'kanban' | 'risk' | 'agent' | 'brief' | 'settings';

interface SettingsState {
  geminiApiKey: string;
  openaiApiKey: string;
  clickupToken: string;
  clickupListId: string;
  trelloKey: string;
  trelloToken: string;
  trelloListId: string;
  soundEnabled: boolean;
}

interface ProjectContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  activeScenario: string;
  setActiveScenario: (id: string) => void;
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  ragStatus: RAGStatus;
  ragOverride: RAGStatus | null;
  cycleRAGOverride: () => void;
  healthScore: number;
  agentLogs: AgentLogEntry[];
  nudges: TeamNudge[];
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, blockerReason?: string) => void;
  sendNudge: (taskId: string) => void;
  addAgentLog: (type: string, message: string, level?: 'info' | 'warning' | 'urgent') => void;
  resetToInitial: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabId>('scoping');
  const [activeScenario, setActiveScenarioState] = useState<string>('telemedicine_app');
  
  // Projects map initialized from LocalStorage or Defaults
  const [projects, setProjects] = useState<Record<string, ProjectData>>(() => {
    try {
      const saved = localStorage.getItem('omni_projects_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROJECTS;
  });

  const [project, setProject] = useState<ProjectData>(() => projects['telemedicine_app'] || INITIAL_PROJECTS['telemedicine_app']);
  const [ragOverride, setRagOverride] = useState<RAGStatus | null>(null);

  // Settings in localStorage
  const [settings, setSettings] = useState<SettingsState>(() => {
    const defaults: SettingsState = {
      geminiApiKey: '',
      openaiApiKey: '',
      clickupToken: '',
      clickupListId: '',
      trelloKey: '',
      trelloToken: '',
      trelloListId: '',
      soundEnabled: true
    };
    try {
      const saved = localStorage.getItem('omni_settings_v2');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {}
    return defaults;
  });

  // Agent activity logs
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '21:40:12',
      type: 'HEALTH_CHECK',
      message: 'Autonomous Coordinator initiated telemetry sweep. Board integrity verified.',
      level: 'info'
    },
    {
      id: 'log-2',
      timestamp: '21:41:05',
      type: 'BOTTLENECK_ALERT',
      message: 'Critical blocker on Task-103: TURN/STUN server approval delay flags 2 downstream paths.',
      level: 'urgent'
    },
    {
      id: 'log-3',
      timestamp: '21:42:30',
      type: 'WORKLOAD_MONITOR',
      message: 'Wrike algorithm flags Ananya Sharma at 120% capacity threshold. Rebalance advised.',
      level: 'warning'
    }
  ]);

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('omni_projects_v2', JSON.stringify({ ...projects, [project.id]: project }));
    } catch (e) {}
  }, [project, projects]);

  // Compute RAG and health score
  const naturalRAG = computeRAG(project.tasks, project.risks);
  const ragStatus = ragOverride || naturalRAG;
  const healthScore = calculateHealthScore(project.tasks, project.team_members);

  // Hidden Dev Key Listener: Press 'R' to cycle RAG states
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        cycleRAGOverride();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ragOverride, naturalRAG]);

  const cycleRAGOverride = () => {
    const cycle: (RAGStatus | null)[] = [null, 'green', 'amber', 'red'];
    const currentIdx = cycle.indexOf(ragOverride);
    const nextState = cycle[(currentIdx + 1) % cycle.length];
    setRagOverride(nextState);
    if (settings.soundEnabled) playMissionBeep('alert');
    addAgentLog('DEV_OVERRIDE', `Manual RAG heartbeat shifted to: ${nextState ? nextState.toUpperCase() : 'AUTO CALCULATED'}`, 'warning');
  };

  const setActiveTab = (tab: TabId) => {
    if (settings.soundEnabled) playMissionBeep('click');
    setActiveTabState(tab);
  };

  const setActiveScenario = (id: string) => {
    if (settings.soundEnabled) playMissionBeep('switch');
    setActiveScenarioState(id);
    const chosen = projects[id] || INITIAL_PROJECTS[id] || INITIAL_PROJECTS['telemedicine_app'];
    setProject(chosen);
    addAgentLog('SCENARIO_SWITCH', `Mission Control loaded project template: "${chosen.title}"`, 'info');
  };

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('omni_settings_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  const addAgentLog = (type: string, message: string, level: 'info' | 'warning' | 'urgent' = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEntry: AgentLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      type,
      message,
      level
    };
    setAgentLogs(prev => [newEntry, ...prev.slice(0, 19)]);
  };

  const moveTask = (taskId: string, newStatus: TaskStatus, blockerReason?: string) => {
    setProject(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            blocker_reason: newStatus === 'Blocked' ? (blockerReason || t.blocker_reason || 'Pending dependency unblock') : undefined
          };
        }
        return t;
      });

      return {
        ...prev,
        tasks: updatedTasks
      };
    });

    if (newStatus === 'Done') {
      fireDoneConfetti();
      if (settings.soundEnabled) playMissionBeep('success');
      addAgentLog('TASK_COMPLETED', `Milestone achieved: Task [${taskId}] marked DONE!`, 'info');
    } else if (newStatus === 'Blocked') {
      if (settings.soundEnabled) playMissionBeep('alert');
      addAgentLog('BOTTLENECK_DETECTED', `Task [${taskId}] marked BLOCKED: ${blockerReason || 'Waiting on dependency'}`, 'urgent');
    } else {
      if (settings.soundEnabled) playMissionBeep('click');
      addAgentLog('STATUS_UPDATE', `Task [${taskId}] transitioned to ${newStatus}`, 'info');
    }
  };

  // Generate team nudges from blocked tasks
  const nudges: TeamNudge[] = project.tasks
    .filter(t => t.status === 'Blocked')
    .map(t => ({
      taskId: t.id,
      taskTitle: t.title,
      assignee: t.assignee,
      blockerReason: t.blocker_reason || 'dependency delay',
      message: `Hi ${t.assignee.split(' ')[0]}! 🤖 OmniProject Coordinator noticed that "${t.title}" is currently Blocked (${t.blocker_reason || 'dependency wait'}). Should we escalate this to leadership in today's standup?`,
      sent: false
    }));

  const sendNudge = (taskId: string) => {
    if (settings.soundEnabled) playMissionBeep('click');
    addAgentLog('NUDGE_TRANSMITTED', `Automated unblocking nudge sent to ${project.tasks.find(t => t.id === taskId)?.assignee || 'Assignee'}`, 'info');
  };

  const resetToInitial = () => {
    setProjects(INITIAL_PROJECTS);
    setProject(INITIAL_PROJECTS[activeScenario] || INITIAL_PROJECTS['telemedicine_app']);
    setRagOverride(null);
    try {
      localStorage.removeItem('omni_projects_v2');
    } catch (e) {}
    addAgentLog('SYSTEM_RESET', 'Mission Control reset to factory template specifications.', 'warning');
  };

  return (
    <ProjectContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeScenario,
        setActiveScenario,
        project,
        setProject,
        ragStatus,
        ragOverride,
        cycleRAGOverride,
        healthScore,
        agentLogs,
        nudges,
        settings,
        updateSettings,
        moveTask,
        sendNudge,
        addAgentLog,
        resetToInitial
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
