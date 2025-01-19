import React from 'react'

const ScoreItem = ({ label, value }) => (
  <div className="flex items-center bg-gray-100 rounded px-0.5 sm:px-1 py-0.5">
    <span className="text-xxs sm:text-xs text-gray-400">{label}:</span>
    <span className="text-xxs sm:text-xs ml-0.5">{value}</span>
  </div>
)

const ActionButton = ({ onClick, variant = 'default', children, testId }) => {
  const baseStyles =
    'flex items-center justify-center text-xxs font-bold py-1 px-1 rounded h-[30px] sm:h-[40px] w-[40px] sm:w-[50px]'
  const variantStyles =
    variant === 'delete'
      ? 'bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'
      : 'border border-gray-300 text-black'

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
    <div className="flex justify-between items-center mb-1 sm:mb-2 p-1.5 sm:p-2 max-w-[35rem] min-w-[7rem] lg:h-[8rem] border border-gray-300 rounded hover:bg-gray-200">
      <div className="flex-1">
        <div className="text-sm mb-2">{player.name}</div>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {scores.slice(0, 3).map((score, index) => (
            <ScoreItem key={index} label={score.label} value={score.value} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
          {scores.slice(3).map((score, index) => (
            <ScoreItem
              key={index + 3}
              label={score.label}
              value={score.value}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-1.5 sm:gap-3 ml-4">
        <ActionButton
          onClick={() => onEditPlayer(player._id)}
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
