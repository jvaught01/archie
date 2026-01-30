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

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const getTasks = (): Task[] => {
  return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as Task[];
};

export const getTasksByStatus = (status: string): Task[] => {
  return db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC').all(status) as Task[];
};

export const createTask = (title: string, description?: string, priority?: string): Task => {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, priority, status) VALUES (?, ?, ?, ?)'
  ).run(title, description || '', priority || 'medium', 'todo');
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
};

export const updateTask = (id: number, updates: Partial<Task>): Task | undefined => {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  
  if (fields.length === 0) return undefined;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  db.prepare(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
  ).run(...values);
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
};

export const deleteTask = (id: number): void => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
};

export default db;
