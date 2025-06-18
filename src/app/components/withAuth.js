import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '../../../utils/FEapi'

export default function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      const verifyAuth = async () => {
        try {
          const authResult = await checkAuth()
          if (authResult && authResult.success) {
            setIsAuthenticated(true)
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

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
