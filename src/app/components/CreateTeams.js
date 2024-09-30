import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'

export default function CreateTeams() {
  const [numTeams, setNumTeams] = useState(2)
  const [balancedTeams, setBalancedTeams] = useState(null)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/players')
        setPlayers(
          res.data.map(player => ({
            ...player,
            isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
          }))
        )
      } catch (error) {
        console.error('Failed to fetch players:', error)
        setError('Failed to fetch players')
      }
    }
    fetchPlayers()
  }, [])

  const handleTogglePlayingThisWeek = async playerId => {
    try {
      const playerToUpdate = players.find(p => p._id === playerId)
      const updatedPlayer = {
        ...playerToUpdate,
        isPlayingThisWeek: !playerToUpdate.isPlayingThisWeek,
      }

      const res = await api.put(`/players/${playerId}/playerInfo`, {
        ...updatedPlayer,
        isPlayingThisWeek: updatedPlayer.isPlayingThisWeek.toString(),
      })

      setPlayers(
        players.map(player =>
          player._id === playerId
            ? { ...player, isPlayingThisWeek: !player.isPlayingThisWeek }
            : player
        )
      )
    } catch (error) {
      console.error('Failed to update player:', error)
    }
  }

  const handleBalanceTeams = async () => {
    setError(null)
    try {
      const res = await api.post('/balance-teams', { numTeams })
      setBalancedTeams(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="flex-col bg-white rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex-col flex-wrap">
        <h2 className="text-2xl font-semibold mb-4">Player List</h2>
        <PlayerListToggleIsPlaying
          players={players}
          onTogglePlayingThisWeek={handleTogglePlayingThisWeek}
        />
      </div>
      <div className="flex-col mt-10">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="numTeams"
          >
            Number of Teams
          </label>
          <input
            className="shadow appearance-none border rounded w-15 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            Create Balanced Teams
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        {balancedTeams && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Created Teams</h2>
            <div className="flex gap-5 m-2 flex-wrap">
              {balancedTeams.map((team, index) => (
                <div
                  key={index}
                  className={`flex flex-col mb-6 p-4 rounded max-w-[600px] border-4 ${
                    index % 2 === 0
                      ? 'border-red-500 bg-red-200'
                      : 'border-gray-500 bg-gray-200'
                  }`}
                >
                  <h3 className={`text-xl text-black font-semibold mb-2`}>
                    {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                    {Math.floor(index / 2) + 1}
                  </h3>
                  <p>Total Attack: {team.totalAttackScore.toFixed(2)}</p>
                  <p>Total Defense: {team.totalDefenseScore.toFixed(2)}</p>
                  <p>Team Total Score: {team.totalScore.toFixed(2)}</p>
                  <p>
                    Total No of Players:{' '}
                    {team.genderCount.male +
                      team.genderCount.female +
                      team.genderCount.nonBinary}
                  </p>
                  <p>
                    Gender Distribution: Male - {team.genderCount.male}, Female
                    - {team.genderCount.female}, Non Binary -
                    {team.genderCount.nonBinary}
                  </p>
                  <h4 className="font-semibold mt-2">
                    {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                    {Math.floor(index / 2) + 1} Players:
                  </h4>
                  <ul className="list-disc pl-5">
                    {team.players.map(player => (
                      <li key={player._id}>{player.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
