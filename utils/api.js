// utils/api.js
import axios from 'axios'
import config_url from '../config'

const api = axios.create({
  baseURL: `${config_url}/api/`,
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
