import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  cleared_easy INTEGER NOT NULL DEFAULT 0,
  cleared_normal INTEGER NOT NULL DEFAULT 0,
  cleared_hard INTEGER NOT NULL DEFAULT 0,
  cleared_impossible INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`

export function openDatabase(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)
  db.exec(SCHEMA)
  return {
    userByName(username) {
      return db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    },
    userByToken(token) {
      if (!token) return null
      return db.prepare(`
        SELECT users.* FROM sessions
        JOIN users ON users.username = sessions.username
        WHERE sessions.token = ?
      `).get(token)
    },
    insertUser(username, passwordHash, salt) {
      db.prepare(`
        INSERT INTO users (username, password_hash, salt, created_at)
        VALUES (?, ?, ?, ?)
      `).run(username, passwordHash, salt, new Date().toISOString())
    },
    insertSession(token, username) {
      db.prepare('INSERT INTO sessions (token, username, created_at) VALUES (?, ?, ?)').run(token, username, new Date().toISOString())
    },
    deleteSession(token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    },
    markClear(column, username) {
      db.prepare(`UPDATE users SET ${column} = 1 WHERE username = ?`).run(username)
    }
  }
}
