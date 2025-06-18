'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { checkAuth } from '../../utils/FEapi'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

export default function ClientLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const verifyAuth = async () => {
      // Don't check auth on login page
      if (pathname === '/login') {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const isAuth = await checkAuth()
        setIsAuthenticated(isAuth)
      } catch (error) {
        // Don't log 401 errors as they're expected when not authenticated
        if (error.response?.status !== 401) {
          console.error('Auth check failed:', error)
        }
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [pathname])

  // Don't show NavBar on login page or when not authenticated
  const showNavBar = isAuthenticated && pathname !== '/login'

  return (
    <div className="flex flex-col min-h-screen">
      {!isLoading && showNavBar && <NavBar />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
