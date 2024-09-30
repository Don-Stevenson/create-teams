import React from 'react'

const PlayerListToggleIsPlaying = ({ players, onTogglePlayingThisWeek }) => {
  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] gap-1 w-full p-2">
      {sortedPlayers.map((player, index) => (
        <li
          key={player._id}
          onClick={() => onTogglePlayingThisWeek(player._id)}
          className={`flex items-center justify-between w-[350px] p-[10px] border border-gray-300 rounded m-1 ${
            player.isPlayingThisWeek ? 'bg-gray-100' : 'bg-gray-300'
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
            <span className="text-sm">Playing this week</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export default PlayerListToggleIsPlaying
