// components/LoginForm.js
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Login failed')
      }

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col items-center justify-center mt-60 gap-2">
        <div className="flex items-center text-3xl font-bold mb-4 border-3 border-red-600 rounded bg-red-500 w-60 text-white text-center h-40">
          Loons Team Balancer
        </div>
        <div className="flex-col">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="border border-gray-300 rounded w-40 h-8 mb-3 mr-3 text-center"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-gray-300 rounded w-40 h-8 mb-3 text-center"
            required
          />
        </div>
        <button
          type="submit"
          className="border border-gray-400 rounded w-36 h-8 bg-gray-200"
        >
          Login
        </button>
      </div>
    </form>
  )
}
