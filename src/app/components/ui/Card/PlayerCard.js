import React from 'react'
import { ActionButton } from '../Button/ActionButton'

const ScoreItem = ({ label, value }) => (
  <div className="flex justify-between items-baseline bg-gray-100 rounded gap-1">
    <span className="text-[0.75rem] text-gray-400">{label}:</span>
    <span className="text-[0.75rem] text-black font-medium">{value}</span>
  </div>
)

const PlayerCard = ({ player, onEditPlayer, onDeletePlayer }) => {
  const scores = [
    { label: 'K', value: player.gameKnowledgeScore },
    { label: 'Sc', value: player.goalScoringScore },
    { label: 'A', value: player.attackScore },
    { label: 'Md', value: player.midfieldScore },
    { label: 'D', value: player.defenseScore },
    { label: 'M/S', value: player.fitnessScore },
  ]

  return (
    <div className="flex justify-between items-center p-3 w-full max-w-[17.5rem] min-w-[16rem] max-h-[6rem] border-2 border-gray-200 rounded hover:border-[#c1d2f1] hover:bg-[#edf2f8] gap-2">
      <div className="flex-1 min-w-0 mx-1">
        <div className="text-[0.9rem] mb-1 truncate">{player.name}</div>
        <div className="flex justify-between gap-1">
          {scores.slice(0, 3).map((score, index) => (
            <ScoreItem key={index} label={score.label} value={score.value} />
          ))}
        </div>
        <div className="flex justify-between gap-1">
          {scores.slice(3).map((score, index) => (
            <ScoreItem
              key={index + 3}
              label={score.label}
              value={score.value}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-1 items-center justify-center pt-3.5 flex-shrink-0">
        <ActionButton
          onClick={() => onEditPlayer(player._id)}
          variant="edit"
          testId="edit-player"
        >
          Edit
        </ActionButton>
        <ActionButton
          onClick={() => onDeletePlayer(player._id)}
          variant="delete"
          testId="delete-player"
        >
          Delete
        </ActionButton>
      </div>
    </div>
  )
}

export default PlayerCard
