import { useState, useEffect } from 'react'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import Teams from './Teams'
import UpcomingGamesDropDown from './UpcomingGamesDropDown'
import { PulseLoader } from 'react-spinners'
import {
  usePlayers,
  useUpcomingGames,
  useGameRsvps,
  useBulkUpdatePlayers,
  useBalanceTeams,
} from '../hooks/useApi'

export default function CreateTeams() {
  const [numTeams, setNumTeams] = useState(2)
  const [balancedTeams, setBalancedTeams] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingMessage, setShowLoadingMessage] = useState(true)
  const [openPlayerList, setOpenPlayerList] = useState(true)
  const [upcomingGames, setUpcomingGames] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedGameId, setSelectedGameId] = useState(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [selectedGameInfo, setSelectedGameInfo] = useState(null)

  // React Query hooks
  const {
    data: queryPlayers = [],
    isLoading: playersLoading,
    error: playersError,
  } = usePlayers()
  const { data: queryUpcomingGames = [], isLoading: gamesLoading } =
    useUpcomingGames()
  const { data: queryRsvpsForGame = [], isLoading: rsvpsLoading } =
    useGameRsvps(selectedGameId, {
      enabled: !!selectedGameId,
    })
  const bulkUpdateMutation = useBulkUpdatePlayers()
  const balanceTeamsMutation = useBalanceTeams()

  const normalizeName = name => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  const updatePlayersBasedOnRsvps = rsvps => {
    // Create a Set of normalized RSVP'd player names for faster lookup
    const rsvpNames = new Set(rsvps.map(name => normalizeName(name)))

    const updatedPlayers = players.map(player => {
      const normalizedPlayerName = normalizeName(player.name)
      const isPlaying = rsvpNames.has(normalizedPlayerName)

      return {
        ...player,
        isPlayingThisWeek: isPlaying,
      }
    })

    setPlayers(updatedPlayers)
    setSelectedPlayerCount(rsvps.length)
    setSelectAll(rsvps.length === players.length)
  }

  // Sync React Query data with local state
  useEffect(() => {
    if (queryUpcomingGames.length > 0) {
      setUpcomingGames(queryUpcomingGames)
    }
  }, [queryUpcomingGames])

  useEffect(() => {
    if (queryPlayers.length > 0 || !playersLoading) {
      // Initialize players with their current playing status from the database
      const fetchedPlayers = queryPlayers.map(player => {
        // Default to false unless explicitly set to true in the database
        const isPlaying =
          player.isPlayingThisWeek === true ||
          player.isPlayingThisWeek === 'true'

        return {
          ...player,
          isPlayingThisWeek: isPlaying,
        }
      })

      setPlayers(fetchedPlayers)
      const playingCount = fetchedPlayers.filter(
        player => player.isPlayingThisWeek
      ).length
      setSelectAll(playingCount === fetchedPlayers.length)
      setSelectedPlayerCount(playingCount)
      setIsLoading(false)
      setShowLoadingMessage(false)
      setInitialLoadComplete(true)
    }
  }, [queryPlayers, playersLoading])

  // Use queryRsvpsForGame directly instead of maintaining separate state

  // Track if we've already processed RSVPs for this game to prevent re-processing
  const [processedGameId, setProcessedGameId] = useState(null)

  useEffect(() => {
    // Only process when we have a selected game, RSVP data, and players data
    // and we haven't already processed this game
    if (
      !selectedGameId ||
      !queryRsvpsForGame ||
      players.length === 0 ||
      processedGameId === selectedGameId ||
      rsvpsLoading
    ) {
      return
    }

    const processRsvpsForGame = async () => {
      try {
        // Ensure player list is open at the start
        setOpenPlayerList(true)

        // Don't set isLoadingRsvps to true here - process silently in background
        // This prevents the flashing between loading and list states

        // Create a Set of normalized RSVP'd player names for faster lookup
        const rsvpNames = new Set(
          queryRsvpsForGame.map(name => normalizeName(name))
        )

        // Update local state immediately to prevent re-renders during API calls
        const updatedPlayers = players.map(player => {
          const normalizedName = normalizeName(player.name)
          return {
            ...player,
            isPlayingThisWeek: rsvpNames.has(normalizedName),
          }
        })

        setPlayers(updatedPlayers)
        const selectedCount = updatedPlayers.filter(
          p => p.isPlayingThisWeek
        ).length
        setSelectedPlayerCount(selectedCount)
        setSelectAll(selectedCount === players.length)

        // Mark this game as processed BEFORE making API calls to prevent duplicate processing
        setProcessedGameId(selectedGameId)

        // First, set all players to not playing
        const allPlayerIds = players.map(player => player._id)

        await bulkUpdateMutation.mutateAsync({
          isPlayingThisWeek: false,
          playerIds: allPlayerIds,
        })

        // Then set only RSVP'd players to playing (if any)
        const playingPlayerIds = players
          .filter(player => {
            const normalizedName = normalizeName(player.name)
            return rsvpNames.has(normalizedName)
          })
          .map(player => player._id)

        if (playingPlayerIds.length > 0) {
          await bulkUpdateMutation.mutateAsync({
            isPlayingThisWeek: true,
            playerIds: playingPlayerIds,
          })
        }

        // Ensure player list stays open at the end
        setOpenPlayerList(true)
      } catch (error) {
        console.error('Failed to process RSVPs:', error)
        // Reset processed game ID on error so user can retry
        setProcessedGameId(null)
        // Don't set error state for auth failures, let withAuth handle the redirect
        if (error.response?.status !== 401) {
          setError('Failed to process RSVPs for the selected game')
        }
      }
      // Removed finally block that was setting isLoadingRsvps to false
    }

    // Add a small delay to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      processRsvpsForGame()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [selectedGameId, queryRsvpsForGame, rsvpsLoading]) // Removed players.length dependency to prevent infinite loop

  const handleTogglePlayingThisWeek = async playerId => {
    const playerToUpdate = players.find(player => player._id === playerId)
    const newPlayingState = !playerToUpdate.isPlayingThisWeek

    const updatedPlayers = players.map(player =>
      player._id === playerId
        ? { ...player, isPlayingThisWeek: newPlayingState }
        : player
    )

    setPlayers(updatedPlayers)
    setSelectedPlayerCount(
      updatedPlayers.filter(p => p.isPlayingThisWeek).length
    )
    setSelectAll(updatedPlayers.every(player => player.isPlayingThisWeek))

    try {
      await bulkUpdateMutation.mutateAsync({
        isPlayingThisWeek: newPlayingState,
        playerIds: [playerId],
      })
    } catch (error) {
      console.error('Failed to update player:', error)
      // Revert the change on error
      const revertedPlayers = players.map(player =>
        player._id === playerId
          ? { ...player, isPlayingThisWeek: !newPlayingState }
          : player
      )
      setPlayers(revertedPlayers)
      setSelectedPlayerCount(
        revertedPlayers.filter(p => p.isPlayingThisWeek).length
      )
      setSelectAll(revertedPlayers.every(player => player.isPlayingThisWeek))
      setError('Failed to update player status')
    }
  }

  const handleSelectAll = async () => {
    const newSelectAllState = !selectAll

    const updatedPlayers = players.map(player => ({
      ...player,
      isPlayingThisWeek: newSelectAllState,
    }))

    setPlayers(updatedPlayers)
    setSelectAll(newSelectAllState)
    setSelectedPlayerCount(newSelectAllState ? players.length : 0)

    try {
      // Get all player IDs
      const playerIds = players.map(player => player._id)

      await bulkUpdateMutation.mutateAsync({
        isPlayingThisWeek: newSelectAllState,
        playerIds: playerIds,
      })
    } catch (error) {
      console.error('Failed to update all players:', error)
      // Revert the change on error
      const revertedPlayers = players.map(player => ({
        ...player,
        isPlayingThisWeek: !newSelectAllState,
      }))
      setPlayers(revertedPlayers)
      setSelectAll(!newSelectAllState)
      setSelectedPlayerCount(!newSelectAllState ? players.length : 0)
      setError('Failed to update all players')
    }
  }

  const handleBalanceTeams = async () => {
    setError(null)
    try {
      setIsLoading(true)
      setShowLoadingMessage(true)

      // Minimum duration of 2 seconds for loading message
      const minimumDuration = new Promise(resolve => setTimeout(resolve, 2000))

      // Get only the players that are marked as playing
      const playingPlayers = players.filter(player => player.isPlayingThisWeek)

      if (playingPlayers.length === 0) {
        setError('Please select at least one player to create teams')
        setIsLoading(false)
        setShowLoadingMessage(false)
        return
      }

      // Clean up player data to only include necessary fields and ensure correct types
      const cleanPlayers = playingPlayers.map((player, index) => {
        // Validate scores are between 0 and 10
        const validateScore = (score, field) => {
          const num = Number(score || 0)
          if (isNaN(num) || num < 0 || num > 10) {
            throw new Error(
              `Invalid ${field} score for player ${player.name}: ${score}`
            )
          }
          return num
        }

        return {
          name: String(player.name || ''),
          gameKnowledgeScore: validateScore(
            player.gameKnowledgeScore,
            'game knowledge'
          ),
          goalScoringScore: validateScore(
            player.goalScoringScore,
            'goal scoring'
          ),
          attackScore: validateScore(player.attackScore, 'attack'),
          midfieldScore: validateScore(player.midfieldScore, 'midfield'),
          defenseScore: validateScore(player.defenseScore, 'defense'),
          fitnessScore: validateScore(player.fitnessScore, 'fitness'),
          gender: String(player.gender || 'male'),
          isPlayingThisWeek: true,
        }
      })

      try {
        // Send the request using React Query mutation
        const [res] = await Promise.all([
          balanceTeamsMutation.mutateAsync({
            numTeams: parseInt(numTeams, 10),
            players: cleanPlayers,
          }),
          minimumDuration,
        ])

        setTotalPlayers(cleanPlayers.length)
        setBalancedTeams(res.teams)
        setIsLoading(false)
        setShowLoadingMessage(false)
        setOpenPlayerList(false)
      } catch (err) {
        console.error('API Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          errors: err.response?.data?.errors,
          message: err.message,
          headers: err.response?.headers,
          config: err.config,
        })

        // Log the full error response
        if (err.response) {
          console.error('Error Response:', {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
            headers: err.response.headers,
          })
        }

        let errorMessage = 'An error occurred while creating teams'
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
        setIsLoading(false)
        setShowLoadingMessage(false)
      }
    } catch (err) {
      console.error('Error creating teams:', err)
      setError(err.message || 'An error occurred while creating teams')
      setIsLoading(false)
      setShowLoadingMessage(false)
    }
  }

  // Handle game selection
  const handleGameSelect = gameId => {
    setOpenPlayerList(true) // Set to true first
    const selectedGame = upcomingGames.find(game => game._id === gameId)
    setSelectedDate(new Date(selectedGame.meetdate))
    setSelectedGameId(gameId)
    setSelectedGameInfo(selectedGame) // Store the full game info for printout
    setProcessedGameId(null) // Reset processed game ID to allow processing of new game
    setBalancedTeams(null)
    setTotalPlayers(0)
  }

  return (
    <div className="flex flex-col mx-6">
      <h2 className="text-3xl font-semibold mb-4 print:hidden md:justify-center text-loonsDarkBrown mt-6">
        Create Teams
      </h2>
      <div className="flex items-center justify-center mt-4 mb-4 print:hidden">
        <div className="flex-col justify-center items-center">
          <div className="text-lg mb-4">
            Choose an upcoming game to see the players RSVP'd from Heja for that
            game
          </div>
          <UpcomingGamesDropDown
            upcomingGames={upcomingGames.map(game => ({
              value: game._id,
              label: `${game.title} - ${new Date(
                game.meetdate
              ).toLocaleDateString()}`,
            }))}
            onSelect={handleGameSelect}
          />
          {selectedGameId && (
            <div className="mt-4 items-center justify-center">
              <h3 className="text-xl font-bold text-loonsRed my-6">
                {queryRsvpsForGame.length} Players RSVP'd for this game on Heja
              </h3>
              {rsvpsLoading ? (
                <p className="flex justify-start items-center gap-2 text-gray-700 text-xl py-4">
                  Loading RSVPs and updating player list{' '}
                  <PulseLoader color="black" size={6} />
                </p>
              ) : queryRsvpsForGame.length > 0 ? (
                <div className="flex flex-col">
                  <ul className="list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center justify-center">
                    {queryRsvpsForGame
                      .sort((a, b) => a.localeCompare(b))
                      .map((player, index) => {
                        // Check if the player exists in the players list
                        const playerExists = players.some(
                          p => normalizeName(p.name) === normalizeName(player)
                        )
                        return (
                          <li
                            key={index}
                            className={`text-gray-700 ${
                              !playerExists
                                ? 'text-loonsRed font-bold bg-red-200 rounded-md p-1 max-w-[16.5rem]'
                                : ''
                            }`}
                          >
                            {player}
                            {!playerExists && (
                              <span className=" text-loonsRed text-[0.6rem] ml-2">
                                * Not in the player list below
                              </span>
                            )}
                          </li>
                        )
                      })}
                  </ul>
                  {queryRsvpsForGame.some(
                    player =>
                      !players.some(
                        p => normalizeName(p.name) === normalizeName(player)
                      )
                  ) && (
                    <div className="text-red-600 text-xs max-w-sm mt-5">
                      * please double check the player name spelling; the
                      spelling in Heja and in this application must match.
                      Alternately, this player may need to be added to the loons
                      team balancer.
                    </div>
                  )}
                </div>
              ) : (
                <p>No players have RSVP'd for this game yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col rounded pt-6 pb-8 mb-4 print:pt-0 print:mb-0 print:px-0 print:pb-0">
        {error && (
          <p className="text-center text-red-500 text-sm mt-2">{error}</p>
        )}
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
                onClick={() => setOpenPlayerList(!openPlayerList)}
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
                      onChange={handleSelectAll}
                      disabled={bulkUpdateMutation.isPending}
                    />
                    <span className="ml-2 text-gray-700 text-sm">
                      Toggle All Players Playing / Not Playing
                    </span>
                  </label>
                </div>
                {showLoadingMessage && players.length === 0 ? (
                  <p className="flex justify-center items-center gap-2 text-gray-700 text-xl py-4">
                    Loading players
                    <PulseLoader color="black" size={6} />
                  </p>
                ) : (
                  <PlayerListToggleIsPlaying
                    players={players}
                    rsvpsForGame={queryRsvpsForGame}
                    onTogglePlayingThisWeek={handleTogglePlayingThisWeek}
                  />
                )}
              </>
            )}
          </div>
        </div>
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
              onChange={e => setNumTeams(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between print:hidden">
            <button
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-2 border-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline print:hidden mb-4"
              onClick={handleBalanceTeams}
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
          {balancedTeams && (
            <Teams
              balancedTeams={balancedTeams}
              setBalancedTeams={setBalancedTeams}
              totalPlayers={totalPlayers}
              selectedGameInfo={selectedGameInfo}
            />
          )}
        </div>
      </div>
    </div>
  )
}
