import auth from './auth'
import jwt from 'jsonwebtoken'
import { jest } from '@jest/globals'

jest.mock('jsonwebtoken')

const mockVerify = jest.fn()
jwt.verify = mockVerify

describe('Auth Middleware', () => {
  let mockReq
  let mockRes
  let mockNext

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

  test('should call next() and set userId when valid token is provided', () => {
    const token = 'valid-token'
    const decodedToken = { userId: '123' }

    mockReq.cookies.token = token
    jwt.verify.mockImplementation(() => decodedToken)

    auth(mockReq, mockRes, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
    expect(mockReq.userId).toBe(decodedToken.userId)
    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).not.toHaveBeenCalled()
  })

  test('should return 401 when token is invalid', () => {
    const token = 'invalid-token'
    mockReq.cookies.token = token

    const error = new Error('Invalid token')
    error.name = 'JsonWebTokenError'
    jwt.verify.mockImplementation(() => {
      throw error
    })

    auth(mockReq, mockRes, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthenticated request',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  test('should return 401 when token is expired', () => {
    const token = 'expired-token'
    mockReq.cookies.token = token

    const error = new Error('Token expired')
    error.name = 'TokenExpiredError'
    jwt.verify.mockImplementation(() => {
      throw error
    })

    auth(mockReq, mockRes, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token has expired',
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
    const token = 'valid-token'
    const decodedToken = { userId: '123' }

    mockReq.headers.authorization = `Bearer ${token}`
    jwt.verify.mockImplementation(() => decodedToken)

    auth(mockReq, mockRes, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
    expect(mockReq.userId).toBe(decodedToken.userId)
    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).not.toHaveBeenCalled()
  })
})
