import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import Teams from './Teams'
import UpcomingGamesDropDown from './UpcomingGamesDropDown'

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
  const [isCreatingTeams, setIsCreatingTeams] = useState(false)
  const [openPlayerList, setOpenPlayerList] = useState(false)
  const [upcomingGames, setUpcomingGames] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [rsvpsForGame, setRsvpsForGame] = useState([])
  const [selectedGameId, setSelectedGameId] = useState(null)
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false)

  const normalizeName = name => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  const updatePlayersBasedOnRsvps = rsvps => {
    // Create a Set of normalized RSVP'd player names for faster lookup
    const rsvpNames = new Set(rsvps.map(name => normalizeName(name)))

    const updatedPlayers = players.map(player => {
      const normalizedPlayerName = normalizeName(player.name)
      const isPlaying = rsvpNames.has(normalizedPlayerName)

      // Log any name mismatches for debugging
      if (player.isPlayingThisWeek !== isPlaying) {
        console.log('Name match status:', {
          playerName: player.name,
          normalizedPlayerName,
          rsvpNames: Array.from(rsvpNames),
          isPlaying,
        })
      }

      return {
        ...player,
        isPlayingThisWeek: isPlaying,
      }
    })

    setPlayers(updatedPlayers)
    setSelectedPlayerCount(rsvps.length)
    setSelectAll(rsvps.length === players.length)
  }

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      const res = await api.get('/upcoming-games')
      setUpcomingGames(res.data)
    }
    fetchUpcomingGames()
  }, [])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true)
        setShowLoadingMessage(true)

        const minimumDuration = new Promise(resolve => setTimeout(resolve, 400))

        const [res] = await Promise.all([api.get('/players'), minimumDuration])

        // Initialize players with their current playing status
        const fetchedPlayers = res.data.map(player => ({
          ...player,
          isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
        }))
        setPlayers(fetchedPlayers)
        setSelectAll(fetchedPlayers.every(player => player.isPlayingThisWeek))
        setSelectedPlayerCount(
          fetchedPlayers.filter(player => player.isPlayingThisWeek).length
        )
        setIsLoading(false)
        setShowLoadingMessage(false)
      } catch (error) {
        console.error('Failed to fetch players:', error)
        setError('Failed to fetch players')
        setIsLoading(false)
        setShowLoadingMessage(false)
      }
    }
    fetchPlayers()
  }, [])

  const deselectAllPlayers = async () => {
    try {
      // Update all players to not playing this week
      await api.put('/players-bulk-update', {
        isPlayingThisWeek: 'false',
      })

      // Update local state
      const updatedPlayers = players.map(player => ({
        ...player,
        isPlayingThisWeek: false,
      }))
      setPlayers(updatedPlayers)
      setSelectedPlayerCount(0)
      setSelectAll(false)
    } catch (error) {
      console.error('Failed to deselect all players:', error)
      setError('Failed to deselect all players')
    }
  }

  useEffect(() => {
    const fetchRsvpsForGame = async () => {
      if (!selectedGameId) return
      try {
        setIsLoadingRsvps(true)
        const res = await api.get(`/rsvps-for-game/${selectedGameId}`)
        setRsvpsForGame(res.data)

        // First, deselect all players
        await deselectAllPlayers()

        // Then, select only the players in the RSVP list
        const rsvpNames = new Set(res.data.map(name => normalizeName(name)))

        // Log the RSVP names and player names for debugging
        console.log('RSVP Names:', {
          original: res.data,
          normalized: Array.from(rsvpNames),
        })
        console.log(
          'Player Names:',
          players.map(p => ({
            original: p.name,
            normalized: normalizeName(p.name),
            isInRsvp: rsvpNames.has(normalizeName(p.name)),
          }))
        )

        // Select players that are in the RSVP list
        for (const player of players) {
          const normalizedPlayerName = normalizeName(player.name)
          const shouldBePlaying = rsvpNames.has(normalizedPlayerName)

          console.log('Checking player:', {
            name: player.name,
            normalized: normalizedPlayerName,
            shouldBePlaying,
            isCurrentlyPlaying: player.isPlayingThisWeek,
          })

          if (shouldBePlaying && !player.isPlayingThisWeek) {
            console.log('Selecting player:', player.name)
            await handleTogglePlayingThisWeek(player._id)
          }
        }

        // Update the selected player count and select all state
        const finalPlayers = players.map(player => ({
          ...player,
          isPlayingThisWeek: rsvpNames.has(normalizeName(player.name)),
        }))

        // Log final state
        console.log(
          'Final player states:',
          finalPlayers
            .filter(p => p.isPlayingThisWeek)
            .map(p => ({
              name: p.name,
              normalized: normalizeName(p.name),
              isPlaying: p.isPlayingThisWeek,
            }))
        )

        setSelectedPlayerCount(
          finalPlayers.filter(p => p.isPlayingThisWeek).length
        )
        setSelectAll(finalPlayers.every(player => player.isPlayingThisWeek))
      } catch (error) {
        console.error('Failed to fetch RSVPs:', error)
        setError('Failed to fetch RSVPs for the selected game')
      } finally {
        setIsLoadingRsvps(false)
      }
    }
    fetchRsvpsForGame()
  }, [selectedGameId, players.length])

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
      await api.put(`/players/${playerId}`, {
        ...playerToUpdate,
        isPlayingThisWeek: newPlayingState.toString(),
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
      await api.put('/players-bulk-update', {
        isPlayingThisWeek: newSelectAllState.toString(),
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

      const minimumDuration = new Promise(resolve => setTimeout(resolve, 500))

      // Get only the players that are marked as playing
      const playingPlayers = players.filter(player => player.isPlayingThisWeek)

      if (playingPlayers.length === 0) {
        throw new Error('No players selected for team creation')
      }

      // Clean up player data to only include necessary fields and ensure correct types
      const cleanPlayers = playingPlayers.map(player => ({
        _id: String(player._id),
        name: String(player.name),
        gameKnowledgeScore: Number(player.gameKnowledgeScore),
        goalScoringScore: Number(player.goalScoringScore),
        attackScore: Number(player.attackScore),
        midfieldScore: Number(player.midfieldScore),
        defenseScore: Number(player.defenseScore),
        fitnessScore: Number(player.fitnessScore),
        gender: String(player.gender || 'male'),
        isPlayingThisWeek: true,
      }))

      // Create the request payload
      const requestPayload = {
        numTeams: Number(numTeams),
        players: cleanPlayers,
      }

      // Log the exact data being sent
      console.log('Sending request with:', {
        numTeams: requestPayload.numTeams,
        playerCount: requestPayload.players.length,
        firstPlayer: requestPayload.players[0],
        isArray: Array.isArray(requestPayload.players),
      })

      try {
        // Send the request with explicit content type
        const [res] = await Promise.all([
          api.post('/balance-teams', requestPayload, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          minimumDuration,
        ])

        console.log('Response received:', res.data)

        setOpenPlayerList(true)
        setTotalPlayers(cleanPlayers.length)
        setBalancedTeams(res.data.teams)
        setIsLoading(false)
        setShowLoadingMessage(false)
      } catch (err) {
        console.error('API Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          errors: err.response?.data?.errors,
          message: err.message,
          requestData: requestPayload,
        })

        let errorMessage = 'An error occurred while creating teams'

        if (err.response?.data?.errors) {
          const errorDetails = err.response.data.errors
            .map(e => {
              if (typeof e === 'string') return e
              return `${e.param || e.path}: ${e.msg}`
            })
            .join(', ')
          errorMessage = `Validation Error: ${errorDetails}`
        } else if (err.response?.data?.error) {
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

  console.log('rsvpsForGame', rsvpsForGame)

  return (
    <div className="container">
      <div className="flex items-center justify-center mt-4 mb-4">
        <div className="flex-col justify-center items-center">
          <div className="text-lg mb-4">
            Choose an upcoming game to see the players playing that day
          </div>
          <UpcomingGamesDropDown
            upcomingGames={upcomingGames.map(game => ({
              value: game._id,
              label: `${game.title} - ${new Date(
                game.meetdate
              ).toLocaleDateString()}`,
            }))}
            onSelect={gameId => {
              const selectedGame = upcomingGames.find(
                game => game._id === gameId
              )
              setSelectedDate(new Date(selectedGame.meetdate))
              setSelectedGameId(gameId)
            }}
          />
          {selectedGameId && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Players RSVP'd for this game:
              </h3>
              {isLoadingRsvps ? (
                <p className="text-gray-700 text-center text-xl py-4">
                  Loading RSVPs...
                </p>
              ) : rsvpsForGame.length > 0 ? (
                <ul className="list-disc pl-5">
                  {rsvpsForGame.map((player, index) => (
                    <li key={index} className="text-gray-700">
                      {player}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No players have RSVP'd for this game yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col rounded pt-6 pb-8 mb-4 print:pt-0 print:mb-0 print:px-0 print:pb-0">
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="print:hidden">
          <div className="flex-col flex-wrap">
            {openPlayerList ? (
              <div className="h-[5.5rem] mb-4">{''}</div>
            ) : (
              <>
                <h2 className="text-3xl font-semibold mb-4 print:hidden md:justify-center text-loonsDarkBrown">
                  Player List
                </h2>
                <p className="flex text-center md:justify-center mb-4 print:hidden">
                  <span className="font-bold text-xl text-gray-800 ">
                    {`Total Players Selected: ${selectedPlayerCount}`}
                  </span>
                </p>
              </>
            )}
            <div className="flex justify-center items-center mb-2">
              <button
                onClick={() => setOpenPlayerList(!openPlayerList)}
                className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-red-900 mb-2 text-lg font-bold border-2  rounded-md px-2 py-1"
              >
                {openPlayerList ? 'Show Player List' : 'Hide Player List'}
              </button>
            </div>
            {!openPlayerList && (
              <>
                <div className="flex md:justify-center mb-4 print:hidden">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-loonsRed"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span className="ml-2 text-gray-700 text-sm">
                      Toggle All Players Playing / Not Playing
                    </span>
                  </label>
                </div>
                {showLoadingMessage && players.length === 0 ? (
                  <div className="text-center text-xl py-4">
                    Loading players...
                  </div>
                ) : (
                  <PlayerListToggleIsPlaying
                    players={players}
                    rsvpsForGame={rsvpsForGame}
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
              {'Create Balanced Teams'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
          {balancedTeams && (
            <Teams
              balancedTeams={balancedTeams}
              setBalancedTeams={setBalancedTeams}
              totalPlayers={totalPlayers}
            />
          )}
        </div>
      </div>
    </div>
  )
}
