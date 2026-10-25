export type RAGStatus = 'green' | 'amber' | 'red';

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';
export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';
export type RiskSeverity = 'Critical' | 'High' | 'Moderate' | 'Low';

export interface TeamMember {
  name: string;
  role: string;
  capacity_hours: number;
  allocated_hours?: number;
}

export interface Task {
  id: string;
  epic_id: string;
  title: string;
  user_story: string;
  acceptance_criteria: string;
  assignee: string;
  status: TaskStatus;
  story_points: number;
  estimated_hours: number;
  actual_hours?: number;
  priority: PriorityLevel;
  due_date?: string;
  dependencies?: string[];
  risk_level?: PriorityLevel;
  blocker_reason?: string;
}

export interface Epic {
  id: string;
  title: string;
  priority: PriorityLevel;
  description?: string;
}

export interface Risk {
  id: string;
  category: string;
  description: string;
  probability: number; // 1-5
  impact: number; // 1-5
  score: number; // 1-25
  severity: RiskSeverity;
  mitigation_strategy: string;
  owner: string;
  status: 'Active' | 'Monitoring' | 'Resolved';
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  methodology: string;
  sprint_duration_weeks: number;
  team_members: TeamMember[];
  epics: Epic[];
  tasks: Task[];
  risks: Risk[];
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  level: 'info' | 'warning' | 'urgent';
}

export interface TeamNudge {
  taskId: string;
  taskTitle: string;
  assignee: string;
  blockerReason: string;
  message: string;
  sent?: boolean;
}
