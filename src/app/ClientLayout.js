'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

export default function ClientLayout({ children }) {
  const [showNavBar, setShowNavBar] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show NavBar on protected routes (these routes use withAuth HOC which handles authentication)
    // Don't show on login page or root page (which handles its own auth and redirect)
    const protectedRoutes = ['/create-teams', '/players', '/about']
    setShowNavBar(protectedRoutes.includes(pathname))
  }, [pathname])

  return (
    <div className="flex flex-col min-h-screen">
      {showNavBar && <NavBar />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
