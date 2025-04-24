import React from 'react'

const ScoreItem = ({ label, value }) => (
  <div className="flex justify-between items-baseline bg-gray-100 rounded gap-1">
    <span className="text-[0.75rem] text-gray-400">{label}:</span>
    <span className="text-[0.75rem] text-black font-medium">{value}</span>
  </div>
)

const ActionButton = ({ onClick, variant = 'default', children, testId }) => {
  const baseStyles =
    'flex items-center justify-center text-[0.62rem] font-medium p-[0.15rem] rounded h-[2.5rem] w-[2.50rem]'

  let variantStyles = 'border border-gray-300 text-black' // default style

  if (variant === 'delete') {
    variantStyles =
      'bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'
  } else if (variant === 'edit') {
    variantStyles =
      'bg-white hover:bg-gray-200 text-black border border-gray-300'
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}`}
      data-testid={testId}
    >
      {children}
    </button>
  )
}

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
    <div className="flex justify-between items-center p-3 max-w-[300px] min-w-[8rem] max-h-[6rem] border-2 border-gray-200 rounded hover:border-[#c1d2f1] gap-2">
      <div className="w-2/3 mx-1">
        <div className="text-[0.9rem] mb-1">{player.name}</div>
        <div className="flex justify-between min-w-[147px]">
          {scores.slice(0, 3).map((score, index) => (
            <ScoreItem key={index} label={score.label} value={score.value} />
          ))}
        </div>
        <div className="flex justify-between">
          {scores.slice(3).map((score, index) => (
            <ScoreItem
              key={index + 3}
              label={score.label}
              value={score.value}
            />
          ))}
        </div>
      </div>
      <div className="w-1/3 flex gap-2 items-center justify-center pt-3.5">
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
