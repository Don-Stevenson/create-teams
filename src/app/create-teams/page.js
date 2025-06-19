'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CreateTeams from '../components/CreateTeams'
import { checkAuth } from '../../../utils/FEapi'
import Layout from '../components/Layout'

export default function CreateTeamsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return <CreateTeams />
}
