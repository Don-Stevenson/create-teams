// components/LoginForm.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import LoonsBadge from '../assets/img/TWSC.webp'
import Image from 'next/image'
import config_url from '../../../config'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [error, setError] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const response = await fetch(`${config_url}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      if (data.success) {
        setError(false)
        router.push('/')
      } else {
        setError(true)
      }
    } catch (error) {
      setError(true)
      console.error('Login error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/TWSC_Badge.webp" type="image/webp" />
      </Head>
      <div className="flex flex-col items-center justify-center mt-20 gap-2">
        <Image width={100} height={125} src={LoonsBadge} />
        <div className="flex bg-loonsDarkBrown z-0 w-[248px] justify-center h-[168px] items-center rounded mb-4">
          <div className="flex items-center justify-center text-3xl font-bold border-[8px] border-loonsRed rounded bg-loonsBrown w-60 text-loonsBeige text-center h-40 z-10">
            Loons Team Balancer
          </div>
        </div>
        <div className="flex-col">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Username"
            required
            className="border border-gray-300 rounded w-40 h-8 mb-3 mr-3 text-center"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setError(false)}
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
      <div className="flex justify-center text-center items-center text-loonsRed h-10">
        {error ? "There's been an error. Please try again" : ''}
      </div>
    </form>
  )
}
