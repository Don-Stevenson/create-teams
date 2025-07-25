import React, { useRef, useState, useEffect } from 'react'
import { calculateTeamStats } from '../utils/teamStats'

// Custom hook for drag and drop functionality
const useDragAndDrop = (balancedTeams, setBalancedTeams) => {
  const [draggedPlayer, setDraggedPlayer] = useState(null)

  const handleDragStart = (e, teamIndex, playerIndex, playerId) => {
    // Store the dragged player info
    setDraggedPlayer({ teamIndex, playerIndex, playerId })

    // Add visual feedback
    e.target.classList.add('opacity-50')
    e.target.classList.add('border-indigo-500')

    // Set the drag data
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ teamIndex, playerIndex, playerId })
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = e => {
    e.target.classList.remove('opacity-50')
    e.target.classList.remove('border-indigo-500')

    setDraggedPlayer(null)
  }

  const handleDragOver = (e, teamIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    e.currentTarget.classList.add('border-indigo-400')
  }

  const handleDragLeave = e => {
    e.currentTarget.classList.remove('border-indigo-400')
  }

  const handleDrop = (e, destTeamIndex) => {
    e.preventDefault()

    e.currentTarget.classList.remove('border-indigo-400')

    const { teamIndex: sourceTeamIndex, playerIndex } = draggedPlayer

    if (sourceTeamIndex === destTeamIndex) return

    // Create a copy of teams to work with
    const newBalancedTeams = Array.from(balancedTeams)

    const movedPlayer = newBalancedTeams[sourceTeamIndex].players[playerIndex]

    newBalancedTeams[sourceTeamIndex].players.splice(playerIndex, 1)

    newBalancedTeams[destTeamIndex].players.push(movedPlayer)

    newBalancedTeams[sourceTeamIndex] = calculateTeamStats(
      newBalancedTeams[sourceTeamIndex]
    )
    newBalancedTeams[destTeamIndex] = calculateTeamStats(
      newBalancedTeams[destTeamIndex]
    )

    setBalancedTeams(newBalancedTeams)
  }

  return {
    draggedPlayer,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}

const TeamStats = ({ team, index }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2 print:hidden">
      <div className="flex flex-col gap-2 print:flex-col">
        <div
          className={`flex justify-between border gap-1 ${
            index % 2 === 0
              ? 'border-red-300 bg-red-100'
              : 'border-gray-400 bg-gray-100'
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Game Knowledge:</p>
          <p className="text-xxs">{team.totalGameKnowledgeScore}</p>
        </div>
        <div
          className={`flex justify-between border gap-1 ${
            index % 2 === 0
              ? 'border-red-300 bg-red-100'
              : 'border-gray-400 bg-gray-100'
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Goal Scoring:</p>
          <p className="text-xxs">{team.totalGoalScoringScore}</p>
        </div>
        <div
          className={`flex justify-between border gap-1 ${
            index % 2 === 0
              ? 'border-red-300 bg-red-100'
              : 'border-gray-400 bg-gray-100'
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Attack:</p>
          <p className="text-xxs">{team.totalAttackScore}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 print:flex-col">
        <div
          className={`flex justify-between border gap-1 ${
            index % 2 === 0
              ? 'border-red-300 bg-red-100'
              : 'border-gray-400 bg-gray-100'
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Midfield:</p>
          <p className="text-xxs">{team.totalMidfieldScore}</p>
        </div>
        <div
          className={`flex justify-between border gap-1 ${
            index % 2 === 0
              ? 'border-red-300 bg-red-100'
              : 'border-gray-400 bg-gray-100'
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Defense:</p>
          <p className="text-xxs">{team.totalDefenseScore}</p>
        </div>
        <div
          className={`flex border justify-between ${
            index % 2 === 0
              ? 'border-red-300 bg-red-100'
              : 'border-gray-400 bg-gray-100'
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Mobility/Stamina:</p>
          <p className="text-xxs">{team.fitnessScore}</p>
        </div>
      </div>
    </div>
  )
}

const PlayerList = ({ team, teamIndex, handleDragStart, handleDragEnd }) => {
  return (
    <ul className="list-disc pl-5 print:pl-4 print:mt-1 print:list-none relative">
      {team.players
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((player, playerIndex) => (
          <li
            key={`${player.name}-${playerIndex}`}
            draggable="true"
            onDragStart={e =>
              handleDragStart(e, teamIndex, playerIndex, player._id)
            }
            onDragEnd={handleDragEnd}
            className="list-disc ml-4 border-[2.5px] border-transparent hover:border-indigo-300 max-w-[190px] rounded px-1 print:border-0 print:max-w-none print:text-xl cursor-grab active:cursor-grabbing"
          >
            {player.name}
          </li>
        ))}
    </ul>
  )
}

const TeamHeader = ({ team, index, getTeamName }) => {
  return (
    <>
      <h3 className="text-xl text-black font-semibold print:text-lg print:mb-[2px] text-center">
        {getTeamName(index)}
      </h3>
      <p className="text-sm print:hidden underline">Team Totals</p>
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
    </>
  )
}

const Teams = ({
  balancedTeams,
  setBalancedTeams,
  totalPlayers,
  selectedGameInfo,
}) => {
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop(balancedTeams, setBalancedTeams)

  const getTeamName = index => {
    const isRedTeam = index % 2 === 0
    const teamNumber = Math.floor(index / 2) + 1
    const color = isRedTeam ? 'Red' : 'Black'

    if (balancedTeams.length > 2) {
      return `${color} Team ${teamNumber}`
    }
    return `${color} Team`
  }

  const hasLargeTeams = balancedTeams.some(team => team.players.length > 12)

  const teamsPerPage = hasLargeTeams ? 2 : 4

  const totalPages = Math.ceil(balancedTeams.length / teamsPerPage)

  const teamGroups = []
  for (let i = 0; i < totalPages; i++) {
    const startIdx = i * teamsPerPage
    const endIdx = Math.min(startIdx + teamsPerPage, balancedTeams.length)
    teamGroups.push(balancedTeams.slice(startIdx, endIdx))
  }

  return (
    <>
      {/* Game name for print - only visible when printing */}
      {selectedGameInfo && (
        <div className="print:block text-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {selectedGameInfo.title}
          </h2>
          <p className="text-lg text-gray-700 mt-1">
            {!selectedGameInfo.meetdate
              ? new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date(selectedGameInfo.meetdate).toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                ) === 'Wednesday, December 31, 1969'
              ? new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date(selectedGameInfo.meetdate).toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
          </p>
        </div>
      )}
      <div className="flex justify-center mb-4 flex-wrap text-xl print:hidden text-center sm:text-start">
        Total Number of People Playing: {totalPlayers}
      </div>
      {teamGroups.map((group, pageIndex) => (
        <div
          key={pageIndex}
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto px-4 print:grid-cols-2 print:gap-1 print:max-w-none print:px-0 print:py-0 print:m-0 ${
            pageIndex > 0 ? 'print:break-before-page' : ''
          }`}
        >
          {group.map((team, index) => {
            const actualIndex = pageIndex * teamsPerPage + index

            return (
              <div
                key={actualIndex}
                className={`flex flex-col p-2 rounded max-w-[600px] border-4 print:w-full print:p-1 print:text-sm print:border-1 ${
                  actualIndex % 2 === 0
                    ? 'border-loonsRed bg-red-200 print:bg-red-100'
                    : 'border-gray-500 bg-gray-200 print:bg-gray-100'
                }`}
                onDragOver={e => handleDragOver(e, actualIndex)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, actualIndex)}
              >
                <TeamHeader
                  team={team}
                  index={actualIndex}
                  getTeamName={getTeamName}
                />
                <TeamStats team={team} index={actualIndex} />
                <h4 className="font-semibold mt-2 print:hidden">
                  {getTeamName(actualIndex)} Players:
                </h4>
                <PlayerList
                  team={team}
                  teamIndex={actualIndex}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                />
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}

export default Teams
