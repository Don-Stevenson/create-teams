import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PulseLoader } from 'react-spinners'
import { useAuthCheck } from '../hooks/useApi'

export default function withAuth(WrappedComponent, options = {}) {
  const { requireAuth = true } = options

  return function AuthenticatedComponent(props) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingMessage, setLoadingMessage] = useState(
      'Loading Loons Team Balancer'
    ) // Always start with same message for SSR
    const [hasMounted, setHasMounted] = useState(false)

    // React Query auth check hook - but only call once we've mounted
    const {
      data: authResult,
      isLoading: queryLoading,
      error,
    } = useAuthCheck({
      enabled: hasMounted,
    })

    // Update loading message after component mounts (client-side only)
    useEffect(() => {
      setHasMounted(true)

      // Check if server was recently accessed
      const lastAccess = localStorage.getItem('lastServerAccess')
      const now = Date.now()
      const fiveMinutesAgo = now - 5 * 60 * 1000

      if (lastAccess && parseInt(lastAccess) >= fiveMinutesAgo) {
        setLoadingMessage('Loading') // Server probably warm
      }
    }, [])

    useEffect(() => {
      if (!hasMounted) return

      if (!queryLoading) {
        setIsLoading(false)

        if (authResult) {
          setIsAuthenticated(true)
          // Record successful server access
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastServerAccess', Date.now().toString())
          }
        } else if (requireAuth) {
          router.push('/login')
        }
      }
    }, [authResult, queryLoading, error, router, hasMounted, requireAuth])

    // Handle error case
    useEffect(() => {
      if (error && !queryLoading && requireAuth) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }, [error, queryLoading, router, requireAuth])

    if (isLoading || !hasMounted) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2 text-gray-700 text-xl py-4">
            {loadingMessage}
            <PulseLoader color="black" size={6} />
          </div>
        </div>
      )
    }

    if (requireAuth && !isAuthenticated) {
      return null
    }

    // Only pass loggedIn prop when requireAuth is false (for pages that need to know auth state but don't require it)
    const additionalProps = requireAuth ? {} : { loggedIn: isAuthenticated }
    return <WrappedComponent {...props} {...additionalProps} />
  }
}
