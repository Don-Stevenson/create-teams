import React from 'react'
const PlayerCard = ({ player, onEditPlayer, onDeletePlayer }) => (
  <div className="flex justify-between mb-1 sm:mb-2 p-1.5 sm:p-2 max-w-[35rem] h-[auto] border border-gray-300 rounded hover:bg-gray-200">
    <div className="flex gap-1 p-1 sm:gap-2 sm:p-1 justify-between max-w-[18rem]">
      <div className="grid grid-rows-2 gap-1 max-w-[12rem]">
        <div className="text-sm">{player.name}</div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
            <span className="text-xxs sm:text-xs text-gray-400">K:</span>
            <span className="text-xxs sm:text-xs ml-0.5">
              {player.gameKnowledgeScore}
            </span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
            <span className="text-xxs sm:text-xs text-gray-400">Sc:</span>
            <span className="text-xxs sm:text-xs ml-0.5">
              {player.goalScoringScore}
            </span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
            <span className="text-xxs sm:text-xs text-gray-400">A:</span>
            <span className="text-xxs sm:text-xs ml-0.5">
              {player.attackScore}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
            <span className="text-xxs sm:text-xs text-gray-400">Md:</span>
            <span className="text-xxs sm:text-xs ml-0.5">
              {player.midfieldScore}
            </span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
            <span className="text-xxs sm:text-xs text-gray-400">D:</span>
            <span className="text-xxs sm:text-xs ml-0.5">
              {player.defenseScore}
            </span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
            <span className="text-xxs sm:text-xs text-gray-400">M/S:</span>
            <span className="text-xxs sm:text-xs ml-0.5">
              {player.fitnessScore}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="flex gap-1.5 sm:gap-3 items-center">
      <button
        onClick={() => onEditPlayer(player._id)}
        className="flex items-center justify-center border border-gray-300 text-black text-xxs font-bold py-1 px-1 rounded h-[30px] sm:h-[40px] w-[40px] sm:w-[50px]"
        data-testid="edit-player"
      >
        Edit
      </button>
      <button
        onClick={() => onDeletePlayer(player._id)}
        data-testid="delete-player"
        className="flex items-center justify-center bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 text-xxs font-bold py-1 px-0 h-[30px] sm:h-[40px] rounded w-[40px] sm:w-[50px]"
      >
        Delete
      </button>
    </div>
  </div>
)

export default PlayerCard
