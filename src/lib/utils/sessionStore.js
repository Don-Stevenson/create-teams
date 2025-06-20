// Simple in-memory session store
const sessions = new Map()

export const createSession = (userId, token) => {
  sessions.set(token, {
    userId,
    createdAt: Date.now(),
    active: true,
  })
}

export const getSession = token => {
  return sessions.get(token)
}

export const invalidateSession = token => {
  if (sessions.has(token)) {
    sessions.delete(token)
    return true
  }
  return false
}

export const isSessionValid = token => {
  // In development, skip session validation since in-memory store gets cleared on hot reload
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const session = sessions.get(token)
  if (!session) return false

  // Check if session is older than 1 hour
  const oneHour = 60 * 60 * 1000
  if (Date.now() - session.createdAt > oneHour) {
    sessions.delete(token)
    return false
  }

  return session.active
}

export const getAllSessions = () => {
  return Array.from(sessions.entries())
}
