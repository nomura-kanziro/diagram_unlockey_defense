import http from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || join(root, 'data', 'accounts.sqlite')
mkdirSync(dirname(dbPath), { recursive: true })

const db = new DatabaseSync(dbPath)
db.exec(`
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
`)

const CLEAR_COLUMNS = {
  easy: 'cleared_easy',
  normal: 'cleared_normal',
  hard: 'cleared_hard',
  impossible: 'cleared_impossible'
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 32).toString('hex')
}

function sameHash(actualHex, expectedHex) {
  const actual = Buffer.from(actualHex, 'hex')
  const expected = Buffer.from(expectedHex, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function validUsername(username) {
  return typeof username === 'string' && /^[\p{L}\p{N}_]{2,16}$/u.test(username)
}

function validPassword(password) {
  return typeof password === 'string' && password.length >= 4 && password.length <= 64
}

function profileOf(row) {
  const clears = {
    easy: row.cleared_easy === 1,
    normal: row.cleared_normal === 1,
    hard: row.cleared_hard === 1,
    impossible: row.cleared_impossible === 1
  }
  const title = clears.impossible ? '명예의 전당' : ''
  return {
    username: row.username,
    title,
    displayName: title ? `${row.username} ${title}` : row.username,
    clears,
    unlocked: {
      easy: true,
      normal: true,
      hard: clears.normal,
      impossible: clears.hard
    }
  }
}

function userByName(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username)
}

function userByToken(token) {
  if (!token) return null
  return db.prepare(`
    SELECT users.* FROM sessions
    JOIN users ON users.username = sessions.username
    WHERE sessions.token = ?
  `).get(token)
}

function bearer(req) {
  const header = req.headers.authorization || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : ''
}

function issueSession(username) {
  const token = randomBytes(24).toString('hex')
  db.prepare('INSERT INTO sessions (token, username, created_at) VALUES (?, ?, ?)').run(token, username, new Date().toISOString())
  return token
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', chunk => {
      size += chunk.length
      if (size > 100000) {
        reject(Object.assign(new Error('요청이 너무 큽니다.'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (chunks.length === 0) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(Object.assign(new Error('요청 형식이 잘못되었습니다.'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  })
  res.end(JSON.stringify(body))
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      send(res, 200, { ok: true })
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/register') {
      const body = await readJson(req)
      if (!validUsername(body.username)) {
        send(res, 400, { error: '아이디는 2자에서 16자의 글자, 숫자, 밑줄만 사용할 수 있습니다.' })
        return
      }
      if (!validPassword(body.password)) {
        send(res, 400, { error: '비밀번호는 4자에서 64자여야 합니다.' })
        return
      }
      if (userByName(body.username)) {
        send(res, 409, { error: '이미 있는 아이디입니다.' })
        return
      }
      const salt = randomBytes(16).toString('hex')
      db.prepare(`
        INSERT INTO users (username, password_hash, salt, created_at)
        VALUES (?, ?, ?, ?)
      `).run(body.username, hashPassword(body.password, salt), salt, new Date().toISOString())
      const token = issueSession(body.username)
      send(res, 201, { token, profile: profileOf(userByName(body.username)) })
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/login') {
      const body = await readJson(req)
      const row = validUsername(body.username) ? userByName(body.username) : null
      if (!row || !validPassword(body.password) || !sameHash(hashPassword(body.password, row.salt), row.password_hash)) {
        send(res, 401, { error: '아이디 또는 비밀번호가 맞지 않습니다.' })
        return
      }
      const token = issueSession(row.username)
      send(res, 200, { token, profile: profileOf(row) })
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/logout') {
      const token = bearer(req)
      if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
      send(res, 200, { ok: true })
      return
    }
    if (req.method === 'GET' && url.pathname === '/api/me') {
      const row = userByToken(bearer(req))
      if (!row) {
        send(res, 401, { error: '로그인이 필요합니다.' })
        return
      }
      send(res, 200, profileOf(row))
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/clear') {
      const row = userByToken(bearer(req))
      if (!row) {
        send(res, 401, { error: '로그인이 필요합니다.' })
        return
      }
      const body = await readJson(req)
      const column = CLEAR_COLUMNS[body.difficulty]
      if (!column) {
        send(res, 400, { error: '알 수 없는 난이도입니다.' })
        return
      }
      if (body.difficulty === 'hard' && row.cleared_normal !== 1) {
        send(res, 403, { error: '보통을 클리어해야 어려움을 기록할 수 있습니다.' })
        return
      }
      if (body.difficulty === 'impossible' && row.cleared_hard !== 1) {
        send(res, 403, { error: '어려움을 클리어해야 불가능을 기록할 수 있습니다.' })
        return
      }
      db.prepare(`UPDATE users SET ${column} = 1 WHERE username = ?`).run(row.username)
      send(res, 200, profileOf(userByName(row.username)))
      return
    }
    send(res, 404, { error: '없는 주소입니다.' })
  } catch (error) {
    if (res.headersSent) return
    send(res, error.status || 500, { error: error.status ? error.message : '서버 오류가 났습니다.' })
  }
})

const port = Number(process.env.PORT || 8787)
server.listen(port, '127.0.0.1', () => {
  console.log(`ACCOUNT_SERVER ${server.address().port}`)
})
