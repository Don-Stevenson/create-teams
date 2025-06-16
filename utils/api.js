// utils/api.js
import axios from 'axios'
import config_url from '../config'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5050/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  transformRequest: [
    (data, headers) => {
      // Log the request data
      console.log('Request data:', {
        data,
        type: typeof data,
        isArray: Array.isArray(data),
        stringified: JSON.stringify(data),
      })

      // Ensure data is properly stringified
      return JSON.stringify(data)
    },
  ],
  transformResponse: [
    data => {
      try {
        return JSON.parse(data)
      } catch (e) {
        return data
      }
    },
  ],
})

// Request interceptor
api.interceptors.request.use(
  config => {
    // Log request data for debugging
    if (config.data) {
      console.log('Request data:', {
        data: config.data,
        type: typeof config.data,
        isArray: Array.isArray(config.data),
        stringified: JSON.stringify(config.data),
      })
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
