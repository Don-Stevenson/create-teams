//components/withAuth.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function withAuth(WrappedComponent) {
  return props => {
    const router = useRouter()

    useEffect(() => {
      const checkAuth = async () => {
        const res = await fetch(
          'https://loons-team-balancer.onrender.com/api/auth/check',
          {
            credentials: 'include',
          }
        )
        if (!res.ok) {
          router.replace('/login')
        }
      }
      checkAuth()
    }, [])

    return <WrappedComponent {...props} />
  }
}
