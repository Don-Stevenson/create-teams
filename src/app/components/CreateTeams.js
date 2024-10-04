import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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

  const calculatePlayerScore = player => {
    const fudge = score => Math.random() * 3 + score - 1.5
    return (
      fudge(player.attackScore) * 0.4 +
      fudge(player.defenseScore) * 0.4 +
      fudge(player.fitnessScore) * 0.2
    )
  }

  const calculateTeamStats = team => {
    const stats = team.players.reduce(
      (acc, player) => {
        const playerScore = calculatePlayerScore(player)
        return {
          totalScore: acc.totalScore + playerScore,
          totalAttackScore: acc.totalAttackScore + player.attackScore,
          totalDefenseScore: acc.totalDefenseScore + player.defenseScore,
          fitnessScore: acc.fitnessScore + player.fitnessScore,
          genderCount: {
            ...acc.genderCount,
            [player.gender]: (acc.genderCount[player.gender] || 0) + 1,
          },
        }
      },
      {
        totalScore: 0,
        totalAttackScore: 0,
        totalDefenseScore: 0,
        fitnessScore: 0,
        genderCount: { male: 0, female: 0, nonBinary: 0 },
      }
    )
    return { ...team, ...stats }
  }

  const onDragEnd = result => {
    const { source, destination } = result

    if (!destination) {
      return
    }

    const sourceTeamIndex = parseInt(source.droppableId)
    const destTeamIndex = parseInt(destination.droppableId)
    const newBalancedTeams = Array.from(balancedTeams)
    const [movedPlayer] = newBalancedTeams[sourceTeamIndex].players.splice(
      source.index,
      1
    )
    newBalancedTeams[destTeamIndex].players.splice(
      destination.index,
      0,
      movedPlayer
    )

    newBalancedTeams[sourceTeamIndex] = calculateTeamStats(
      newBalancedTeams[sourceTeamIndex]
    )
    newBalancedTeams[destTeamIndex] = calculateTeamStats(
      newBalancedTeams[destTeamIndex]
    )
    setBalancedTeams(newBalancedTeams)
  }

  return (
    <div className="flex flex-col bg-white rounded pt-6 pb-8 mb-4 print:pt-0 print:mb-0 print:px-0 print:pb-0">
      <div className="flex-col flex-wrap">
        <h2 className="text-2xl font-semibold mb-4 print:hidden">
          Player List
        </h2>
        <PlayerListToggleIsPlaying
          players={players}
          onTogglePlayingThisWeek={handleTogglePlayingThisWeek}
        />
      </div>
      <div className="flex flex-col mt-10 items-center">
        <div className="flex flex-col items-center mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 print:hidden"
            htmlFor="numTeams"
          >
            Number of Teams
          </label>
          <input
            className="shadow appearance-none border rounded w-15 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline print:hidden"
            id="numTeams"
            type="number"
            min="2"
            max="10"
            value={numTeams}
            onChange={e => setNumTeams(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between print:hidden">
          <button
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-2 border-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline print:hidden"
            onClick={handleBalanceTeams}
          >
            Create Balanced Teams
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        {balancedTeams && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex justify-center gap-5 m-2 flex-wrap print:m-1 print:gap-1">
              {balancedTeams.map((team, index) => (
                <Droppable key={index} droppableId={index.toString()}>
                  {provided => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col mb-6 p-4 rounded max-w-[600px] border-4 print:max-w-[400px] print:m-1 print:p-1 print:text-sm print:max-h-[900px] print:mb-0 ${
                        index % 2 === 0
                          ? 'border-loonsRed bg-red-200'
                          : 'border-gray-500 bg-gray-200'
                      }`}
                    >
                      <h3
                        className={`text-xl text-black font-semibold mb-2 print:text-sm`}
                      >
                        {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                        {Math.floor(index / 2) + 1}
                      </h3>
                      <p className="text-lg print:hidden">
                        Team Total Score: {team.totalScore.toFixed(2)}
                      </p>
                      <p className="text-sm print:hidden">
                        Total Attack: {team.totalAttackScore.toFixed(2)}
                      </p>
                      <p className="text-sm print:hidden">
                        Total Defense: {team.totalDefenseScore.toFixed(2)}
                      </p>
                      <p className="text-sm print:hidden">
                        Total Fitness: {team.fitnessScore.toFixed(2)}
                      </p>
                      <p>
                        Total No of Players:{' '}
                        {team.genderCount.male +
                          team.genderCount.female +
                          team.genderCount.nonBinary}
                      </p>
                      <p className="print:hidden text-wrap">
                        Gender Distribution: Male - {team.genderCount.male},
                        Female - {team.genderCount.female}, Non Binary -{' '}
                        {team.genderCount.nonBinary}
                      </p>
                      <h4 className="font-semibold mt-2 print:hidden">
                        {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                        {Math.floor(index / 2) + 1} Players:
                      </h4>
                      <ul className="list-disc pl-5 print:text-lg">
                        {team.players
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((player, playerIndex) => (
                            <Draggable
                              key={player._id}
                              draggableId={player._id}
                              index={playerIndex}
                            >
                              {provided => (
                                <li
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="hover:bg-blue-300 max-w-[190px] rounded"
                                >
                                  {player.name}
                                </li>
                              )}
                            </Draggable>
                          ))}
                      </ul>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}
