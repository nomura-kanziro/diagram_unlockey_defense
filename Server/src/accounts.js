import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'

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

export function profileOf(row) {
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

function bearer(req) {
  const header = req.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : ''
}

function requireUser(store, req, res, next) {
  const row = store.userByToken(bearer(req))
  if (!row) {
    res.status(401).json({ error: '로그인이 필요합니다.' })
    return
  }
  req.user = row
  next()
}

export function accountRouter(store) {
  const router = Router()

  router.get('/health', (req, res) => {
    res.json({ ok: true })
  })

  router.post('/register', (req, res) => {
    const username = req.body?.username
    const password = req.body?.password
    if (!validUsername(username)) {
      res.status(400).json({ error: '아이디는 2자에서 16자의 글자, 숫자, 밑줄만 사용할 수 있습니다.' })
      return
    }
    if (!validPassword(password)) {
      res.status(400).json({ error: '비밀번호는 4자에서 64자여야 합니다.' })
      return
    }
    if (store.userByName(username)) {
      res.status(409).json({ error: '이미 있는 아이디입니다.' })
      return
    }
    const salt = randomBytes(16).toString('hex')
    store.insertUser(username, hashPassword(password, salt), salt)
    const token = randomBytes(24).toString('hex')
    store.insertSession(token, username)
    res.status(201).json({ token, profile: profileOf(store.userByName(username)) })
  })

  router.post('/login', (req, res) => {
    const username = req.body?.username
    const password = req.body?.password
    const row = validUsername(username) ? store.userByName(username) : null
    if (!row || !validPassword(password) || !sameHash(hashPassword(password, row.salt), row.password_hash)) {
      res.status(401).json({ error: '아이디 또는 비밀번호가 맞지 않습니다.' })
      return
    }
    const token = randomBytes(24).toString('hex')
    store.insertSession(token, row.username)
    res.json({ token, profile: profileOf(row) })
  })

  router.post('/logout', (req, res) => {
    const token = bearer(req)
    if (token) store.deleteSession(token)
    res.json({ ok: true })
  })

  router.get('/me', (req, res) => {
    requireUser(store, req, res, () => {
      res.json(profileOf(req.user))
    })
  })

  router.post('/clear', (req, res) => {
    requireUser(store, req, res, () => {
      const difficulty = req.body?.difficulty
      const column = CLEAR_COLUMNS[difficulty]
      if (!column) {
        res.status(400).json({ error: '알 수 없는 난이도입니다.' })
        return
      }
      if (difficulty === 'hard' && req.user.cleared_normal !== 1) {
        res.status(403).json({ error: '보통을 클리어해야 어려움을 기록할 수 있습니다.' })
        return
      }
      if (difficulty === 'impossible' && req.user.cleared_hard !== 1) {
        res.status(403).json({ error: '어려움을 클리어해야 불가능을 기록할 수 있습니다.' })
        return
      }
      store.markClear(column, req.user.username)
      res.json(profileOf(store.userByName(req.user.username)))
    })
  })

  return router
}
