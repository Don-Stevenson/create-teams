import { PulseLoader } from 'react-spinners'

export default function TeamGenerator({
  numTeams,
  isLoading,
  error,
  onNumTeamsChange,
  onBalanceTeams,
}) {
  return (
    <div className="flex flex-col mt-10 items-center">
      <div className="flex flex-col items-center mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 print:hidden"
          htmlFor="numTeams"
        >
          Number of Teams
        </label>
        <input
          className="shadow appearance-none border rounded w-15 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline print:hidden"
          id="numTeams"
          type="number"
          min="2"
          max="10"
          value={numTeams}
          onChange={e => onNumTeamsChange(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between print:hidden">
        <button
          className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-2 border-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline print:hidden mb-4"
          onClick={onBalanceTeams}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex justify-center items-center gap-2 text-loonsBeige">
              Creating teams
              <PulseLoader color="#C4B098" size={6} />
            </div>
          ) : (
            'Create Balanced Teams'
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
    </div>
  )
}
