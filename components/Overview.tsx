'use client';

import { useQuery } from '@tanstack/react-query';
import { getTypeStyle, getTypeIcon, CreatorBadge } from './TaskCard';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byCreator: Record<string, number>;
  recentActivity: Array<{
    id: number;
    task_id: number;
    action: string;
    old_value?: string;
    new_value?: string;
    field?: string;
    created_at: string;
    task_title?: string;
  }>;
}

export default function Overview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 10000,
  });

  if (isLoading || !stats) {
    return (
      <div className="p-6 flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    'todo': 'bg-gray-500',
    'in-progress': 'bg-orange-500',
    'done': 'bg-green-500',
  };

  const statusLabels: Record<string, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };

  const typeData = [
    { type: 'task', label: 'Task', count: stats.byType.task || 0 },
    { type: 'discussion', label: 'Discussion', count: stats.byType.discussion || 0 },
    { type: 'idea', label: 'Idea', count: stats.byType.idea || 0 },
    { type: 'bug', label: 'Bug', count: stats.byType.bug || 0 },
    { type: 'backlog', label: 'Backlog', count: stats.byType.backlog || 0 },
  ];

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'created':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'status_changed':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        );
      case 'updated':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatActivityMessage = (item: Stats['recentActivity'][0]) => {
    switch (item.action) {
      case 'created':
        return `Created "${item.task_title || 'task'}"`;
      case 'status_changed':
        return `Moved "${item.task_title || 'task'}" from ${item.old_value} to ${item.new_value}`;
      case 'updated':
        return `Updated ${item.field} on "${item.task_title || 'task'}"`;
      default:
        return `${item.action} on "${item.task_title || 'task'}"`;
    }
  };

  const categoryEntries = Object.entries(stats.byCategory).filter(([key]) => key !== 'null');

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-140px)] overflow-y-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-dark-bg-secondary rounded-xl border border-dark-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              <p className="text-sm text-text-secondary">Total Tasks</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        {['todo', 'in-progress', 'done'].map((status) => (
          <div key={status} className="bg-dark-bg-secondary rounded-xl border border-dark-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${statusColors[status]}/10 flex items-center justify-center`}>
                <div className={`w-4 h-4 rounded-full ${statusColors[status]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.byStatus[status] || 0}</p>
                <p className="text-sm text-text-secondary">{statusLabels[status]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks by Type */}
        <div className="bg-dark-bg-secondary rounded-xl border border-dark-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">By Type</h3>
          <div className="space-y-3">
            {typeData.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeStyle(item.type)}`}>
                    {getTypeIcon(item.type)}
                    {item.label}
                  </span>
                </div>
                <span className="text-text-primary font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Category */}
        <div className="bg-dark-bg-secondary rounded-xl border border-dark-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">By Category</h3>
          {categoryEntries.length > 0 ? (
            <div className="space-y-3">
              {categoryEntries.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm bg-dark-bg-tertiary text-text-secondary px-3 py-1 rounded-full">
                    {category === 'uncategorized' ? 'Uncategorized' : category}
                  </span>
                  <span className="text-text-primary font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No categories yet</p>
          )}
        </div>

        {/* Tasks by Creator */}
        <div className="bg-dark-bg-secondary rounded-xl border border-dark-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">By Creator</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCreator).map(([creator, count]) => (
              <div key={creator} className="flex items-center justify-between">
                <CreatorBadge creator={creator || 'archie'} />
                <span className="text-text-primary font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(stats.byCreator).length === 0 && (
              <p className="text-text-muted text-sm">No tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-bg-secondary rounded-xl border border-dark-border p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((item) => (
              <div key={item.id} className="flex gap-3">
                {getActivityIcon(item.action)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{formatActivityMessage(item)}</p>
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
        ) : (
          <p className="text-text-muted text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
}
