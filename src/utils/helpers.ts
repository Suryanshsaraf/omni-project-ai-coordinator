import confetti from 'canvas-confetti';
import { Task, Risk, TeamMember, RAGStatus } from '../types';

/**
 * Fires a celebratory particle burst when a task lands in Done.
 */
export function fireDoneConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#2EE6A6', '#B14BFF', '#FFB224', '#DDE7FF']
    });
  } catch (e) {
    // Graceful fallback if window/canvas unavailable
  }
}

/**
 * Calculates project Health Score (0-100).
 */
export function calculateHealthScore(tasks: Task[], team: TeamMember[]): number {
  if (!tasks.length) return 100;
  let score = 100;

  // Penalize blocked tasks (-12 points each)
  const blockedCount = tasks.filter(t => t.status === 'Blocked').length;
  score -= (blockedCount * 12);

  // Penalize overloaded team members (-10 points each)
  const overloadedCount = getWorkloadStats(tasks, team).filter(w => w.loadPct > 100).length;
  score -= (overloadedCount * 10);

  // Velocity penalty if sprint has low completion and tasks are overdue
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const progressRatio = doneCount / tasks.length;
  if (progressRatio < 0.25 && tasks.length > 3) {
    score -= 6;
  }

  return Math.max(15, Math.min(100, score));
}

/**
 * Computes natural RAG status from metrics.
 */
export function computeRAG(tasks: Task[], risks: Risk[]): RAGStatus {
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  const hasCriticalRisk = risks.some(r => r.severity === 'Critical' && r.status === 'Active');

  if (blockedTasks >= 2 || hasCriticalRisk) {
    return 'red';
  } else if (blockedTasks === 1 || risks.some(r => r.severity === 'High')) {
    return 'amber';
  }
  return 'green';
}

/**
 * Computes Wrike-style workload and capacity stats per member.
 */
export interface MemberWorkload {
  name: string;
  role: string;
  capacityHours: number;
  allocatedHours: number;
  loadPct: number;
  taskCount: number;
  isOverloaded: boolean;
}

export function getWorkloadStats(tasks: Task[], team: TeamMember[]): MemberWorkload[] {
  const map: Record<string, { role: string; capacity: number; allocated: number; tasks: number }> = {};

  team.forEach(m => {
    map[m.name] = { role: m.role, capacity: m.capacity_hours, allocated: 0, tasks: 0 };
  });

  tasks.forEach(t => {
    if (!t.assignee) return;
    if (!map[t.assignee]) {
      map[t.assignee] = { role: 'Contributor', capacity: 40, allocated: 0, tasks: 0 };
    }
    // Only count active (incomplete) tasks toward active load
    if (t.status !== 'Done') {
      map[t.assignee].allocated += (t.estimated_hours || 0);
      map[t.assignee].tasks += 1;
    }
  });

  return Object.entries(map).map(([name, data]) => {
    const loadPct = data.capacity > 0 ? Math.round((data.allocated / data.capacity) * 100) : 0;
    return {
      name,
      role: data.role,
      capacityHours: data.capacity,
      allocatedHours: data.allocated,
      loadPct,
      taskCount: data.tasks,
      isOverloaded: loadPct > 100
    };
  });
}

/**
 * Scans task graph for blockers and bottlenecks.
 */
export function findBottlenecks(tasks: Task[]) {
  return tasks.filter(t => t.status === 'Blocked').map(t => {
    const downstream = tasks.filter(other => other.dependencies?.includes(t.id)).map(o => o.id);
    return {
      taskId: t.id,
      title: t.title,
      assignee: t.assignee,
      reason: t.blocker_reason || 'No blocker note registered.',
      downstreamCount: downstream.length,
      downstreamIds: downstream
    };
  });
}

/**
 * Formats and triggers download of the Executive Brief in Markdown.
 */
export function exportBriefMarkdown(title: string, briefText: string) {
  const blob = new Blob([briefText], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_executive_brief.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Web Audio Mission Control chime (quiet, tactile feedback).
 */
export function playMissionBeep(type: 'click' | 'switch' | 'alert' | 'success') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'switch') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.07);
      osc.frequency.setValueAtTime(783.99, now + 0.14);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(260, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio contexts restricted or unavailable
  }
}
