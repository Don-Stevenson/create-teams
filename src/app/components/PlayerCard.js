import React from 'react'
const PlayerCard = ({ player, onEditPlayer, onDeletePlayer }) => (
  <div className="flex justify-between mb-2 p-2 max-w-[25rem] h-[75px] border border-gray-300 rounded hover:bg-gray-200">
    <div className="flex gap-2 p-2 justify-between max-w-[14rem]">
      <div className="text-sm">{player.name}</div>
      <div className="grid grid-rows-2 gap-1 w-[12rem]">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
            <span className="text-xxs text-gray-400">K:</span>
            <span className="text-xxs ml-0.5">{player.gameKnowledgeScore}</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
            <span className="text-xxs text-gray-400">Sc:</span>
            <span className="text-xxs ml-0.5">{player.goalScoringScore}</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
            <span className="text-xxs text-gray-400">A:</span>
            <span className="text-xxs ml-0.5">{player.attackScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
            <span className="text-xxs text-gray-400">Md:</span>
            <span className="text-xxs ml-0.5">{player.midfieldScore}</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
            <span className="text-xxs text-gray-400">D:</span>
            <span className="text-xxs ml-0.5">{player.defenseScore}</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
            <span className="text-xxs text-gray-400">M/S:</span>
            <span className="text-xxs ml-0.5">{player.fitnessScore}</span>
          </div>
        </div>
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
)

export default PlayerCard
