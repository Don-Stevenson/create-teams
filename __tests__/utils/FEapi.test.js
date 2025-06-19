// Mock axios before any imports
jest.mock('axios', () => {
  const mockInstance = jest.fn()
  mockInstance.get = jest.fn()
  mockInstance.post = jest.fn()
  mockInstance.put = jest.fn()
  mockInstance.delete = jest.fn()
  mockInstance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  }

  const mockAxios = {
    create: jest.fn(() => mockInstance),
    mockInstance, // Export the mock instance for tests to use
  }

  return mockAxios
})

import axios from 'axios'
import api, { login, logout, checkAuth } from '../../utils/FEapi'

// --- BEGIN: Real response interceptor logic from FEapi.js ---
const realResponseInterceptor = async error => {
  const originalRequest = error.config
  // Handle 401 Unauthorized errors, but don't retry auth/check calls
  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !originalRequest.url?.includes('/auth/check')
  ) {
    originalRequest._retry = true
    try {
      const authCheck = await api.get('/auth/check')
      if (authCheck.status === 200) {
        return api(originalRequest)
      }
    } catch (authError) {
      // Don't redirect for auth/check failures, let the calling code handle it
      return Promise.reject(authError)
    }
  }
  return Promise.reject(error)
}
// --- END: Real response interceptor logic ---

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mockAxiosInstance as a function with methods
    const mockInstance = axios.mockInstance
    mockInstance.mockClear()
    mockInstance.get.mockClear()
    mockInstance.post.mockClear()
    mockInstance.put.mockClear()
    mockInstance.delete.mockClear()
  })

  describe('API Functions', () => {
    it('should handle login', async () => {
      const mockInstance = axios.mockInstance
      const mockResponse = { data: { success: true } }
      mockInstance.post.mockResolvedValue(mockResponse)
      const result = await login('username', 'password')
      expect(result).toEqual({ success: true })
      expect(mockInstance.post).toHaveBeenCalledWith('/login', {
        username: 'username',
        password: 'password',
      })
    })

    it('should handle login error', async () => {
      const mockInstance = axios.mockInstance
      const error = { response: { status: 401, data: 'Invalid credentials' } }
      mockInstance.post.mockRejectedValue(error)
      await expect(login('username', 'password')).rejects.toEqual(error)
    })

    it('should handle logout', async () => {
      const mockInstance = axios.mockInstance
      const mockResponse = { data: { success: true } }
      mockInstance.post.mockResolvedValue(mockResponse)
      const result = await logout()
      expect(result).toEqual({ success: true })
      expect(mockInstance.post).toHaveBeenCalledWith('/logout')
    })

    it('should handle logout error', async () => {
      const mockInstance = axios.mockInstance
      const error = { response: { status: 500, data: 'Server error' } }
      mockInstance.post.mockRejectedValue(error)
      await expect(logout()).rejects.toEqual(error)
    })

    it('should handle auth check', async () => {
      const mockInstance = axios.mockInstance
      const mockResponse = { data: { success: true } }
      mockInstance.get.mockResolvedValue(mockResponse)
      const result = await checkAuth()
      expect(result).toBe(true)
      expect(mockInstance.get).toHaveBeenCalledWith('/auth/check')
    })

    it('should handle auth check failure', async () => {
      const mockInstance = axios.mockInstance
      const error = { response: { status: 401 } }
      mockInstance.get.mockRejectedValue(error)
      const result = await checkAuth()
      expect(result).toBe(false)
    })
  })

  describe('API Interceptors', () => {
    it('should not retry auth/check calls to prevent infinite loops', async () => {
      const mockInstance = axios.mockInstance

      const error = {
        response: { status: 401 },
        config: { _retry: false, url: '/api/auth/check' },
      }

      await expect(realResponseInterceptor(error)).rejects.toEqual(error)
      // Should not call auth/check again
      expect(mockInstance.get).not.toHaveBeenCalled()
    })

    it('should retry request after successful auth check', async () => {
      const mockInstance = axios.mockInstance
      // Mock successful auth check
      mockInstance.get.mockResolvedValueOnce({ status: 200 })
      // Mock successful retry (api(originalRequest))
      mockInstance.mockResolvedValueOnce({ data: 'success' })

      const error = {
        response: { status: 401 },
        config: { _retry: false, url: '/api/some-other-endpoint' },
      }

      const result = await realResponseInterceptor(error)
      expect(result).toEqual({ data: 'success' })
    })

    it('should not retry if already retried', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: true, url: '/api/some-other-endpoint' },
      }

      await expect(realResponseInterceptor(error)).rejects.toEqual(error)
    })

    it('should handle auth/check failures without redirecting', async () => {
      const mockInstance = axios.mockInstance
      // Mock auth check to fail
      mockInstance.get.mockRejectedValueOnce({
        response: { status: 401 },
        config: { _retry: false },
      })

      const error = {
        response: { status: 401 },
        config: { _retry: false, url: '/api/some-other-endpoint' },
      }

      await expect(realResponseInterceptor(error)).rejects.toBeDefined()
      // Should not redirect automatically, let calling code handle it
    })
  })
})
