import { useState } from 'react'
import api from '../../../utils/api'

export default function AddPlayer({ onAddPlayer, setShowAddPlayer }) {
  const [playerData, setPlayerData] = useState({
    name: '',
    gameKnowledgeScore: '',
    goalScoringScore: '',
    attackScore: '',
    defenseScore: '',
    midfieldScore: '',
    fitnessScore: '',
    gender: '',
    isPlayingThisWeek: true,
  })
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      await onAddPlayer(playerData)
      setPlayerData({
        name: '',
        gameKnowledgeScore: '',
        goalScoringScore: '',
        attackScore: '',
        midfieldScore: '',
        defenseScore: '',
        fitnessScore: '',
        gender: '',
        isPlayingThisWeek: true,
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Error. Please double check your input values'
      )
    }
  }

  const handleChange = e => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-[400px]"
      data-testid="add-player-form"
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Name
        </label>
        <input
          className="shadow appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          name="name"
          placeholder="name"
          value={playerData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="gameKnowledgeScore"
        >
          Game Knowledge Score
        </label>
        <input
          className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="gameKnowledgeScore"
          type="number"
          placeholder="1-10"
          name="gameKnowledgeScore"
          value={playerData.gameKnowledgeScore}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="goalScoringScore"
        >
          Goal Scoring Score
        </label>
        <input
          className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="goalScoringScore"
          type="number"
          placeholder="1-10"
          name="goalScoringScore"
          value={playerData.goalScoringScore}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="attackScore"
        >
          Attack Score
        </label>
        <input
          className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="attackScore"
          type="number"
          placeholder="1-10"
          name="attackScore"
          value={playerData.attackScore}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="midfieldScore"
        >
          Midfield Score
        </label>
        <input
          className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="midfieldScore"
          type="number"
          placeholder="1-10"
          name="midfieldScore"
          value={playerData.midfieldScore}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="defenseScore"
        >
          Defense Score
        </label>
        <input
          className="shadow appearance-none border rounded py-2 px-3 w-[100px] text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="defenseScore"
          type="number"
          placeholder="1-10"
          name="defenseScore"
          value={playerData.defenseScore}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="fitnessScore"
        >
          Mobility/Stamina
        </label>
        <input
          className="shadow appearance-none border rounded py-2 px-3 w-[100px] text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="fitnessScore"
          type="number"
          placeholder="1-10"
          name="fitnessScore"
          value={playerData.fitnessScore}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="gender"
        >
          Gender
        </label>
        <select
          className="shadow appearance-none border rounded w-[130px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="gender"
          name="gender"
          value={playerData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonBinary">Non Binary</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <div
          className="bg-white text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline border border-gray-700"
          type="submit"
          onClick={() => setShowAddPlayer(false)}
        >
          cancel
        </div>
        <button
          className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Add Player
        </button>
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
    </form>
  )
}
