'use client';

import { useState, useEffect } from 'react';
import { Task, TaskHistory } from '@/lib/db';
import { getTypeStyle, getPriorityStyle, getTypeIcon, getPriorityIcon, CreatorBadge } from './TaskCard';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskModal({ task, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        category: task.category,
        created_by: task.created_by,
      });
      fetchHistory(task.id);
    }
  }, [task]);

  const fetchHistory = async (taskId: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    setLoading(true);
    try {
      await onUpdate(task.id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const typeOptions = [
    { value: 'task', label: 'Task' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'idea', label: 'Idea' },
    { value: 'bug', label: 'Bug' },
    { value: 'backlog', label: 'Backlog' },
  ];

  const creatorOptions = [
    { value: 'julio', label: 'Julio' },
    { value: 'archie', label: 'Archie' },
  ];

  const getHistoryIcon = (action: string) => {
    switch (action) {
      case 'created':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'status_changed':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        );
      case 'updated':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'deleted':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatHistoryMessage = (item: TaskHistory) => {
    switch (item.action) {
      case 'created':
        return 'Task created';
      case 'status_changed':
        return `Status changed from "${item.old_value}" to "${item.new_value}"`;
      case 'updated':
        return `${item.field} updated`;
      case 'deleted':
        return 'Task deleted';
      default:
        return item.action;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 modal-backdrop flex items-start justify-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-dark-bg-secondary h-full w-full max-w-2xl shadow-modal border-l border-dark-border animate-slide-in-right overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-bg-secondary border-b border-dark-border px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${getTypeStyle(task.type)}`}>
                {getTypeIcon(task.type)}
                {task.type}
              </span>
              <span className="text-text-muted text-sm">#{task.id}</span>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-all"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-xl font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
              />
            ) : (
              <h1 className="text-xl font-semibold text-text-primary">{task.title}</h1>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={4}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              {isEditing ? (
                <select
                  value={editedTask.status || task.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' : 
                    task.status === 'in-progress' ? 'bg-orange-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-text-primary capitalize">{task.status.replace('-', ' ')}</span>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
              {isEditing ? (
                <select
                  value={editedTask.priority || task.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${getPriorityStyle(task.priority)}`}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </span>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              {isEditing ? (
                <select
                  value={editedTask.type || task.type}
                  onChange={(e) => setEditedTask({ ...editedTask, type: e.target.value as Task['type'] })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${getTypeStyle(task.type)}`}>
                  {getTypeIcon(task.type)}
                  {task.type}
                </span>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.category || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="e.g., Frontend, Backend, Design"
                />
              ) : (
                <span className="text-text-primary">{task.category || 'None'}</span>
              )}
            </div>

            {/* Created By */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Created By</label>
              {isEditing ? (
                <select
                  value={editedTask.created_by || task.created_by}
                  onChange={(e) => setEditedTask({ ...editedTask, created_by: e.target.value as Task['created_by'] })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {creatorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <CreatorBadge creator={task.created_by || 'archie'} />
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-dark-border pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Created</span>
                <p className="text-text-primary mt-1">
                  {new Date(task.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <span className="text-text-muted">Updated</span>
                <p className="text-text-primary mt-1">
                  {new Date(task.updated_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {history.length > 0 && (
            <div className="border-t border-dark-border pt-4">
              <h3 className="text-sm font-medium text-text-primary mb-4">Activity</h3>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {getHistoryIcon(item.action)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{formatHistoryMessage(item)}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(item.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
