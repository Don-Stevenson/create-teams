import { useState, useEffect, useCallback, useRef } from 'react'
import Layout from '../src/app/components/Layout.js'
import PlayerList from '../src/app/components/PlayerList'
import AddPlayerForm from '../src/app/components/AddPlayer.js'
import EditPlayerModal from '../src/app/components/EditPlayerModal.js'
import api from '../utils/api'
import withAuth from '@/app/components/withAuth.js'

function Players() {
  const [players, setPlayers] = useState([])
  const [playerToEdit, setPlayerToEdit] = useState(null)
  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const lastFetchRef = useRef(0)
  const fetchTimeoutRef = useRef(null)
  const FETCH_COOLDOWN = 5000

  const fetchPlayers = useCallback(async (force = false) => {
    const now = Date.now()

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    if (!force && now - lastFetchRef.current < FETCH_COOLDOWN) {
      const timeToWait = FETCH_COOLDOWN - (now - lastFetchRef.current)
      fetchTimeoutRef.current = setTimeout(() => fetchPlayers(true), timeToWait)
      return
    }

    try {
      setIsLoading(true)
      const res = await api.get('/players')
      setPlayers(
        res.data.map(player => ({
          ...player,
          isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
        }))
      )
      lastFetchRef.current = Date.now()
    } catch (error) {
      console.error('Failed to fetch players:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlayers(true)

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [fetchPlayers])

  const addPlayer = async newPlayer => {
    try {
      const response = await api.post('/players', newPlayer)
      if (response?.data) {
        const formattedPlayer = {
          ...response.data,
          isPlayingThisWeek: Boolean(response.data.isPlayingThisWeek),
          gameKnowledgeScore: parseInt(response.data.gameKnowledgeScore),
          goalScoringScore: parseInt(response.data.goalScoringScore),
          attackScore: parseInt(response.data.attackScore),
          midfieldScore: parseInt(response.data.midfieldScore),
          defenseScore: parseInt(response.data.defenseScore),
          fitnessScore: parseInt(response.data.fitnessScore),
        }

        setPlayers(prevPlayers => {
          const newPlayers = [...prevPlayers, formattedPlayer]
          return newPlayers.sort((a, b) => a.name.localeCompare(b.name))
        })

        setShowAddPlayer(false)

        return formattedPlayer
      }
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Failed to add player:', error)
    }
  }

  const onDeletePlayer = async playerId => {
    try {
      await api.delete(`/players/${playerId}`)
      setPlayers(prevPlayers =>
        prevPlayers.filter(player => player._id !== playerId)
      )
      setPlayerToDelete(null)
      await fetchPlayers(true)
    } catch (error) {
      console.error('Failed to delete player:', error)
    }
  }

  const handlePlayerUpdate = async updatedPlayer => {
    try {
      const playerData = {
        ...updatedPlayer,
        gameKnowledgeScore: parseInt(updatedPlayer.gameKnowledgeScore, 10),
        goalScoringScore: parseInt(updatedPlayer.goalScoringScore, 10),
        attackScore: parseInt(updatedPlayer.attackScore, 10),
        midfieldScore: parseInt(updatedPlayer.midfieldScore, 10),
        defenseScore: parseInt(updatedPlayer.defenseScore, 10),
        fitnessScore: parseInt(updatedPlayer.fitnessScore, 10),
        isPlayingThisWeek: updatedPlayer.isPlayingThisWeek.toString(),
      }

      const res = await api.put(
        `/players/${updatedPlayer._id}/playerInfo`,
        playerData
      )

      const updatedPlayerData = {
        ...res.data,
        isPlayingThisWeek: Boolean(res.data.isPlayingThisWeek),
      }

      setPlayers(prevPlayers =>
        prevPlayers.map(player =>
          player._id === updatedPlayer._id ? updatedPlayerData : player
        )
      )

      setIsEditModalOpen(false)
      setPlayerToEdit(null)
      await fetchPlayers(true)
    } catch (error) {
      console.error('Failed to update player:', error)
    }
  }

  const handleEditPlayer = playerId => {
    const playerToEdit = players.find(p => p._id === playerId)
    setPlayerToEdit(playerToEdit)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setPlayerToEdit(null)
  }

  const handleDeleteConfirmation = playerId => {
    const playerToDelete = players.find(p => p._id === playerId)
    setPlayerToDelete(playerToDelete)
  }

  const cancelDelete = () => {
    setPlayerToDelete(null)
  }

  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <Layout>
      <div className="flex-col px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-loonsDarkBrown">
          Manage Players
        </h1>
        <h2
          className="text-lg font-semibold mb-4 rounded bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 w-[200px] h-18 p-3 text-center cursor-pointer"
          onClick={() => setShowAddPlayer(!showAddPlayer)}
        >
          Add A New Player
        </h2>
        {showAddPlayer && (
          <AddPlayerForm
            onAddPlayer={addPlayer}
            setShowAddPlayer={setShowAddPlayer}
          />
        )}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-loonsDarkBrown">
            List of Players
          </h2>
          <div className="flex-col text-loonsDarkBrown mb-4 gap-1">
            <p className="text-sm">Legend:</p>
            <p className="text-xxs">
              K: Game knowledge, Sc: Goal Scoring, A: Attack, Md: Midfield, D:
              Defense, M/S: Mobility/Stamina
            </p>
          </div>
          {isLoading && players.length === 0 ? (
            <div className="text-center py-4">Loading players...</div>
          ) : (
            <PlayerList
              players={sortedPlayers}
              onEditPlayer={handleEditPlayer}
              onDeletePlayer={handleDeleteConfirmation}
            />
          )}
        </div>
      </div>
      {isEditModalOpen && playerToEdit && (
        <EditPlayerModal
          player={playerToEdit}
          onUpdatePlayer={handlePlayerUpdate}
          onClose={closeEditModal}
        />
      )}
      {playerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg bg-white w-[260px] sm:w-[350px]">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete {playerToDelete.name}?</p>
            <div className="flex sm:justify-end justify-between mt-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => onDeletePlayer(playerToDelete._id)}
                className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-2 border-red-900 font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default withAuth(Players)
