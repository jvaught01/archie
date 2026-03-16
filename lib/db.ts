import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tasks.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
`);

// Migration: add type and category columns if they don't exist
try {
  db.exec(`ALTER TABLE tasks ADD COLUMN type TEXT DEFAULT 'task'`);
} catch (e) { /* column exists */ }
try {
  db.exec(`ALTER TABLE tasks ADD COLUMN category TEXT`);
} catch (e) { /* column exists */ }
try {
  db.exec(`ALTER TABLE tasks ADD COLUMN created_by TEXT DEFAULT 'archie'`);
} catch (e) { /* column exists */ }

// Create indexes
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_type ON tasks(type)`);
} catch (e) { /* index exists */ }
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_created_by ON tasks(created_by)`);
} catch (e) { /* index exists */ }

// Create task history table for timeline
db.exec(`
  CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    field TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
  
  CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
  CREATE INDEX IF NOT EXISTS idx_task_history_created_at ON task_history(created_at);
`);

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  type: 'task' | 'discussion' | 'idea' | 'bug' | 'backlog';
  category?: string;
  created_by: 'julio' | 'archie';
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: number;
  task_id: number;
  action: 'created' | 'status_changed' | 'updated' | 'deleted';
  old_value?: string;
  new_value?: string;
  field?: string;
  created_at: string;
}

export interface TaskWithHistory extends Task {
  history?: TaskHistory[];
}

export const getTasks = (): Task[] => {
  return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as Task[];
};

export const getTaskById = (id: number): Task | undefined => {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
};

export const getTasksByStatus = (status: string): Task[] => {
  return db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC').all(status) as Task[];
};

export const getTaskHistory = (taskId: number): TaskHistory[] => {
  return db.prepare('SELECT * FROM task_history WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as TaskHistory[];
};

export const getAllHistory = (limit: number = 50): (TaskHistory & { task_title?: string })[] => {
  return db.prepare(`
    SELECT h.*, t.title as task_title
    FROM task_history h
    LEFT JOIN tasks t ON h.task_id = t.id
    ORDER BY h.created_at DESC
    LIMIT ?
  `).all(limit) as (TaskHistory & { task_title?: string })[];
};

export const addTaskHistory = (taskId: number, action: string, field?: string | null, oldValue?: string | null, newValue?: string | null): void => {
  db.prepare(
    'INSERT INTO task_history (task_id, action, field, old_value, new_value) VALUES (?, ?, ?, ?, ?)'
  ).run(taskId, action, field || null, oldValue || null, newValue || null);
};

export const createTask = (
  title: string, 
  description?: string, 
  priority?: string, 
  type?: string, 
  category?: string,
  created_by?: string
): Task => {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, priority, status, type, category, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    title, 
    description || '', 
    priority || 'medium', 
    'todo', 
    type || 'task', 
    category || null,
    created_by || 'archie'
  );
  
  const taskId = result.lastInsertRowid as number;
  
  // Record creation in history
  addTaskHistory(taskId, 'created', null, null, title);
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as Task;
};

export const updateTask = (id: number, updates: Partial<Task>): Task | undefined => {
  const currentTask = getTaskById(id);
  if (!currentTask) return undefined;
  
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  
  // Track changes for history
  const trackField = (fieldName: string, newValue: string | null | undefined, currentValue: string | null | undefined) => {
    if (newValue !== undefined && newValue !== currentValue) {
      addTaskHistory(id, fieldName === 'status' ? 'status_changed' : 'updated', fieldName, currentValue || '', newValue || '');
    }
  };
  
  if (updates.title !== undefined) {
    trackField('title', updates.title, currentTask.title);
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    trackField('description', updates.description, currentTask.description);
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.status !== undefined) {
    trackField('status', updates.status, currentTask.status);
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.priority !== undefined) {
    trackField('priority', updates.priority, currentTask.priority);
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.type !== undefined) {
    trackField('type', updates.type, currentTask.type);
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.category !== undefined) {
    trackField('category', updates.category, currentTask.category);
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.created_by !== undefined) {
    trackField('created_by', updates.created_by, currentTask.created_by);
    fields.push('created_by = ?');
    values.push(updates.created_by);
  }
  
  if (fields.length === 0) return currentTask;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  db.prepare(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
  ).run(...values);
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
};

export const deleteTask = (id: number): void => {
  const task = getTaskById(id);
  if (task) {
    addTaskHistory(id, 'deleted', null, task.title, null);
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
};

// Stats for dashboard
export const getTaskStats = () => {
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM tasks
    GROUP BY status
  `).all() as { status: string; count: number }[];
  
  const byType = db.prepare(`
    SELECT type, COUNT(*) as count
    FROM tasks
    GROUP BY type
  `).all() as { type: string; count: number }[];
  
  const byCategory = db.prepare(`
    SELECT COALESCE(category, 'uncategorized') as category, COUNT(*) as count
    FROM tasks
    GROUP BY category
  `).all() as { category: string; count: number }[];
  
  const byCreator = db.prepare(`
    SELECT created_by, COUNT(*) as count
    FROM tasks
    GROUP BY created_by
  `).all() as { created_by: string; count: number }[];
  
  const total = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  
  const recentActivity = getAllHistory(10);
  
  return {
    total: total.count,
    byStatus: Object.fromEntries(byStatus.map(s => [s.status, s.count])),
    byType: Object.fromEntries(byType.map(t => [t.type, t.count])),
    byCategory: Object.fromEntries(byCategory.map(c => [c.category, c.count])),
    byCreator: Object.fromEntries(byCreator.map(c => [c.created_by, c.count])),
    recentActivity,
  };
};

export default db;
