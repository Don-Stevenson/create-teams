import React from 'react'

const PlayerListToggleIsPlaying = ({ players, onTogglePlayingThisWeek }) => {
  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] gap-1 w-full p-2 m-2 print:hidden flex-shrink">
      {sortedPlayers.map(player => (
        <li
          key={player._id}
          className={`flex items-center justify-around max-w-[350px] p-[10px] border border-gray-300 rounded m-1 ${
            player.isPlayingThisWeek ? 'bg-gray-100' : 'bg-gray-200'
          }`}
        >
          <span
            className={
              player.isPlayingThisWeek ? 'text-black' : 'text-gray-500'
            }
          >
            {player.name}
          </span>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={player.isPlayingThisWeek}
              onChange={() => onTogglePlayingThisWeek(player._id)}
              className="mr-2 bg-gray-500"
            />
            <span
              className={`
              ${
                player.isPlayingThisWeek ? 'text-black' : 'text-gray-400'
              } text-sm
            `}
            >
              Playing
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export default PlayerListToggleIsPlaying
