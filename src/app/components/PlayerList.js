import React, { useEffect } from 'react'

const PlayerList = ({
  players,
  onEditPlayer,
  onDeletePlayer,
  fetchPlayers,
}) => {
  useEffect(() => {
    fetchPlayers()
  }, [])
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] gap-2 w-full p-2">
      {players.map(player => (
        <div key={player._id}>
          <div className="flex justify-between mb-2 p-2 w-80 h-[75px] border border-gray-300 rounded hover:bg-gray-200 ">
            <div className="flex gap-2 p-2 items-center">
              <div>{player.name} </div>
              <div className="text-gray-400 text-xs">
                A:{player.attackScore} D:{player.defenseScore} F:
                {player.fitnessScore}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => onEditPlayer(player._id)}
                className="border border-gray-300 text-black text-sm font-bold py-1 px-2 rounded h-[45px] w-[60px]"
                data-testid="edit-player"
              >
                Edit
              </button>
              <button
                onClick={() => onDeletePlayer(player._id)}
                data-testid="delete-player"
                className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 text-sm font-bold py-1 px-2 h-[45px] rounded w-[60px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlayerList
