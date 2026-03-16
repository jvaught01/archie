'use client';

import { Task } from '@/lib/db';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: number, e: React.MouseEvent) => void;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}

export const getTypeStyle = (type: string) => {
  switch (type) {
    case 'task':
      return 'bg-type-task-bg text-type-task-text border-type-task-border';
    case 'discussion':
      return 'bg-type-discussion-bg text-type-discussion-text border-type-discussion-border';
    case 'idea':
      return 'bg-type-idea-bg text-type-idea-text border-type-idea-border';
    case 'bug':
      return 'bg-type-bug-bg text-type-bug-text border-type-bug-border';
    case 'backlog':
      return 'bg-type-backlog-bg text-type-backlog-text border-type-backlog-border';
    default:
      return 'bg-dark-bg-tertiary text-text-secondary border-dark-border';
  }
};

export const getPriorityStyle = (priority: string) => {
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

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'task':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'discussion':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'idea':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'bug':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'backlog':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    default:
      return null;
  }
};

export const getPriorityIcon = (priority: string) => {
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

export const CreatorBadge = ({ creator }: { creator: string }) => {
  const isJulio = creator === 'julio';
  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        isJulio 
          ? 'bg-creator-julio-bg text-creator-julio-text' 
          : 'bg-creator-archie-bg text-creator-archie-text'
      }`}
      title={`Created by ${creator}`}
    >
      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
        isJulio ? 'bg-blue-500/30' : 'bg-purple-500/30'
      }`}>
        {isJulio ? 'J' : 'A'}
      </div>
      <span className="capitalize">{creator}</span>
    </div>
  );
};

export default function TaskCard({ task, onDelete, onClick, isDragging }: TaskCardProps) {
  return (
    <div
      onClick={() => onClick(task)}
      className={`group bg-dark-card rounded-xl border border-dark-border p-4 transition-all duration-200 hover:bg-dark-card-hover hover:border-dark-border hover:shadow-card-hover cursor-pointer ${
        isDragging 
          ? 'shadow-card-drag rotate-2 border-orange-500/50' 
          : 'shadow-card'
      }`}
    >
      {/* Type Badge & Delete */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getTypeStyle(task.type)}`}>
          {getTypeIcon(task.type)}
          {task.type}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id, e);
          }}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all p-1 rounded hover:bg-red-500/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-text-primary leading-snug mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-text-secondary mb-3 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Category if present */}
      {task.category && (
        <div className="mb-3">
          <span className="text-xs bg-dark-bg-tertiary text-text-muted px-2 py-0.5 rounded-full">
            {task.category}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={`priority-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Creator */}
          <CreatorBadge creator={task.created_by || 'archie'} />
        </div>
      </div>

      {/* Date */}
      <div className="mt-2 pt-2 border-t border-dark-border/50">
        <span className="text-xs text-text-muted flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(task.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}
