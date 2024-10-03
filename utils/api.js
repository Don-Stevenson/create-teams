// utils/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://loons-team-balancer.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response)
    return Promise.reject(error)
  }
)

export default api
