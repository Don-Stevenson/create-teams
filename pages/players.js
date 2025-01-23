import { useState, useEffect, useCallback, useRef } from 'react'
import Layout from '../src/app/components/Layout.js'
import PlayerList from '../src/app/components/PlayerList'

import EditPlayerModal from '../src/app/components/EditPlayerModal.js'
import api from '../utils/api'
import withAuth from '@/app/components/withAuth.js'
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal.js'
import AddPlayerModal from '@/app/components/AddPlayerModal.js'

function Players() {
  const [players, setPlayers] = useState([])
  const [playerToEdit, setPlayerToEdit] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false)
  const [playerAdded, setPlayerAdded] = useState(false)

  const [deleteState, setDeleteState] = useState({
    isDeleting: false,
    playerToDelete: null,
  })

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

        setIsAddPlayerModalOpen(false)
        setPlayerAdded(true)
        setTimeout(() => setPlayerAdded(false), 2500)

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
    } catch (error) {
      if (error.response?.status === 404) {
        console.error('Player not found')
      } else if (error.response?.status === 403) {
        console.error('You do not have permission to delete this player')
      } else {
        console.error('Failed to delete player')
      }
      console.error('Failed to delete player:', error)
    }
  }

  const confirmDelete = async () => {
    if (deleteState.playerToDelete) {
      try {
        await onDeletePlayer(deleteState.playerToDelete._id)
      } catch (error) {
        console.error('Delete failed', error)
      } finally {
        setDeleteState({
          isDeleting: false,
          playerToDelete: null,
        })
      }
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
    setDeleteState({
      isDeleting: true,
      playerToDelete,
    })
  }

  const cancelDelete = () => {
    setDeleteState({
      isDeleting: false,
      playerToDelete: null,
    })
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
        <div>
          <button
            className="text-lg font-semibold mb-4 rounded bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 w-[200px] h-18 p-3 text-center"
            onClick={() => setIsAddPlayerModalOpen(true)}
          >
            Add A New Player
          </button>
          <AddPlayerModal
            isOpen={isAddPlayerModalOpen}
            onAddPlayer={addPlayer}
            playerAdded={playerAdded}
            onClose={() => setIsAddPlayerModalOpen(false)}
          />
          <p
            className={`italic mt-4 ${
              playerAdded ? 'text-green-600' : 'text-background'
            }`}
          >
            {playerAdded ? 'Player added successfully!' : 'placeholder'}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-black">
            List of Players
          </h2>
          <div className="flex-col text-black mb-4 gap-1">
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
      <DeleteConfirmationModal
        isOpen={deleteState.isDeleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        playerName={deleteState.playerToDelete?.name}
      />
    </Layout>
  )
}

export default withAuth(Players)
