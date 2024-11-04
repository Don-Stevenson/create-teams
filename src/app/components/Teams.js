import React from 'react'
import { calculateTeamStats } from '../utils/teamStats'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

const Teams = ({ balancedTeams, setBalancedTeams, totalPlayers }) => {
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
    <>
      <div className="flex justify-center mb-4 flex-wrap text-xl print:hidden text-center sm:text-start">
        Total Number of People Playing: {totalPlayers}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
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
                  <h3 className="text-xl text-black font-semibold print:text-lg print:mb-[2px] text-center">
                    {index % 2 === 0 ? 'Red' : 'Black'} Team{' '}
                    {Math.floor(index / 2) + 1}
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
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col gap-2 print:flex-col">
                      <div
                        className={`flex justify-between border gap-1 ${
                          index % 2 === 0
                            ? 'border-red-300 bg-red-100'
                            : 'border-gray-400 bg-gray-100'
                        } rounded py-1 px-3`}
                      >
                        <p className="text-xxs">Game Knowledge:</p>
                        <p className="text-xxs">
                          {team.totalGameKnowledgeScore}
                        </p>
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
    </>
  )
}

export default Teams
