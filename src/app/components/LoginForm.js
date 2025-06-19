'use client'

// components/LoginForm.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoonsBadge from '../assets/img/TWSC.webp'
import Image from 'next/image'
import { login } from '../../../utils/FEapi'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await login(username, password)
      if (data.success) {
        setError(false)
        router.push('/create-teams')
        router.refresh() // Force a refresh of the page to update authentication state
      } else {
        setError(true)
      }
    } catch (error) {
      setError(true)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="login-form"
      className="min-h-screen bg-background"
    >
      <div className="flex flex-col items-center justify-center mt-20 gap-2">
        <Image
          width={100}
          height={125}
          src={LoonsBadge}
          alt="Toronto Walking Soccer Loons Club Logo"
          priority
        />
        <div className="flex bg-loonsDarkBrown z-0 w-[248px] justify-center h-[168px] items-center rounded mb-4">
          <div className="flex items-center justify-center text-3xl font-bold border-[8px] border-loonsRed rounded bg-loonsBrown w-60 text-loonsBeige text-center h-40 z-10">
            Loons Team Balancer
          </div>
        </div>
        <div className="flex flex-col justify-center xs:flex-row gap-3 mb-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Username"
            required
            disabled={isLoading}
            className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Password"
            required
            disabled={isLoading}
            className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
        </div>
        <div className="flex justify-center items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="border border-gray-400 rounded w-36 h-8 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
      <div className="flex justify-center text-center items-center text-loonsRed h-10">
        {error ? "There's been an error. Please try again" : ''}
      </div>
    </form>
  )
}
