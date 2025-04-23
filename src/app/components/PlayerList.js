import React from 'react'
import PlayerCard from './PlayerCard'

const PlayerList = ({ players, onEditPlayer, onDeletePlayer }) => {
  const playersByInitial = players.reduce((acc, player) => {
    const initial = player.name.charAt(0).toUpperCase()
    if (!acc[initial]) {
      acc[initial] = []
    }
    acc[initial].push(player)
    return acc
  }, {})

  const sortedInitials = Object.keys(playersByInitial).sort()

  return (
    <div className="flex flex-col gap-8">
      {sortedInitials.map(initial => (
        <div key={initial} className="flex flex-col gap-4">
          <div className="text-2xl font-bold text-red-700 px-2">{initial}</div>

          <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-2 px-2">
            {playersByInitial[initial].map(player => (
              <PlayerCard
                key={player._id}
                player={player}
                onEditPlayer={onEditPlayer}
                onDeletePlayer={onDeletePlayer}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlayerList
