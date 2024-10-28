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

  const WEIGHTS = {
    gameKnowledge: 0.2,
    goalScoring: 0.2,
    attack: 0.135, // adjusted slightly to make total 1
    midfield: 0.133,
    defense: 0.133,
    fitness: 0.1,
  }

  const calculatePlayerScore = player => {
    return (player.totalScore =
      player.gameKnowledgeScore * WEIGHTS.gameKnowledge +
      player.goalScoringScore * WEIGHTS.goalScoring +
      player.attackScore * WEIGHTS.attack +
      player.midfieldScore * WEIGHTS.midfield +
      player.defenseScore * WEIGHTS.defense +
      player.fitnessScore * WEIGHTS.fitness)
  }

  const calculateTeamStats = team => {
    const stats = team.players.reduce(
      (acc, player) => {
        const playerScore = calculatePlayerScore(player)

        return {
          totalScore: acc.totalScore + playerScore,
          totalGameKnowledgeScore:
            acc.totalGameKnowledgeScore + player.gameKnowledgeScore,
          totalGoalScoringScore:
            acc.totalGoalScoringScore + player.goalScoringScore,
          totalAttackScore: acc.totalAttackScore + player.attackScore,
          totalMidfieldScore: acc.totalMidfieldScore + player.midfieldScore,
          totalDefenseScore: acc.totalDefenseScore + player.defenseScore,
          totalFitnessScore: acc.totalFitnessScore + player.fitnessScore,
          genderCount: {
            ...acc.genderCount,
            [player.gender]: (acc.genderCount[player.gender] || 0) + 1,
          },
        }
      },
      {
        totalScore: 0,
        totalGameKnowledgeScore: 0,
        totalGoalScoringScore: 0,
        totalAttackScore: 0,
        totalMidfieldScore: 0,
        totalDefenseScore: 0,
        totalFitnessScore: 0,
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
        <p className="flex text-center md:justify-center mb-4 print:hidden">
          <span className="font-bold text-xl text-gray-800 ">
            {`Total Players Selected: ${selectedPlayerCount}`}
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
            <div className="flex justify-center mb-4 flex-wrap text-xl print:hidden text-center sm:text-start">
              Total Number of People Playing: {totalPlayers}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto px-4 print:grid-cols-2 print:gap-1 print:max-w-none print:px-0 print:py-0 print:m-0">
              {balancedTeams.map((team, index) => (
                <Droppable key={index} droppableId={index.toString()}>
                  {provided => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col p-2 rounded max-w-[600px] border-4 print:w-full print:p-1 print:text-sm print:border-1 ${
                        index % 2 === 0
                          ? 'border-loonsRed bg-red-200 print:bg-red-100'
                          : 'border-gray-500 bg-gray-200 print:bg-gray-100'
                      }`}
                    >
                      <h3 className="text-xl text-black font-semibold mb-2 print:text-lg print:mb-[2px] text-center">
                        {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                        {Math.floor(index / 2) + 1}
                      </h3>
                      <p className="text-sm print:hidden underline">
                        Team Totals
                      </p>
                      <p className="pb-1 print:hidden text-xxs xs:text-sm">
                        Team Score: {team.totalScore?.toFixed(1)}
                      </p>
                      <p className="text-xxs xs:text-xs print:hidden">
                        No of Players:{' '}
                        {team.genderCount.male +
                          team.genderCount.female +
                          team.genderCount.nonBinary}
                      </p>
                      <p className="text-xxs xs:text-xs print:hidden">
                        Gender Count: Male - {team.genderCount.male}, Female -{' '}
                        {team.genderCount.female}
                        {team.genderCount.nonBinary
                          ? `, Non Binary - ${team.genderCount.nonBinary}`
                          : ''}
                      </p>
                      <div className="flex flex-col xs:flex-row justify-between print:flex-col">
                        <div className="flex-col text-xxs xs:text-xs print:mr-0 print:mb-1 print:hidden">
                          <div
                            className={`flex justify-between border gap-1 ${
                              index % 2 === 0
                                ? 'border border-red-300 bg-red-100'
                                : 'border-gray-400 bg-gray-100'
                            } rounded py-[4px] px-3 m-1`}
                          >
                            <p>Game Knowledge:</p>
                            <p>{team.totalGameKnowledgeScore}</p>
                          </div>
                          <div
                            className={`flex justify-between border gap-1 ${
                              index % 2 === 0
                                ? 'border border-red-300 bg-red-100'
                                : 'border-gray-400 bg-gray-100'
                            } rounded py-[4px] px-3 m-1`}
                          >
                            <p>Goal Scoring:</p>
                            <p>{team.totalGoalScoringScore}</p>
                          </div>
                          <div
                            className={`flex justify-between border gap-1 ${
                              index % 2 === 0
                                ? 'border border-red-300 bg-red-100'
                                : 'border-gray-400 bg-gray-100'
                            } rounded py-[4px] px-3 m-1`}
                          >
                            <p>Attack:</p>
                            <p>{team.totalAttackScore}</p>
                          </div>
                        </div>
                        <div className="flex-col print:hidden text-xxs xs:text-xs">
                          <div
                            className={`flex justify-between border gap-1 ${
                              index % 2 === 0
                                ? 'border border-red-300 bg-red-100'
                                : 'border-gray-400 bg-gray-100'
                            } rounded py-[4px] px-3 m-1`}
                          >
                            <p>Midfield:</p>
                            <p>{team.totalMidfieldScore}</p>
                          </div>
                          <div
                            className={`flex justify-between border gap-1 ${
                              index % 2 === 0
                                ? 'border border-red-300 bg-red-100'
                                : 'border-gray-400 bg-gray-100'
                            } rounded py-[4px] px-3 m-1`}
                          >
                            <p>Defense:</p>
                            <p>{team.totalDefenseScore}</p>
                          </div>
                          <div
                            className={`flex border justify-between ${
                              index % 2 === 0
                                ? 'border border-red-300 bg-red-100'
                                : 'border-gray-400 bg-gray-100'
                            } rounded py-[4px] px-3 m-1`}
                          >
                            <p>Mobility/ Stamina:</p>
                            <p>{team.fitnessScore}</p>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-semibold mt-2 print:hidden">
                        {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                        {Math.floor(index / 2) + 1} Players:
                      </h4>
                      <ul className="list-disc pl-5 print:pl-4 print:mt-1 print:list-none">
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
                                  className="border-[2.5px] border-transparent hover:border-indigo-300 max-w-[190px] rounded px-1 print:border-0 print:max-w-none print:text-xl"
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
