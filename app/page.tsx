'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/db';

export default function Home() {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // React Query for real-time polling
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true, // Keep polling even when tab is not focused
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const createTask = async (status: string = 'todo') => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        if (status !== 'todo') {
          await fetch(`/api/tasks/${newTask.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
        }
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('medium');
        setShowNewTask(false);
        setEditingColumn(null);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const taskId = parseInt(draggableId.replace('task-', ''));
    updateTaskStatus(taskId, destination.droppableId);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': 
        return 'bg-priority-high-bg text-priority-high-text border-priority-high-border';
      case 'medium': 
        return 'bg-priority-medium-bg text-priority-medium-text border-priority-medium-border';
      case 'low': 
        return 'bg-priority-low-bg text-priority-low-text border-priority-low-border';
      default: 
        return 'bg-dark-bg-tertiary text-text-secondary border-dark-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return (
          <div className="w-3 h-3 rounded-full border-2 border-text-muted"></div>
        );
      case 'in-progress':
        return (
          <div className="w-3 h-3 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
        );
      case 'done':
        return (
          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Top Header */}
      <div className="bg-dark-bg-secondary border-b border-dark-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-text-primary">Archie Board</h1>
            </div>
            <button
              onClick={() => setShowNewTask(!showNewTask)}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-1">
            <button className="px-4 py-3 text-sm font-medium text-text-primary border-b-2 border-orange-500 bg-orange-500/5 rounded-t-lg transition-colors">
              Board
            </button>
            <button className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-bg-tertiary/50 rounded-t-lg transition-colors">
              Overview
            </button>
            <button className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-bg-tertiary/50 rounded-t-lg transition-colors">
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div 
          className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 animate-fade-in" 
          onClick={() => setShowNewTask(false)}
        >
          <div 
            className="bg-dark-bg-secondary rounded-xl shadow-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Create New Task</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Task Name</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                <textarea
                  placeholder="Add more details..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        newTaskPriority === p
                          ? getPriorityStyle(p) + ' ring-2 ring-offset-2 ring-offset-dark-bg-secondary'
                          : 'bg-dark-bg border-dark-border text-text-secondary hover:border-dark-border hover:bg-dark-bg-tertiary'
                      } ${p === 'high' ? 'ring-red-500/50' : p === 'medium' ? 'ring-yellow-500/50' : 'ring-green-500/50'}`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {getPriorityIcon(p)}
                        <span className="capitalize">{p}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button
                  onClick={() => setShowNewTask(false)}
                  className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createTask(editingColumn || 'todo')}
                  disabled={!newTaskTitle.trim()}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-6 h-[calc(100vh-140px)]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.id);
              return (
                <div key={column.id} className="flex flex-col h-full max-h-full">
                  {/* Column Header - Sticky */}
                  <div className="bg-dark-bg-secondary px-4 py-3 rounded-t-xl border border-b-0 border-dark-border flex-shrink-0 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {getColumnIcon(column.id)}
                        <h2 className="font-semibold text-text-primary text-sm">{column.title}</h2>
                        <span className="bg-dark-bg-tertiary text-text-muted text-xs font-medium px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingColumn(column.id);
                          setShowNewTask(true);
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-bg-tertiary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Column Content - Scrollable */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-0 bg-dark-bg-secondary/50 px-3 py-3 border border-t-0 rounded-b-xl transition-all duration-200 overflow-y-auto scrollbar-thin ${
                          snapshot.isDraggingOver 
                            ? 'drop-zone-active border-orange-500/40 bg-orange-500/5' 
                            : 'border-dark-border'
                        }`}
                        style={{ maxHeight: 'calc(100vh - 220px)' }}
                      >
                        <div className="space-y-3">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`group bg-dark-card rounded-xl border border-dark-border p-4 transition-all duration-200 hover:bg-dark-card-hover hover:border-dark-border hover:shadow-card-hover ${
                                    snapshot.isDragging 
                                      ? 'shadow-card-drag rotate-2 border-orange-500/50' 
                                      : 'shadow-card'
                                  }`}
                                >
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-medium text-text-primary leading-snug truncate">
                                        {task.title}
                                      </h3>
                                    </div>
                                    <button
                                      onClick={(e) => deleteTask(task.id, e)}
                                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all p-1 rounded hover:bg-red-500/10"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-text-secondary mb-3 leading-relaxed line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <span className={`priority-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                                      {getPriorityIcon(task.priority)}
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                    <span className="text-xs text-text-muted flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(task.created_at).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>

                        {/* Add Task Button */}
                        {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-dark-bg-tertiary flex items-center justify-center mb-3">
                              <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <p className="text-sm text-text-muted mb-1">No tasks yet</p>
                            <p className="text-xs text-text-muted">Drag tasks here or add a new one</p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setEditingColumn(column.id);
                            setShowNewTask(true);
                          }}
                          className="w-full mt-3 text-left text-sm text-text-muted hover:text-text-primary py-2.5 px-3 rounded-lg hover:bg-dark-bg-tertiary transition-all flex items-center gap-2 border border-transparent hover:border-dark-border"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add task
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
