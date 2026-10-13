import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = mkdtempSync(join(tmpdir(), 'diagram-accounts-'))
const dbPath = join(dir, 'accounts.sqlite')
const serverPath = fileURLToPath(new URL('./index.js', import.meta.url))
const child = spawn(process.execPath, [serverPath], {
  env: { ...process.env, PORT: '0', DB_PATH: dbPath },
  stdio: ['ignore', 'pipe', 'pipe']
})

let stderr = ''
child.stderr.on('data', chunk => { stderr += chunk })

const port = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`서버가 시작되지 않았습니다. ${stderr}`)), 8000)
  let buffer = ''
  child.stdout.on('data', chunk => {
    buffer += chunk
    const match = buffer.match(/ACCOUNT_SERVER (\d+)/)
    if (match) {
      clearTimeout(timer)
      resolve(Number(match[1]))
    }
  })
  child.on('exit', code => {
    clearTimeout(timer)
    reject(new Error(`서버 종료 ${code}. ${stderr}`))
  })
})

const failures = []
function expect(name, actual, expected) {
  if (actual !== expected) failures.push(`${name}: 기대 ${expected}, 실제 ${actual}`)
}

async function call(path, { method = 'GET', token = '', body } = {}) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

try {
  const created = await call('/api/register', { method: 'POST', body: { username: 'shape', password: 'pass1' } })
  expect('가입 상태', created.status, 201)
  expect('가입 이름', created.data.profile.displayName, 'shape')
  expect('어려움 잠금', created.data.profile.unlocked.hard, false)
  const duplicate = await call('/api/register', { method: 'POST', body: { username: 'shape', password: 'pass1' } })
  expect('중복 가입', duplicate.status, 409)
  const bad = await call('/api/login', { method: 'POST', body: { username: 'shape', password: 'nope' } })
  expect('틀린 비밀번호', bad.status, 401)
  const login = await call('/api/login', { method: 'POST', body: { username: 'shape', password: 'pass1' } })
  expect('로그인', login.status, 200)
  const token = login.data.token
  const me = await call('/api/me', { token })
  expect('내 정보', me.data.username, 'shape')
  const easy = await call('/api/clear', { method: 'POST', token, body: { difficulty: 'easy' } })
  expect('쉬움 기록', easy.data.clears.easy, true)
  expect('쉬움은 어려움을 열지 않음', easy.data.unlocked.hard, false)
  const blocked = await call('/api/clear', { method: 'POST', token, body: { difficulty: 'hard' } })
  expect('보통 없이 어려움', blocked.status, 403)
  const normal = await call('/api/clear', { method: 'POST', token, body: { difficulty: 'normal' } })
  expect('보통이 어려움을 염', normal.data.unlocked.hard, true)
  expect('불가능은 아직', normal.data.unlocked.impossible, false)
  const hard = await call('/api/clear', { method: 'POST', token, body: { difficulty: 'hard' } })
  expect('어려움이 불가능을 염', hard.data.unlocked.impossible, true)
  const impossible = await call('/api/clear', { method: 'POST', token, body: { difficulty: 'impossible' } })
  expect('명예의 전당', impossible.data.displayName, 'shape 명예의 전당')
  expect('칭호', impossible.data.title, '명예의 전당')
  if (failures.length) {
    console.error(failures.join('\n'))
    process.exitCode = 1
  } else {
    console.log('계정 확인 통과')
  }
} finally {
  child.kill()
  await new Promise(resolve => setTimeout(resolve, 200))
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  } catch {
    // 임시 데이터베이스가 잠시 잠겨 있어도 확인 결과는 유지한다.
  }
}
