// components/Logout.js
import { useRouter } from 'next/router'

export default function Logout() {
  const router = useRouter()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5050/api/logout', {
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
    <form onSubmit={handleSubmit}>
      <button
        className="bg-red-600 hover:bg-red-700 text-white border border-red-400 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center md:h-[35px] flex justify-center "
        type="submit"
      >
        Logout
      </button>
    </form>
  )
}
