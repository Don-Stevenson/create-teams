import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function CreateTeams() {
  const [numTeams, setNumTeams] = useState(2)
  const [balancedTeams, setBalancedTeams] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(0)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/players')
        const fetchedPlayers = res.data.map(player => ({
          ...player,
          isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
        }))
        setPlayers(fetchedPlayers)
        setSelectAll(fetchedPlayers.every(player => player.isPlayingThisWeek))
        setSelectedPlayerCount(
          fetchedPlayers.filter(player => player.isPlayingThisWeek).length
        )
      } catch (error) {
        console.error('Failed to fetch players:', error)
        setError('Failed to fetch players')
      }
    }
    fetchPlayers()
  }, [])

  const handleTogglePlayingThisWeek = async playerId => {
    const playerToUpdate = players.find(player => player._id === playerId)
    const newPlayingState = !playerToUpdate.isPlayingThisWeek

    const updatedPlayers = players.map(player =>
      player._id === playerId
        ? { ...player, isPlayingThisWeek: newPlayingState }
        : player
    )

    setPlayers(updatedPlayers)
    setSelectedPlayerCount(
      updatedPlayers.filter(p => p.isPlayingThisWeek).length
    )
    setSelectAll(updatedPlayers.every(player => player.isPlayingThisWeek))

    try {
      await api.put(`/players/${playerId}`, {
        ...playerToUpdate,
        isPlayingThisWeek: newPlayingState.toString(),
      })
    } catch (error) {
      console.error('Failed to update player:', error)

      const revertedPlayers = players.map(player =>
        player._id === playerId
          ? { ...player, isPlayingThisWeek: !newPlayingState }
          : player
      )
      setPlayers(revertedPlayers)
      setSelectedPlayerCount(
        revertedPlayers.filter(p => p.isPlayingThisWeek).length
      )
      setSelectAll(revertedPlayers.every(player => player.isPlayingThisWeek))
      setError('Failed to update player status')
    }
  }

  const handleSelectAll = async () => {
    const newSelectAllState = !selectAll

    const updatedPlayers = players.map(player => ({
      ...player,
      isPlayingThisWeek: newSelectAllState,
    }))

    setPlayers(updatedPlayers)
    setSelectAll(newSelectAllState)
    setSelectedPlayerCount(newSelectAllState ? players.length : 0)

    try {
      await api.put('/players-bulk-update', {
        isPlayingThisWeek: newSelectAllState.toString(),
      })
    } catch (error) {
      console.error('Failed to update all players:', error)

      const revertedPlayers = players.map(player => ({
        ...player,
        isPlayingThisWeek: !newSelectAllState,
      }))
      setPlayers(revertedPlayers)
      setSelectAll(!newSelectAllState)
      setSelectedPlayerCount(!newSelectAllState ? players.length : 0)
      setError('Failed to update all players')
    }
  }
  const handleBalanceTeams = async () => {
    setError(null)
    try {
      const res = await api.post('/balance-teams', { numTeams })
      setTotalPlayers(res.data.totalPlayersPlaying)
      setBalancedTeams(res.data.teams)
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
    <div className="flex flex-col rounded pt-6 pb-8 mb-4 print:pt-0 print:mb-0 print:px-0 print:pb-0">
      <div className="flex-col flex-wrap">
        <h2 className="text-3xl font-semibold mb-4 print:hidden md:justify-center text-loonsDarkBrown">
          Player List
        </h2>
        <p className="flex text-center md:justify-center text-xl font-medium text-gray-800 mb-4 print:hidden">
          Total Players Selected:
          <span className="font-bold  text-gray-800 text-xl">
            {selectedPlayerCount}
          </span>
        </p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="flex md:justify-center mb-4 print:hidden">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-loonsRed"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <span className="ml-2 text-gray-700 text-sm">
              Toggle All Players Playing / Not Playing
            </span>
          </label>
        </div>
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
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-2 border-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline print:hidden mb-4"
            onClick={handleBalanceTeams}
          >
            Create Balanced Teams
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        {balancedTeams && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex justify-center mb-4 flex-wrap text-xlprint:m-1 print:gap-1">
              Total Number of People Playing: {totalPlayers}
            </div>
            <div className="flex justify-center gap-5 flex-wrap print:m-1 print:gap-1">
              {balancedTeams.map((team, index) => (
                <Droppable key={index} droppableId={index.toString()}>
                  {provided => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col p-4 rounded max-w-[600px] border-4 print:max-w-[400px] print:m-2 print:p-2 print:text-sm print:max-h-[900px] print:mb-0 ${
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
                        Team Total Score: {Math.round(team.totalScore)}
                      </p>
                      <p className="text-sm print:hidden">
                        Total Attack: {Math.round(team.totalAttackScore)}
                      </p>
                      <p className="text-sm print:hidden">
                        Total Defense: {Math.round(team.totalDefenseScore)}
                      </p>
                      <p className="text-sm print:hidden">
                        Total Fitness: {Math.round(team.fitnessScore)}
                      </p>
                      <p>
                        Total No of Players:{' '}
                        {team.genderCount.male +
                          team.genderCount.female +
                          team.genderCount.nonBinary}
                      </p>
                      <p className="print:hidden text-wrap">
                        Gender Distribution: Male - {team.genderCount.male},
                        Female - {team.genderCount.female}
                        {team.genderCount.nonBinary
                          ? `, Non Binary - ${team.genderCount.nonBinary} `
                          : ''}
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
                                  className="border-[2.5px] border-transparent hover:border-indigo-300 max-w-[190px] rounded px-1"
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
