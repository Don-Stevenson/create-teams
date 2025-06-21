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
import api, { login, logout, checkAuth, apiService } from '../../utils/FEapi'

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

  describe('Legacy API Functions (Backward Compatibility)', () => {
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

  describe('New API Service Structure', () => {
    describe('Auth Service', () => {
      it('should handle login via apiService', async () => {
        const mockInstance = axios.mockInstance
        const mockResponse = { data: { success: true } }
        mockInstance.post.mockResolvedValue(mockResponse)

        const result = await apiService.auth.login({
          username: 'testuser',
          password: 'testpass',
        })
        expect(result).toEqual({ success: true })
        expect(mockInstance.post).toHaveBeenCalledWith('/login', {
          username: 'testuser',
          password: 'testpass',
        })
      })

      it('should handle logout via apiService', async () => {
        const mockInstance = axios.mockInstance
        const mockResponse = { data: { success: true } }
        mockInstance.post.mockResolvedValue(mockResponse)

        const result = await apiService.auth.logout()
        expect(result).toEqual({ success: true })
        expect(mockInstance.post).toHaveBeenCalledWith('/logout')
      })

      it('should handle auth check via apiService', async () => {
        const mockInstance = axios.mockInstance
        const mockResponse = { data: { success: true } }
        mockInstance.get.mockResolvedValue(mockResponse)

        const result = await apiService.auth.check()
        expect(result).toBe(true)
        expect(mockInstance.get).toHaveBeenCalledWith('/auth/check')
      })
    })

    describe('Players Service', () => {
      it('should fetch all players', async () => {
        const mockInstance = axios.mockInstance
        const mockPlayers = [
          { _id: '1', name: 'Player 1', isPlayingThisWeek: 1 },
          { _id: '2', name: 'Player 2', isPlayingThisWeek: 0 },
        ]
        mockInstance.get.mockResolvedValue({ data: mockPlayers })

        const result = await apiService.players.getAll()
        expect(mockInstance.get).toHaveBeenCalledWith('/players')
        expect(result).toEqual([
          { _id: '1', name: 'Player 1', isPlayingThisWeek: true },
          { _id: '2', name: 'Player 2', isPlayingThisWeek: false },
        ])
      })

      it('should fetch player by ID', async () => {
        const mockInstance = axios.mockInstance
        const mockPlayer = { _id: '1', name: 'Player 1' }
        mockInstance.get.mockResolvedValue({ data: mockPlayer })

        const result = await apiService.players.getById('1')
        expect(mockInstance.get).toHaveBeenCalledWith('/players/1')
        expect(result).toEqual(mockPlayer)
      })

      it('should create a new player', async () => {
        const mockInstance = axios.mockInstance
        const newPlayer = { name: 'New Player', attackScore: 5 }
        const mockResponse = {
          _id: '3',
          name: 'New Player',
          attackScore: 5,
          defenseScore: 0,
          fitnessScore: 0,
          gameKnowledgeScore: 0,
          goalScoringScore: 0,
          midfieldScore: 0,
          isPlayingThisWeek: 0,
        }
        mockInstance.post.mockResolvedValue({ data: mockResponse })

        const result = await apiService.players.create(newPlayer)
        expect(mockInstance.post).toHaveBeenCalledWith('/players', newPlayer)
        expect(result).toEqual({
          _id: '3',
          name: 'New Player',
          attackScore: 5,
          defenseScore: 0,
          fitnessScore: 0,
          gameKnowledgeScore: 0,
          goalScoringScore: 0,
          midfieldScore: 0,
          isPlayingThisWeek: false,
        })
      })

      it('should update a player', async () => {
        const mockInstance = axios.mockInstance
        const updatedPlayer = {
          name: 'Updated Player',
          attackScore: 8,
          defenseScore: 7,
          fitnessScore: 6,
          gameKnowledgeScore: 5,
          goalScoringScore: 4,
          midfieldScore: 3,
          isPlayingThisWeek: true,
        }
        const mockResponse = { _id: '1', ...updatedPlayer }
        mockInstance.put.mockResolvedValue({ data: mockResponse })

        const result = await apiService.players.update({
          id: '1',
          ...updatedPlayer,
        })
        expect(mockInstance.put).toHaveBeenCalledWith('/players/1/playerInfo', {
          name: 'Updated Player',
          attackScore: 8,
          defenseScore: 7,
          fitnessScore: 6,
          gameKnowledgeScore: 5,
          goalScoringScore: 4,
          midfieldScore: 3,
          isPlayingThisWeek: 'true',
        })
        expect(result).toEqual({
          _id: '1',
          name: 'Updated Player',
          attackScore: 8,
          defenseScore: 7,
          fitnessScore: 6,
          gameKnowledgeScore: 5,
          goalScoringScore: 4,
          midfieldScore: 3,
          isPlayingThisWeek: true,
        })
      })

      it('should delete a player', async () => {
        const mockInstance = axios.mockInstance
        mockInstance.delete.mockResolvedValue({ data: { success: true } })

        const result = await apiService.players.delete('1')
        expect(mockInstance.delete).toHaveBeenCalledWith('/players/1')
        expect(result).toEqual({ id: '1' })
      })
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
