'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '../../../hooks/useApi'
import { Button } from '../Button/Button'
import { Logo } from '../Logo/Logo'

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
        <Logo />
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
          <Button
            variant="secondary"
            text="Login"
            loadingMessage="Logging in"
            isLoading={loginMutation.isPending}
            testId="login-button"
          />
        </div>
      </div>
      <div className="flex justify-center text-center items-center text-loonsRed h-10">
        {error ? "There's been an error. Please try again" : ''}
      </div>
    </form>
  )
}
