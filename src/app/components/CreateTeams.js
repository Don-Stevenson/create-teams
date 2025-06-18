import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import Teams from './Teams'

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

  useEffect(() => {
    let timer
    if (players.length > 0) {
      timer = setTimeout(() => {
        setShowLoadingMessage(false)
        setIsLoading(false)
      }, 400)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [players.length])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true)
        setShowLoadingMessage(true)

        const minimumDuration = new Promise(resolve => setTimeout(resolve, 400))

        const [res] = await Promise.all([api.get('/players'), minimumDuration])

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

      const [res] = await Promise.all([
        api.post('/balance-teams', { numTeams }),
        minimumDuration,
      ])
      setOpenPlayerList(true)
      setTotalPlayers(res.data.totalPlayersPlaying)
      setBalancedTeams(res.data.teams)
      setIsLoading(false)
      setShowLoadingMessage(false)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
      setIsLoading(false)
      setShowLoadingMessage(false)
    }
  }

  return (
    <div className="container">
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
