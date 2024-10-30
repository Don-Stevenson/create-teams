import React from 'react'
import PlayerCard from './PlayerCard'

const PlayerList = ({ players, onEditPlayer, onDeletePlayer }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] gap-2 w-full p-2">
      {players.map(player => (
        <div key={player._id}>
          <PlayerCard
            player={player}
            onEditPlayer={onEditPlayer}
            onDeletePlayer={onDeletePlayer}
          />
        </div>
      ))}
    </div>
  )
}

export default PlayerList
