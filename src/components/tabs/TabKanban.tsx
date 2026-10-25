import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../../types';
import { AlertOctagon, CheckCircle2, Clock, Plus, User, Tag } from 'lucide-react';

export const TabKanban: React.FC = () => {
  const { project, moveTask } = useProject();
  const [editingBlockerTaskId, setEditingBlockerTaskId] = useState<string | null>(null);
  const [blockerNote, setBlockerNote] = useState('');

  const columns: { id: TaskStatus; label: string; color: string; border: string; glow: string }[] = [
    { id: 'To Do', label: 'To Do', color: 'text-slate-300', border: 'border-slate-700', glow: 'rgba(221,231,255,0.05)' },
    { id: 'In Progress', label: 'In Progress', color: 'text-blue-400', border: 'border-blue-500/40', glow: 'rgba(59,130,246,0.1)' },
    { id: 'Blocked', label: 'Blocked', color: 'text-signal-red', border: 'border-signal-red/50', glow: 'rgba(255,59,92,0.15)' },
    { id: 'Done', label: 'Done', color: 'text-signal-green', border: 'border-signal-green/40', glow: 'rgba(46,230,166,0.1)' }
  ];

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;

    if (newStatus === 'Blocked') {
      setEditingBlockerTaskId(draggableId);
      setBlockerNote('Waiting on external dependency approval.');
    } else {
      moveTask(draggableId, newStatus);
    }
  };

  const handleSaveBlocker = (taskId: string) => {
    moveTask(taskId, 'Blocked', blockerNote);
    setEditingBlockerTaskId(null);
    setBlockerNote('');
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Sprint Kanban Mission Grid</h2>
          <p className="text-xs text-slate-400">
            Real-time drag-and-drop workflow. Moving cards dynamically shifts the Mission Control RAG heartbeat.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-night-card px-3 py-1 rounded-lg border border-night-border">
          <span>Total Story Points: <strong className="text-white">{project.tasks.reduce((sum, t) => sum + t.story_points, 0)}</strong></span>
        </div>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const tasksInCol = project.tasks.filter(t => t.status === col.id);

            return (
              <div
                key={col.id}
                className="rounded-2xl bg-night-surface/70 border border-night-border p-3.5 backdrop-blur-md flex flex-col min-h-[500px]"
                style={{ boxShadow: `0 8px 30px ${col.glow}` }}
              >
                {/* Column Header */}
                <div className={`pb-3 mb-3 border-b ${col.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-bold text-xs uppercase tracking-wider ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-night-card border border-night-border text-[11px] font-mono text-slate-400 flex items-center justify-center font-bold">
                      {tasksInCol.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${
                        snapshot.isDraggingOver ? 'bg-plasma/10 ring-1 ring-plasma' : ''
                      }`}
                    >
                      {tasksInCol.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group relative rounded-xl bg-night-card/90 border border-night-border p-4 shadow-md transition-all duration-200 select-none ${
                                snapshot.isDragging
                                  ? 'scale-105 shadow-2xl shadow-plasma/40 ring-1 ring-plasma z-50 bg-night-surface'
                                  : 'hover:border-plasma/40 hover:bg-night-card'
                              } ${
                                task.status === 'Blocked' ? 'border-l-4 border-l-signal-red' : ''
                              }`}
                            >
                              {/* Task Header */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-[11px] text-slate-400 font-bold">
                                  {task.id}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-night-base text-plasma border border-plasma/30">
                                    {task.story_points} Pts
                                  </span>
                                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                                    task.priority === 'Urgent'
                                      ? 'bg-signal-red/20 text-signal-red'
                                      : 'bg-signal-amber/20 text-signal-amber'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 className="font-sans font-medium text-xs sm:text-sm text-ice leading-snug mb-2 group-hover:text-white transition-colors">
                                {task.title}
                              </h4>

                              {/* Blocker Callout if blocked */}
                              {task.status === 'Blocked' && (
                                <div className="mb-2 p-2 rounded-lg bg-signal-red/15 border border-signal-red/30 text-[11px] text-signal-red flex items-start gap-1.5">
                                  <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{task.blocker_reason || 'Blocker pending escalation'}</span>
                                </div>
                              )}

                              {/* Footer details */}
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-night-border/50">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" />
                                  <span className="truncate max-w-[100px] text-slate-300">{task.assignee}</span>
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{task.estimated_hours}h</span>
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Blocker Modal Dialog */}
      {editingBlockerTaskId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-night-surface border border-signal-red/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-signal-red font-display font-bold text-sm">
              <AlertOctagon className="w-5 h-5" />
              <span>Register Blocker Reason</span>
            </div>
            <p className="text-xs text-slate-300">
              This reason will inform the Dynamic Risk Matrix and generate an AI unblocking nudge.
            </p>
            <textarea
              rows={3}
              value={blockerNote}
              onChange={(e) => setBlockerNote(e.target.value)}
              className="w-full bg-night-base border border-night-border rounded-xl p-3 text-xs text-ice focus:outline-none focus:border-signal-red font-mono resize-none"
              placeholder="e.g. Waiting on STUN/TURN firewall approval from DevOps infrastructure team..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingBlockerTaskId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveBlocker(editingBlockerTaskId)}
                className="px-4 py-1.5 rounded-lg bg-signal-red hover:bg-signal-red/90 text-xs font-semibold text-white shadow-lg shadow-signal-red/30"
              >
                Confirm Blocker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
