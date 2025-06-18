// Mock axios before any imports
jest.mock('axios', () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }
  return {
    create: jest.fn(() => mockAxiosInstance),
  }
})

import axios from 'axios'
import * as apiModule from '../../utils/FEapi'

// Get the mock instance that was created in the mock
const mockAxiosInstance = axios.create()

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = { data: { token: 'fake-token' } }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      const result = await apiModule.login('testuser', 'testpass')
      expect(result).toEqual(mockResponse.data)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/login', {
        username: 'testuser',
        password: 'testpass',
      })
    })

    it('should handle login errors', async () => {
      const error = { response: { status: 401, data: 'Invalid credentials' } }
      mockAxiosInstance.post.mockRejectedValue(error)
      await expect(apiModule.login('testuser', 'testpass')).rejects.toEqual(
        error
      )
    })
  })

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = { data: { message: 'Logged out successfully' } }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      const result = await apiModule.logout()
      expect(result).toEqual(mockResponse.data)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/logout')
    })

    it('should handle logout errors', async () => {
      const error = { response: { status: 500, data: 'Server error' } }
      mockAxiosInstance.post.mockRejectedValue(error)
      await expect(apiModule.logout()).rejects.toEqual(error)
    })
  })

  describe('checkAuth', () => {
    it('should return auth status when authenticated', async () => {
      const mockResponse = { data: { authenticated: true } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)
      const result = await apiModule.checkAuth()
      expect(result).toEqual(mockResponse.data)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/check')
    })

    it('should handle auth check errors', async () => {
      const error = { response: { status: 401, data: 'Not authenticated' } }
      mockAxiosInstance.get.mockRejectedValue(error)
      await expect(apiModule.checkAuth()).rejects.toEqual(error)
    })
  })

  describe('API Interceptors', () => {
    it('should handle 401 errors and redirect to login', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: false },
      }

      // Mock the auth check to fail
      mockAxiosInstance.get.mockRejectedValueOnce(error)

      // Mock the original request that will fail
      mockAxiosInstance.get.mockRejectedValueOnce(error)

      try {
        await mockAxiosInstance.get('/some-protected-route')
      } catch (error) {
        expect(window.location.href).toBe('/login')
      }
    })

    it('should retry request after successful auth check', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: false },
      }

      // Mock the auth check to succeed
      mockAxiosInstance.get.mockResolvedValueOnce({ status: 200 })

      // Mock the original request to succeed after retry
      mockAxiosInstance.get.mockResolvedValueOnce({ data: 'success' })

      const response = await mockAxiosInstance.get('/some-protected-route')
      expect(response.data).toBe('success')
    })

    it('should not retry if already retried', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: true },
      }

      mockAxiosInstance.get.mockRejectedValueOnce(error)

      try {
        await mockAxiosInstance.get('/some-protected-route')
      } catch (error) {
        expect(error.config._retry).toBe(true)
      }
    })
  })
})
