// components/AddPlayerForm.js
import { useState } from 'react'
import api from '../../../utils/api'

export default function AddPlayerForm({ onAddPlayer }) {
  const [playerData, setPlayerData] = useState({
    name: '',
    attackScore: '',
    defenseScore: '',
    fitnessScore: '',
    gender: '',
  })
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/players', playerData)
      onAddPlayer(res.data)
      setPlayerData({
        name: '',
        attackScore: '',
        defenseScore: '',
        fitnessScore: '',
        gender: '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  const handleChange = e => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          name="name"
          value={playerData.name}
          onChange={handleChange}
          required
        />
      </div>
      {/* Similar input fields for attackScore, defenseScore, fitnessScore */}
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="gender"
        >
          Gender
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="gender"
          name="gender"
          value={playerData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Add Player
        </button>
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
    </form>
  )
}
