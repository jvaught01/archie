'use client';

import { useQuery } from '@tanstack/react-query';

interface HistoryItem {
  id: number;
  task_id: number;
  action: string;
  old_value?: string;
  new_value?: string;
  field?: string;
  created_at: string;
  task_title?: string;
}

export default function Timeline() {
  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await fetch('/api/history?limit=100');
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Group history by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-500';
      case 'status_changed':
        return 'bg-blue-500';
      case 'updated':
        return 'bg-yellow-500';
      case 'deleted':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'status_changed':
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      case 'updated':
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'deleted':
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatMessage = (item: HistoryItem) => {
    const taskTitle = item.task_title || 'Unknown task';
    switch (item.action) {
      case 'created':
        return (
          <span>
            Created task <span className="font-medium text-text-primary">"{taskTitle}"</span>
          </span>
        );
      case 'status_changed':
        return (
          <span>
            Moved <span className="font-medium text-text-primary">"{taskTitle}"</span>
            {' '}from{' '}
            <span className="px-1.5 py-0.5 rounded bg-dark-bg-tertiary text-text-secondary text-xs">
              {item.old_value?.replace('-', ' ')}
            </span>
            {' '}to{' '}
            <span className="px-1.5 py-0.5 rounded bg-dark-bg-tertiary text-text-secondary text-xs">
              {item.new_value?.replace('-', ' ')}
            </span>
          </span>
        );
      case 'updated':
        return (
          <span>
            Updated <span className="font-medium text-orange-400">{item.field}</span>
            {' '}on <span className="font-medium text-text-primary">"{taskTitle}"</span>
          </span>
        );
      case 'deleted':
        return (
          <span>
            Deleted task <span className="font-medium text-red-400">"{item.old_value}"</span>
          </span>
        );
      default:
        return (
          <span>
            {item.action} on <span className="font-medium text-text-primary">"{taskTitle}"</span>
          </span>
        );
    }
  };

  const dateEntries = Object.entries(groupedHistory);

  return (
    <div className="p-6 h-[calc(100vh-140px)] overflow-y-auto">
      {dateEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-dark-bg-tertiary flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No Activity Yet</h3>
          <p className="text-text-secondary text-sm max-w-sm">
            When you create, update, or move tasks, your activity will appear here as a timeline.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {dateEntries.map(([date, items]) => (
            <div key={date} className="mb-8">
              {/* Date Header */}
              <div className="sticky top-0 bg-dark-bg z-10 py-2 mb-4">
                <h3 className="text-sm font-medium text-text-secondary bg-dark-bg-secondary inline-block px-3 py-1 rounded-full border border-dark-border">
                  {date}
                </h3>
              </div>

              {/* Timeline Items */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-border" />

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="relative flex gap-4 pl-0">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-9 h-9 rounded-full ${getActionColor(item.action)} flex items-center justify-center shadow-lg`}>
                        {getActionIcon(item.action)}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 bg-dark-bg-secondary rounded-xl border border-dark-border p-4 ${
                        index === 0 ? 'animate-fade-in' : ''
                      }`}>
                        <div className="text-sm text-text-secondary leading-relaxed">
                          {formatMessage(item)}
                        </div>
                        <div className="mt-2 text-xs text-text-muted">
                          {new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
