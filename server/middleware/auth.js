import jwt from 'jsonwebtoken'

function auth(req, res, next) {
  try {
    // Check for token in cookies
    let token = req.cookies?.token

    // If no cookie token, check for Authorization header (Bearer token)
    if (!token) {
      const authHeader = req.headers['authorization']
      if (!authHeader) {
        return res
          .status(401)
          .json({ message: 'No authentication token provided' })
      }
      token = authHeader.split(' ')[1] // Format: "Bearer TOKEN"
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.userId = decoded.userId

      // You might want to include more user data based on your token payload
      // For example, if your token contains role information:
      // req.userRole = decoded.role

      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' })
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' })
      }
      throw error
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res
      .status(500)
      .json({ message: 'Internal server error during authentication' })
  }
}

export default auth
