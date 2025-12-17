import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'chat_history.db');
export const db = new Database(dbPath);

// 初始化数据库
export const initSessionTable = () => {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
};

// 根据id获取会话
export function getSessionById(id: string) {
  return db.prepare('SELECT id, name, created_at FROM sessions WHERE id = ?').get(id);
}

// 创建会话
export function createSession(id: string, name: string) {
  initSessionTable();
  db.prepare('INSERT INTO sessions (id, name) VALUES (?, ?)').run(id, name);
  return getSessionById(id);
}

// 获取所有会话
export function getAllSessions() {
  return db.prepare('SELECT id, name, created_at FROM sessions ORDER BY created_at DESC').all();
}

// 更新会话
export function updateSession(id: string, name: string) {
  db.prepare('UPDATE sessions SET name = ? WHERE id = ?').run(name, id);
}

// 删除会话
export function deleteSession(id: string) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}
