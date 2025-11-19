// Mock NextResponse before importing
jest.mock('next/server', () => {
  class MockNextResponse extends Response {
    constructor(body, init = {}) {
      super(body, init)
      this._jsonData = null
      // Make headers.set chainable and store headers properly
      const headersMap = new Map()
      // Initialize with existing headers
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          headersMap.set(key.toLowerCase(), value)
        })
      }
      this.headers = {
        get: name => headersMap.get(name.toLowerCase()),
        set: (name, value) => {
          headersMap.set(name.toLowerCase(), value)
          return this.headers
        },
        has: name => headersMap.has(name.toLowerCase()),
      }
      // Mock cookies.set method
      this.cookies = {
        set: jest.fn(),
      }
    }

    static json(data, init = {}) {
      const response = new MockNextResponse(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers,
        },
      })
      response._jsonData = data
      return response
    }

    async json() {
      if (this._jsonData !== null) {
        return this._jsonData
      }
      const text = await this.text()
      return text ? JSON.parse(text) : null
    }
  }

  return {
    NextResponse: MockNextResponse,
  }
})

// Mock the dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('../../src/lib/db/connectDB', () => jest.fn())

jest.mock('../../src/lib/models/User', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
}))

jest.mock('../../src/lib/utils/sessionStore', () => ({
  invalidateSession: jest.fn(),
}))

jest.mock('../../src/lib/utils/tokenBlacklist', () => ({
  addToBlacklist: jest.fn(),
}))

jest.mock('../../src/lib/utils/cors', () => ({
  corsHeaders: jest.fn(() => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })),
}))

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import connectDB from '../../src/lib/db/connectDB'
import User from '../../src/lib/models/User'
import { invalidateSession } from '../../src/lib/utils/sessionStore'
import { addToBlacklist } from '../../src/lib/utils/tokenBlacklist'
import { corsHeaders } from '../../src/lib/utils/cors'
import { DELETE, OPTIONS } from '../../src/app/api/delete-user/route'

describe('Delete User API Route', () => {
  let mockRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('http://localhost:3000'),
      },
      json: jest.fn(),
    }

    // Set environment variables
    process.env.JWT_SECRET = 'test-secret'
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
    delete process.env.NODE_ENV
  })

  describe('OPTIONS - CORS preflight', () => {
    it('should return 200 with CORS headers', async () => {
      const response = await OPTIONS(mockRequest)

      expect(response.status).toBe(200)
      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
    })
  })

  describe('DELETE - Successful Deletions', () => {
    beforeEach(() => {
      // Default successful auth setup
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      })
      jwt.verify.mockReturnValue({ userId: 'user123' })
      bcrypt.compare.mockResolvedValue(true)
      connectDB.mockResolvedValue(true)
    })

    it('should successfully delete authenticated user (self-deletion)', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findById.mockResolvedValue(mockUser)
      User.findByIdAndDelete.mockResolvedValue(mockUser)
      mockRequest.json.mockResolvedValue({ password: 'correctPassword' })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(connectDB).toHaveBeenCalled()
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
      expect(User.findById).toHaveBeenCalledWith('user123')
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correctPassword',
        'hashedPassword'
      )
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123')
      expect(invalidateSession).toHaveBeenCalledWith('valid-token')
      expect(addToBlacklist).toHaveBeenCalledWith('valid-token')
      expect(data.success).toBe(true)
      expect(data.message).toBe('Account deleted successfully')
      expect(data.deletedUser).toBe('testuser')
      expect(response.cookies.set).toHaveBeenCalledWith('token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
    })

    it('should successfully delete another user by username', async () => {
      const mockAuthUser = {
        _id: 'admin123',
        username: 'admin',
        password: 'hashedPassword',
      }
      const mockTargetUser = {
        _id: 'user456',
        username: 'targetuser',
        password: 'hashedPassword2',
      }

      User.findById.mockResolvedValue(mockAuthUser)
      User.findOne.mockResolvedValue(mockTargetUser)
      User.findByIdAndDelete.mockResolvedValue(mockTargetUser)
      mockRequest.json.mockResolvedValue({
        password: 'adminPassword',
        username: 'targetuser',
      })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(User.findOne).toHaveBeenCalledWith({ username: 'targetuser' })
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user456')
      expect(data.success).toBe(true)
      expect(data.message).toBe("User 'targetuser' deleted successfully")
      expect(data.deletedUser).toBe('targetuser')
    })

    it('should use token from authorization header when cookie is not present', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      })
      mockRequest.headers.get.mockImplementation(header => {
        if (header === 'authorization') return 'Bearer valid-token'
        return 'http://localhost:3000'
      })
      User.findById.mockResolvedValue(mockUser)
      User.findByIdAndDelete.mockResolvedValue(mockUser)
      mockRequest.json.mockResolvedValue({ password: 'correctPassword' })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
      expect(data.success).toBe(true)
    })
  })

  describe('DELETE - Authentication Errors', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should return 401 when no token is provided', async () => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      })
      mockRequest.headers.get.mockImplementation(header => {
        if (header === 'authorization') return null
        return 'http://localhost:3000'
      })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthenticated request')
      expect(User.findById).not.toHaveBeenCalled()
    })

    it('should return 401 when token is invalid', async () => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'invalid-token' }),
      })
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Invalid or expired token')
      expect(User.findById).not.toHaveBeenCalled()
    })

    it('should return 401 when token is expired', async () => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'expired-token' }),
      })
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired')
        error.name = 'TokenExpiredError'
        throw error
      })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Invalid or expired token')
    })
  })

  describe('DELETE - Validation Errors', () => {
    beforeEach(() => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      })
      jwt.verify.mockReturnValue({ userId: 'user123' })
      connectDB.mockResolvedValue(true)
    })

    it('should return 400 when password is missing', async () => {
      mockRequest.json.mockResolvedValue({})

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Password is required to delete account')
      expect(User.findById).not.toHaveBeenCalled()
    })

    it('should return 404 when authenticated user is not found', async () => {
      User.findById.mockResolvedValue(null)
      mockRequest.json.mockResolvedValue({ password: 'password' })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe('Authenticated user not found')
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('should return 401 when password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findById.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)
      mockRequest.json.mockResolvedValue({ password: 'wrongPassword' })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Invalid password')
      expect(User.findByIdAndDelete).not.toHaveBeenCalled()
    })

    it('should return 404 when target user by username is not found', async () => {
      const mockAuthUser = {
        _id: 'admin123',
        username: 'admin',
        password: 'hashedPassword',
      }

      User.findById.mockResolvedValue(mockAuthUser)
      User.findOne.mockResolvedValue(null)
      bcrypt.compare.mockResolvedValue(true)
      mockRequest.json.mockResolvedValue({
        password: 'adminPassword',
        username: 'nonexistent',
      })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe("User 'nonexistent' not found")
      expect(User.findByIdAndDelete).not.toHaveBeenCalled()
    })
  })

  describe('DELETE - Server Errors', () => {
    beforeEach(() => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      })
      jwt.verify.mockReturnValue({ userId: 'user123' })
    })

    it('should return 500 when database connection fails', async () => {
      connectDB.mockRejectedValue(new Error('Database connection failed'))

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should return 500 when database query fails', async () => {
      connectDB.mockResolvedValue(true)
      User.findById.mockRejectedValue(new Error('Database query failed'))
      mockRequest.json.mockResolvedValue({ password: 'password' })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database query failed')
    })

    it('should return 500 when deletion fails', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      connectDB.mockResolvedValue(true)
      User.findById.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      User.findByIdAndDelete.mockRejectedValue(new Error('Deletion failed'))
      mockRequest.json.mockResolvedValue({ password: 'password' })

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Deletion failed')
    })
  })

  describe('DELETE - CORS Headers', () => {
    beforeEach(() => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      })
      jwt.verify.mockReturnValue({ userId: 'user123' })
      connectDB.mockResolvedValue(true)
    })

    it('should include CORS headers in successful response', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findById.mockResolvedValue(mockUser)
      User.findByIdAndDelete.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      mockRequest.json.mockResolvedValue({ password: 'password' })

      const response = await DELETE(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })

    it('should include CORS headers in error response', async () => {
      mockRequest.json.mockResolvedValue({})

      const response = await DELETE(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })
  })

  describe('DELETE - Cookie Handling', () => {
    it('should clear authentication cookie in production', async () => {
      process.env.NODE_ENV = 'production'
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      })
      jwt.verify.mockReturnValue({ userId: 'user123' })
      connectDB.mockResolvedValue(true)
      User.findById.mockResolvedValue(mockUser)
      User.findByIdAndDelete.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      mockRequest.json.mockResolvedValue({ password: 'password' })

      const response = await DELETE(mockRequest)

      expect(response.cookies.set).toHaveBeenCalledWith('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
    })
  })
})
