import jwt from 'jsonwebtoken'
import { isBlacklisted } from '../utils/tokenBlacklist.js'
import { isSessionValid } from '../utils/sessionStore.js'

function auth(handler) {
  return async (req, res) => {
    try {
      // Check for token in cookies
      let token = req.cookies?.token

      // If no cookie token, check for Authorization header (Bearer token)
      if (!token) {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
          return res.status(401).json({ message: 'Unauthenticated request' })
        }
        token = authHeader.split(' ')[1] // Format: "Bearer TOKEN"
      }

      if (!token) {
        return res.status(401).json({ message: 'Unauthenticated request' })
      }

      // Check if token is blacklisted
      const blacklisted = isBlacklisted(token)
      if (blacklisted) {
        return res.status(401).json({ message: 'Token has been invalidated' })
      }

      // Check if session is valid
      const sessionValid = isSessionValid(token)
      if (!sessionValid) {
        return res.status(401).json({ message: 'Session has been invalidated' })
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        req.token = token

        return handler(req, res)
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' })
        }
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Unauthenticated request' })
        }
        throw error
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ message: 'Unauthenticated request' })
    }
  }
}

export default auth
