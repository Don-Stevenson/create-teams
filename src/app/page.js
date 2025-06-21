'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '../../utils/FEapi'
import { PulseLoader } from 'react-spinners'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState(
    'Loading Loons Team Balancer'
  ) // Always start with same message for SSR
  const router = useRouter()

  // Update loading message after component mounts (client-side only)
  useEffect(() => {
    // Check if server was recently accessed
    const lastAccess = localStorage.getItem('lastServerAccess')
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    if (lastAccess && parseInt(lastAccess) >= fiveMinutesAgo) {
      setLoadingMessage('Checking authentication') // Server probably warm
    }
  }, [])

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
