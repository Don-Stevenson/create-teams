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
  const [errorDetails, setErrorDetails] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    console.log('🔍 Login attempt starting...')
    console.log('Username:', username)
    console.log('Password length:', password.length)

    try {
      console.log('🌐 Calling login API...')
      const data = await login(username, password)
      console.log('✅ Login API response:', data)

      if (data.success) {
        console.log('🎉 Login successful!')
        setError(false)
        router.push('/create-teams')
        router.refresh() // Force a refresh of the page to update authentication state
      } else {
        console.log('❌ Login failed - data.success is false')
        setError(true)
        setErrorDetails('Login failed - invalid response')
      }
    } catch (error) {
      console.error('💥 Login error caught:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setError(true)
      setErrorDetails(
        `Error: ${error.message} (Status: ${
          error.response?.status || 'unknown'
        })`
      )
    } finally {
      setIsLoading(false)
      console.log('🏁 Login attempt finished')
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
            onFocus={() => {
              setError(false)
              setErrorDetails('')
            }}
            placeholder="Username"
            required
            disabled={isLoading}
            className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => {
              setError(false)
              setErrorDetails('')
            }}
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
      <div className="flex flex-col justify-center text-center items-center text-loonsRed min-h-10">
        {error ? (
          <>
            <div>"There's been an error. Please try again"</div>
            {errorDetails && (
              <div className="text-xs mt-1 text-gray-600">
                Debug: {errorDetails}
              </div>
            )}
          </>
        ) : (
          ''
        )}
      </div>
    </form>
  )
}
