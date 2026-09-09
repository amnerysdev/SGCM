const SESSION_KEY = 'sgcm.session'

export function saveSession(authResponse) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(authResponse))
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  const session = JSON.parse(raw)
  if (new Date(session.expiration) <= new Date()) {
    clearSession()
    return null
  }
  return session
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}
