'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '../../../../../utils/FEapi'
import { Button } from '../Button/Button'

export default function Logout() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="primary"
      onClick={handleLogout}
      isLoading={isLoading}
      text="Logout"
      loadingMessage="Logging out"
      testId="logout-button"
      classes="font-semibold w-full"
    />
  )
}
