import { useState } from 'react'
import { useRouter } from 'next/router'
import config_url from '../../../config'

export default function Logout() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch(`${config_url}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Logout failed')
      }

      if (response.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <button
        className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
        onClick={() => setShowModal(true)}
      >
        Logout
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg sm:w-[350px] w-[280px]">
            <h2 className="text-sm font-bold mb-4 text-gray-800 sm:text-lg">
              Are you sure you want to logout?
            </h2>
            <div className="flex sm:justify-end justify-between space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 text-xs sm:text-sm rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-loonsRed text-loonsBeige text-xs sm:text-sm rounded hover:bg-red-900"
                onClick={() => {
                  setShowModal(false)
                  handleLogout()
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
