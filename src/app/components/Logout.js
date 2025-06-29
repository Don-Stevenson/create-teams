'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '../../../utils/FEapi'
import { PulseLoader } from 'react-spinners'

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
    <div
      className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900  font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center hover:cursor-pointer"
      onClick={handleLogout}
    >
      <button
        disabled={isLoading}
        className="text-loonsBeige hover:text-white transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex justify-center items-center gap-2 py-4">
            Logging out
            <PulseLoader color="white" size={6} />
          </div>
        ) : (
          'Logout'
        )}
      </button>
    </div>
  )
}
