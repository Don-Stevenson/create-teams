import React from 'react'
import PlayerCard from './PlayerCard'

const PlayerList = ({ players, onEditPlayer, onDeletePlayer }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-2 p-2">
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
