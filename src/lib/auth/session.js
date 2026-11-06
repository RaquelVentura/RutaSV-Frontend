const storageKey = 'rutasv_session'

export function readSession() {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSession(session) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(session))
  } catch {
    return
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    return
  }
}

export function getToken() {
  return readSession()?.token ?? null
}
