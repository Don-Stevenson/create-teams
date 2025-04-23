import React, { useRef } from 'react'
import PlayerCard from './PlayerCard'
import LetterIndex from './LetterIndex'

const PlayerList = ({ players, onEditPlayer, onDeletePlayer }) => {
  const shownInitials = useRef(new Set())

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-2 p-2">
      {players.map(player => (
        <div key={player._id}>
          <LetterIndex
            player={player}
            shownInitials={shownInitials.current}
            setShownInitials={initial => shownInitials.current.add(initial)}
          />
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
