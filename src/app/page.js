'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '../../utils/FEapi'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (isAuthenticated) {
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
      <div className="text-2xl">
        Checking authentication
        <span className="ml-1">
          <span
            className="dot-flash text-2xl"
            style={{
              animationDelay: '0s',
            }}
          >
            .
          </span>
          <span
            className="dot-flash text-2xl"
            style={{
              animationDelay: '0.3s',
            }}
          >
            .
          </span>
          <span
            className="dot-flash text-2xl"
            style={{
              animationDelay: '0.6s',
            }}
          >
            .
          </span>
        </span>
      </div>
    </div>
  )
}
