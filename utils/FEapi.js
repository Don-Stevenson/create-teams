// utils/api.js
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  config => {
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

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const authCheck = await api.get('/auth/check')

        if (authCheck.status === 200) {
          return api(originalRequest)
        }
      } catch (authError) {
        window.location.href = '/login'
        return Promise.reject(authError)
      }
    }

    console.error('API Error:', error.response)
    return Promise.reject(error)
  }
)

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password })
    return response.data
  } catch (error) {
    console.error('Login Error:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    const response = await api.post('/logout')
    return response.data
  } catch (error) {
    console.error('Logout Error:', error)
    throw error
  }
}

export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/check')
    return response.data
  } catch (error) {
    throw error
  }
}

export default api
