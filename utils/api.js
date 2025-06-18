// utils/api.js
import axios from 'axios'
import config_url from '../config'

// Create axios instance
const api = axios.create({
  baseURL: `${config_url}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor
api.interceptors.request.use(
  config => {
    // You can add any request modifications here if needed
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
