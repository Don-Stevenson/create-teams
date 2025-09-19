import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import { lazy, Suspense } from 'react'

const LoadingPlayers = lazy(() => import('../Loading/LoadingPlayers'))

export default function PlayerListManager({
  players,
  selectedPlayerCount,
  selectAll,
  openPlayerList,
  showLoadingMessage,
  queryRsvpsForGame,
  bulkUpdateMutation,
  onTogglePlayingThisWeek,
  onSelectAll,
  onTogglePlayerList,
}) {
  return (
    <div className="print:hidden">
      <div className="flex-col flex-wrap">
        <h2 className="text-3xl font-semibold mb-4 print:hidden md:justify-center text-loonsDarkBrown">
          Player List
        </h2>
        <p className="flex text-center md:justify-center mb-4 print:hidden">
          <span className="font-bold text-xl text-gray-800 ">
            {`Total Players Selected: ${selectedPlayerCount}`}
          </span>
        </p>
        <div className="flex justify-center items-center mb-2">
          <button
            onClick={onTogglePlayerList}
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-red-900 mb-2 text-lg font-bold border-2  rounded-md px-2 py-1"
          >
            {openPlayerList ? 'Hide Player List' : 'Show Player List'}
          </button>
        </div>
        {openPlayerList && (
          <>
            <div className="flex md:justify-center mb-4 print:hidden">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-loonsRed"
                  checked={selectAll}
                  onChange={onSelectAll}
                  disabled={bulkUpdateMutation.isPending}
                />
                <span className="ml-2 text-gray-700 text-sm">
                  Toggle All Players Playing / Not Playing
                </span>
              </label>
            </div>
            {players.length !== 0 && (
              <Suspense fallback={<LoadingPlayers />}>
                <PlayerListToggleIsPlaying
                  players={players}
                  rsvpsForGame={queryRsvpsForGame}
                  onTogglePlayingThisWeek={onTogglePlayingThisWeek}
                />
              </Suspense>
            )}
          </>
        )}
      </div>
    </div>
  )
}
