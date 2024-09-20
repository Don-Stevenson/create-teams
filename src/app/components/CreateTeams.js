// components/BalanceTeams.js
import { useState } from 'react'
import api from '../../../utils/api'

export default function CreateTeams() {
  const [numTeams, setNumTeams] = useState(2)
  const [balancedTeams, setBalancedTeams] = useState(null)
  const [error, setError] = useState(null)

  const handleBalanceTeams = async () => {
    setError(null)
    try {
      const res = await api.post('/create-teams', { numTeams })
      setBalancedTeams(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="numTeams"
        >
          Number of Teams
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="numTeams"
          type="number"
          min="2"
          max="10"
          value={numTeams}
          onChange={e => setNumTeams(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleBalanceTeams}
        >
          Balance Teams
        </button>
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
      {balancedTeams && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Balanced Teams</h2>
          {balancedTeams.map((team, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-gray-200 rounded"
            >
              <h3 className="text-xl font-semibold mb-2">Team {index + 1}</h3>
              <p>Total Attack: {team.totalAttack}</p>
              <p>Total Defense: {team.totalDefense}</p>
              <p>Total Fitness: {team.totalFitness}</p>
              <p>
                Gender Distribution: Male - {team.genderCount.male}, Female -{' '}
                {team.genderCount.female}, Other - {team.genderCount.other}
              </p>
              <h4 className="font-semibold mt-2">Players:</h4>
              <ul className="list-disc pl-5">
                {team.players.map(player => (
                  <li key={player._id}>
                    {player.name} (A: {player.attackScore}, D:{' '}
                    {player.defenseScore}, F: {player.fitnessScore})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
