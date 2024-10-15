// components/Logout.js

import { useRouter } from 'next/router'
import config_url from '../../../config'

export default function Logout() {
  const router = useRouter()

  const handleSubmit = async e => {
    e.preventDefault()
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
    <form className="flex flex-wrap print:hidden" onSubmit={handleSubmit}>
      <button
        className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-1 px-2 min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
        type="submit"
      >
        Logout
      </button>
    </form>
  )
}
