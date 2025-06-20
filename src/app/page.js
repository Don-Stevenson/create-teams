'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '../../utils/FEapi'
import { PulseLoader } from 'react-spinners'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return 'Loading Create Teams' // Default for SSR
    }

    // Check if server was recently accessed
    const lastAccess = localStorage.getItem('lastServerAccess')
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    if (!lastAccess || parseInt(lastAccess) < fiveMinutesAgo) {
      return 'Loading Create Teams' // Likely cold start
    }
    return 'Checking authentication' // Server probably warm
  })
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (isAuthenticated) {
          // Record successful server access
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastServerAccess', Date.now().toString())
          }
          router.push('/create-teams')
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="flex justify-center items-center gap-2 text-gray-700 text-xl">
        {loadingMessage}
        <PulseLoader color="black" size={6} />
      </p>
    </div>
  )
}
