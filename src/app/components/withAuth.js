import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import config_url from '../../../config'

export default function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch(`${config_url}/api/auth/check`, {
            credentials: 'include',
          })
          if (res.ok) {
            setIsAuthenticated(true)
          } else {
            router.replace('/login')
          }
        } catch (error) {
          console.error('Auth check failed:', error)

          router.replace('/login')
        }
      }
      checkAuth()
    }, [router])

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
