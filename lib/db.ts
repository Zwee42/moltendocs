import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'moltendocs.db');

type DbRunResult = {
  lastID: number;
  changes: number;
};

type DbGetResult<T> = T | undefined;

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  async init() {
    const run = promisify(this.db.run.bind(this.db)) as (query: string, params?: unknown[]) => Promise<DbRunResult>;
    
    // Create users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Check if admin user exists, if not create one
    const get = promisify(this.db.get.bind(this.db)) as <T>(query: string, params?: unknown[]) => Promise<DbGetResult<T>>;
    const existingAdmin = await get<{ id: number }>('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Created default admin user: admin/admin123');
    }
  }

  
  
  async authenticate(username: string, password: string): Promise<{ id: number; username: string } | null> {
    const get = promisify(this.db.get.bind(this.db)) as <T>(query: string, params?: unknown[]) => Promise<DbGetResult<T>>;
    const user = await get<{ id: number; username: string; password_hash: string }>('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    return { id: user.id, username: user.username };
  }

  async createSession(userId: number): Promise<string> {
    const run = promisify(this.db.run.bind(this.db)) as (query: string, params?: unknown[]) => Promise<DbRunResult>;
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await run('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)', 
      [sessionId, userId, expiresAt.toISOString()]);
    
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<{ id: number; username: string } | null> {
    const get = promisify(this.db.get.bind(this.db)) as <T>(query: string, params?: unknown[]) => Promise<DbGetResult<T>>;
    const session = await get<{ id: number; username: string }>(`
      SELECT u.id, u.username 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `, [sessionId]);
    
    return session || null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (query: string, params?: unknown[]) => Promise<DbRunResult>;
    await run('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  async cleanExpiredSessions(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run('DELETE FROM sessions WHERE expires_at <= datetime(\'now\')');
  }

  async getAllUsers(): Promise<Array<{ id: number; username: string; created_at: string }>> {
    const all = promisify(this.db.all.bind(this.db)) as (query: string) => Promise<Array<{ id: number; username: string; created_at: string }>>;
    return await all('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
  }

  async createUser(username: string, password: string): Promise<{ id: number; username: string }> {
    const run = promisify(this.db.run.bind(this.db)) as (query: string, params?: unknown[]) => Promise<DbRunResult>;
    const get = promisify(this.db.get.bind(this.db)) as <T>(query: string, params?: unknown[]) => Promise<DbGetResult<T>>;

    // Check if username already exists
    const existingUser = await get<{ id: number }>('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);
    
    return { id: result.lastID, username };
  }

  async deleteUser(userId: number): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (query: string, params?: unknown[]) => Promise<DbRunResult>;
    
    // Delete user's sessions first
    await run('DELETE FROM sessions WHERE user_id = ?', [userId]);
    
    // Delete user
    const result = await run('DELETE FROM users WHERE id = ? AND username != ?', [userId, 'admin']);
    
    if (result.changes === 0) {
      throw new Error('User not found or cannot delete admin user');
    }
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    // const run = promisify(this.db.run.bind(this.db)) as (query: string, params?: unknown[]) => Promise<DbRunResult>;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Updating password for user ID:', userId);
    const result = await this.runAsync.call(this, 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [hashedPassword, userId]);
    console.log("Result:", result)
    if (result.changes === 0) {
      throw new Error('User not found');
    }
  }

  async runAsync(sql: string, params: unknown[] = []): Promise<DbRunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  close() {
    this.db.close();
  }
}

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = new Database();
    await dbInstance.init();
  }
  return dbInstance;
}
