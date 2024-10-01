//components/withAuth.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function withAuth(WrappedComponent) {
  return props => {
    const router = useRouter()

    useEffect(() => {
      const checkAuth = async () => {
        const res = await fetch('http://localhost:5050/api/auth/check', {
          credentials: 'include',
        })
        if (!res.ok) {
          router.replace('/login')
        }
      }
      checkAuth()
    }, [])

    return <WrappedComponent {...props} />
  }
}
