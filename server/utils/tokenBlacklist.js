// Token blacklist to track invalidated tokens
const tokenBlacklist = new Set()

export const addToBlacklist = token => {
  tokenBlacklist.add(token)
}

export const isBlacklisted = token => {
  return tokenBlacklist.has(token)
}

export const getBlacklist = () => {
  return tokenBlacklist
}
