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
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    mockNext = jest.fn()
    process.env.JWT_SECRET = 'test-secret'
  })

  jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
  }))

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return 401 if no token is provided', () => {
    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Authentication required',
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

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token')
    })

    auth(mockReq, mockRes, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
