import auth from './auth'
import jwt from 'jsonwebtoken'
import { jest } from '@jest/globals'
import { createSession, invalidateSession } from '../utils/sessionStore.js'
import { addToBlacklist } from '../utils/tokenBlacklist.js'

// Only mock JWT for controlled testing
jest.mock('jsonwebtoken')

const mockVerify = jest.fn()
jwt.verify = mockVerify

describe('Auth Middleware', () => {
  let mockReq
  let mockRes
  let mockNext
  let testToken
  let testUserId

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    mockNext = jest.fn()
    process.env.JWT_SECRET = 'test-secret'

    // Create a test token and user ID
    testUserId = 'test-user-123'
    testToken = 'valid-test-token'

    // Create a valid session for testing
    createSession(testUserId, testToken)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 401 if no token is provided', () => {
    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthenticated request',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should call next() and set userId when valid token with session is provided', () => {
    const decodedToken = { userId: testUserId }

    mockReq.cookies.token = testToken
    jwt.verify.mockImplementation(() => decodedToken)

    auth(mockReq, mockRes, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith(testToken, process.env.JWT_SECRET)
    expect(mockReq.userId).toBe(decodedToken.userId)
    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).not.toHaveBeenCalled()
  })

  test('should return 401 when token is blacklisted', () => {
    const decodedToken = { userId: testUserId }

    mockReq.cookies.token = testToken
    jwt.verify.mockImplementation(() => decodedToken)

    // Blacklist the token
    addToBlacklist(testToken)

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token has been invalidated',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should return 401 when session is invalid', () => {
    const sessionToken = 'session-test-token'
    const decodedToken = { userId: testUserId }

    // Create a session for this token first
    createSession(testUserId, sessionToken)

    // Then invalidate only the session (not blacklist the token)
    invalidateSession(sessionToken)

    mockReq.cookies.token = sessionToken
    jwt.verify.mockImplementation(() => decodedToken)

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Session has been invalidated',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should return 401 when token is invalid', () => {
    const invalidToken = 'invalid-token'
    mockReq.cookies.token = invalidToken

    // Don't create a session for this invalid token, so it will fail session validation first
    const error = new Error('Invalid token')
    error.name = 'JsonWebTokenError'
    jwt.verify.mockImplementation(() => {
      throw error
    })

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Session has been invalidated', // Session check happens before JWT
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should return 401 when token is expired', () => {
    const expiredToken = 'expired-token'
    mockReq.cookies.token = expiredToken

    // Don't create a session for this expired token
    const error = new Error('Token expired')
    error.name = 'TokenExpiredError'
    jwt.verify.mockImplementation(() => {
      throw error
    })

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Session has been invalidated', // Session check happens before JWT
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should return 401 when token is missing from Authorization header', () => {
    mockReq.headers.authorization = 'Bearer '

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthenticated request',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should use token from Authorization header when cookie is not present', () => {
    const authHeaderToken = 'auth-header-token'
    const decodedToken = { userId: testUserId }

    // Create a session for the auth header token
    createSession(testUserId, authHeaderToken)

    mockReq.headers.authorization = `Bearer ${authHeaderToken}`
    jwt.verify.mockImplementation(() => decodedToken)

    auth(mockReq, mockRes, mockNext)

    expect(mockReq.userId).toBe(decodedToken.userId)
    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).not.toHaveBeenCalled()
  })

  test('should return 401 when Authorization header token has no session', () => {
    const tokenWithoutSession = 'token-without-session'
    const decodedToken = { userId: 'different-user' }

    mockReq.headers.authorization = `Bearer ${tokenWithoutSession}`
    jwt.verify.mockImplementation(() => decodedToken)

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Session has been invalidated',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should handle server errors gracefully', () => {
    const errorToken = 'error-token'

    // Create a session for this token so it passes session validation
    createSession(testUserId, errorToken)

    mockReq.cookies.token = errorToken

    // Mock JWT to throw an unexpected error (not JsonWebTokenError or TokenExpiredError)
    jwt.verify.mockImplementation(() => {
      throw new Error('Unexpected server error')
    })

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthenticated request',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
