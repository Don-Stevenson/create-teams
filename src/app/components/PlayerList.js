// components/PlayerList.js
export default function PlayerList({ players }) {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <ul className="divide-y divide-gray-200">
        {players.map(player => (
          <li key={player._id} className="py-4">
            <div className="flex justify-between">
              <span className="font-semibold">{player.name}</span>
              <span className="text-gray-500">{player.gender}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Attack: {player.attackScore} | Defense: {player.defenseScore} |
              Fitness: {player.fitnessScore}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
