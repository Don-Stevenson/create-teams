// Token blacklist to track invalidated tokens
const tokenBlacklist = new Set()

export const addToBlacklist = token => {
  tokenBlacklist.add(token)
}

export const isBlacklisted = token => {
  // In development, skip blacklist checks since in-memory store gets cleared on hot reload
  if (process.env.NODE_ENV === 'development') {
    return false
  }

  return tokenBlacklist.has(token)
}

export const getBlacklist = () => {
  return tokenBlacklist
}
