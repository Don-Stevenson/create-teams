// utils/api.js
import axios from 'axios'
import config_url from '../config'

const api = axios.create({
<<<<<<< HEAD
  baseURL: `${config_url}/api/`,
=======
  baseURL: 'http://localhost:5050/api/',
>>>>>>> d390735 (WIP: add select all / remove all for playing this week)
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
