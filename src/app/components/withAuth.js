import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '../../../utils/FEapi'
import { PulseLoader } from 'react-spinners'

export default function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingMessage, setLoadingMessage] = useState(() => {
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
      return 'Loading' // Server probably warm
    })

    useEffect(() => {
      const verifyAuth = async () => {
        try {
          const authResult = await checkAuth()
          if (authResult) {
            setIsAuthenticated(true)
            // Record successful server access
            if (typeof window !== 'undefined') {
              localStorage.setItem('lastServerAccess', Date.now().toString())
            }
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
          <div className="flex items-center gap-2 text-gray-700 text-xl py-4">
            {loadingMessage}
            <PulseLoader color="black" size={6} />
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
