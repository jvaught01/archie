'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/db';
import TaskCard, { getPriorityStyle, getPriorityIcon, getTypeStyle, getTypeIcon } from './TaskCard';
import TaskModal from './TaskModal';

export default function Board() {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskType, setNewTaskType] = useState<'task' | 'discussion' | 'idea' | 'bug' | 'backlog'>('task');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskCreatedBy, setNewTaskCreatedBy] = useState<'julio' | 'archie'>('archie');
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
  });

  const resetNewTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskType('task');
    setNewTaskCategory('');
    setNewTaskCreatedBy('archie');
    setShowNewTask(false);
    setEditingColumn(null);
  };

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
          type: newTaskType,
          category: newTaskCategory || undefined,
          created_by: newTaskCreatedBy,
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
        resetNewTaskForm();
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
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
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setSelectedTask(updatedTask);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
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

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return <div className="w-3 h-3 rounded-full border-2 border-text-muted" />;
      case 'in-progress':
        return <div className="w-3 h-3 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />;
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

  return (
    <>
      {/* New Task Modal */}
      {showNewTask && (
        <div
          className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowNewTask(false)}
        >
          <div
            className="bg-dark-bg-secondary rounded-xl shadow-2xl p-6 w-full max-w-lg border border-dark-border animate-scale-in"
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
              {/* Title */}
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

              {/* Description */}
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

              {/* Type & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['task', 'discussion', 'idea', 'bug', 'backlog'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewTaskType(t)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          newTaskType === t
                            ? getTypeStyle(t) + ' ring-1 ring-offset-1 ring-offset-dark-bg-secondary ring-white/20'
                            : 'bg-dark-bg border-dark-border text-text-secondary hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {getTypeIcon(t)}
                          <span className="capitalize">{t}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setNewTaskPriority(p)}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          newTaskPriority === p
                            ? getPriorityStyle(p) + ' ring-1 ring-offset-1 ring-offset-dark-bg-secondary ring-white/20'
                            : 'bg-dark-bg border-dark-border text-text-secondary hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {getPriorityIcon(p)}
                          <span className="capitalize">{p}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category & Created By Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend, Backend"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  />
                </div>

                {/* Created By */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Created By</label>
                  <div className="flex gap-2">
                    {(['julio', 'archie'] as const).map((creator) => (
                      <button
                        key={creator}
                        onClick={() => setNewTaskCreatedBy(creator)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                          newTaskCreatedBy === creator
                            ? creator === 'julio'
                              ? 'bg-creator-julio-bg text-creator-julio-text border-blue-500/50 ring-1 ring-blue-500/30'
                              : 'bg-creator-archie-bg text-creator-archie-text border-purple-500/50 ring-1 ring-purple-500/30'
                            : 'bg-dark-bg border-dark-border text-text-secondary hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          creator === 'julio' ? 'bg-blue-500/30' : 'bg-purple-500/30'
                        }`}>
                          {creator === 'julio' ? 'J' : 'A'}
                        </div>
                        <span className="capitalize">{creator}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
        onDelete={async (taskId) => {
          await deleteTask(taskId);
          setSelectedTask(null);
        }}
      />

      {/* Kanban Board */}
      <div className="p-6 h-[calc(100vh-140px)]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.id);
              return (
                <div key={column.id} className="flex flex-col h-full max-h-full">
                  {/* Column Header */}
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

                  {/* Column Content */}
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
                                >
                                  <TaskCard
                                    task={task}
                                    onDelete={(taskId, e) => deleteTask(taskId, e)}
                                    onClick={(task) => setSelectedTask(task)}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>

                        {/* Empty State */}
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

                        {/* Add Task Button */}
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
    </>
  );
}
