'use client'

// components/LoginForm.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoonsBadge from '../../../assets/img/TWSC.webp'
import Image from 'next/image'
import { useLogin } from '../../../hooks/useApi'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  const loginMutation = useLogin({
    onSuccess: data => {
      if (data.success) {
        setError(false)
        router.push('/create-teams')
        router.refresh() // Force a refresh of the page to update authentication state
      } else {
        setError(true)
      }
    },
    onError: error => {
      setError(true)
      console.error('Login error:', error)
    },
  })

  const handleSubmit = async e => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div className="flex flex-col items-center justify-center mt-20 gap-2">
        <div className="relative z-10 w-[6.25rem] h-[7.8125rem] top-[1.75rem]">
          <Image
            src={LoonsBadge}
            alt="Toronto Walking Soccer Loons Club Logo"
            priority
          />
        </div>
        <div className="flex bg-loonsDarkBrown z-0 w-[17.8125rem] justify-center h-[4.375rem] items-center mb-4">
          <div className="flex items-center justify-center text-2xl border-[0.3125rem] border-loonsRed bg-loonsBrown w-[17.3125rem] text-loonsBeige text-center h-[3.875rem] z-10 font-oswald font-[400] uppercase tracking-wider">
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
            disabled={loginMutation.isPending}
            autoComplete="current-username"
            className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Password"
            required
            disabled={loginMutation.isPending}
            autoComplete="current-password"
            className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
        </div>
        <div className="flex justify-center items-center">
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="border border-gray-400 rounded w-36 h-8 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
      <div className="flex justify-center text-center items-center text-loonsRed h-10">
        {error ? "There's been an error. Please try again" : ''}
      </div>
    </form>
  )
}
