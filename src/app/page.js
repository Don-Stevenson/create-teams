'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '../../utils/FEapi'
import { PulseLoader } from 'react-spinners'

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
      <p className="flex justify-center items-center gap-2 text-gray-700 text-xl">
        Checking authentication
        <PulseLoader color="black" size={6} />
      </p>
    </div>
  )
}
