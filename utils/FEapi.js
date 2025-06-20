// utils/api.js
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api', // Use relative URL in production to avoid CORS issues
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  config => {
    // Add cache-busting headers for GET requests in production
    if (config.method === 'get' && process.env.NODE_ENV === 'production') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      config.headers['Pragma'] = 'no-cache'
      config.headers['Expires'] = '0'

      // Add timestamp to prevent caching
      if (!config.params) {
        config.params = {}
      }
      config.params._t = Date.now()
    }

    // Only stringify if data exists and is an object
    if (config.data && typeof config.data === 'object') {
      // Ensure arrays are properly stringified
      if (Array.isArray(config.data.players)) {
        config.data = {
          ...config.data,
          players: config.data.players,
        }
      }
      config.data = JSON.stringify(config.data)
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors, but don't retry auth/check calls or logout calls
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/check') &&
      !originalRequest.url?.includes('/logout')
    ) {
      originalRequest._retry = true

      try {
        const authCheck = await api.get('/auth/check')

        if (authCheck.status === 200) {
          return api(originalRequest)
        }
      } catch (authError) {
        // Auth check failed, user is likely logged out
        // Just return the original error instead of the auth error
        console.log('Auth check failed during retry, user likely logged out')
        return Promise.reject(error)
      }
    }

    // Only log errors that aren't expected 401s after logout
    if (
      !(
        error.response?.status === 401 &&
        (originalRequest.url?.includes('/auth/check') ||
          originalRequest.url?.includes('/logout'))
      )
    ) {
      console.error('API Error:', error.response)
    }

    return Promise.reject(error)
  }
)

// Helper function to log persistently
const logPersistent = (message, data = null) => {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, message, data }

  // Store in localStorage
  const logs = JSON.parse(localStorage.getItem('authLogs') || '[]')
  logs.push(logEntry)
  if (logs.length > 50) logs.shift() // Keep only last 50 entries
  localStorage.setItem('authLogs', JSON.stringify(logs))
}

export const login = async (username, password) => {
  try {
    logPersistent('Login attempt', { username })
    const response = await api.post('/login', { username, password })
    logPersistent('Login successful', response.data)
    return response.data
  } catch (error) {
    logPersistent('Login failed', { error: error.message })
    console.error('Login Error:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    logPersistent('Logout attempt')
    const response = await api.post('/logout')
    logPersistent('Logout successful', response.data)

    // Manual cookie clearing as backup
    const isProduction = process.env.NODE_ENV === 'production'
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    if (!isProduction) {
      // Local development domains
      document.cookie =
        'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;'
      document.cookie =
        'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;'
      document.cookie =
        'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost:5050;'
      document.cookie =
        'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost:3000;'
    }

    logPersistent('Manual cookie clearing attempted')

    return response.data
  } catch (error) {
    logPersistent('Logout failed', { error: error.message })
    console.error('Logout Error:', error)
    throw error
  }
}

export const checkAuth = async () => {
  try {
    logPersistent('Auth check attempt')
    const response = await api.get('/auth/check')
    logPersistent('Auth check successful', response.data)
    return response.data.success
  } catch (error) {
    // Don't log 401 errors for auth checks as they are expected when user is not authenticated
    if (error.response?.status !== 401) {
      logPersistent('Auth check failed', {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    return false
  }
}

export const debugAuthState = async () => {
  try {
    logPersistent('Debug auth state attempt')
    const response = await api.get('/debug-auth-state')
    logPersistent('Debug auth state successful', response.data)
    return response.data
  } catch (error) {
    logPersistent('Debug auth state failed', {
      status: error.response?.status,
      data: error.response?.data,
    })
    throw error
  }
}

export const forceClearAuth = async () => {
  try {
    logPersistent('Force clear auth attempt')
    const response = await api.post('/force-clear-auth')
    logPersistent('Force clear auth successful', response.data)
    return response.data
  } catch (error) {
    logPersistent('Force clear auth failed', {
      status: error.response?.status,
      data: error.response?.data,
    })
    throw error
  }
}

// Function to get auth logs
export const getAuthLogs = () => {
  return JSON.parse(localStorage.getItem('authLogs') || '[]')
}

// Function to clear auth logs
export const clearAuthLogs = () => {
  localStorage.removeItem('authLogs')
}

// Make auth logs available globally for debugging
if (typeof window !== 'undefined') {
  window.clearAuthLogs = clearAuthLogs

  window.forceClearAuth = async () => {
    try {
      const result = await forceClearAuth()

      return result
    } catch (error) {
      console.error('Force clear auth error:', error)
      throw error
    }
  }
}

export default api
