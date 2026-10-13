const TOKEN_KEY = 'diagram-defense-token'

export function savedToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', token = '', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '요청에 실패했습니다.')
  return data
}

export function registerAccount(username, password) {
  return request('/api/register', { method: 'POST', body: { username, password } })
}

export function loginAccount(username, password) {
  return request('/api/login', { method: 'POST', body: { username, password } })
}

export function fetchProfile(token) {
  return request('/api/me', { token })
}

export function reportClear(token, difficulty) {
  return request('/api/clear', { method: 'POST', token, body: { difficulty } })
}

export function logoutAccount(token) {
  const done = token ? request('/api/logout', { method: 'POST', token }).catch(() => {}) : Promise.resolve()
  clearToken()
  return done
}
