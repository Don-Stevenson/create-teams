import React from 'react'

const PlayerListToggleIsPlaying = ({ players, onTogglePlayingThisWeek }) => {
  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))] gap-4 w-full p-2 print:hidden">
      {sortedPlayers.map(player => (
        <li
          key={player._id}
          className={`flex items-center gap-4 p-3 border border-gray-300 rounded ${
            player.isPlayingThisWeek ? 'bg-gray-100' : 'bg-gray-200'
          }`}
          onClick={() => onTogglePlayingThisWeek(player._id)}
        >
          <div className="flex-1 min-w-0">
            <span
              className={`block truncate ${
                player.isPlayingThisWeek ? 'text-black' : 'text-gray-400'
              } hover:`}
              title={player.name}
            >
              {player.name}
            </span>
          </div>
          <label className="flex items-center gap-2 flex-shrink-0">
            <input
              type="checkbox"
              checked={player.isPlayingThisWeek}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              readOnly
            />
            <span
              className={`text-xs whitespace-nowrap ${
                player.isPlayingThisWeek ? 'text-black' : 'text-gray-400'
              }`}
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
