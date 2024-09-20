// pages/players.js
import { useState, useEffect } from 'react'
import Layout from '../src/app/components/Layout.js'
import PlayerList from '../src/app/components/PlayerList'
import AddPlayerForm from '../src/app/components/AddPlayerForm'
import api from '../utils/api'

export default function Players() {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/players')
        setPlayers(res.data)
      } catch (error) {
        console.error('Failed to fetch players:', error)
      }
    }
    fetchPlayers()
  }, [])

  const addPlayer = newPlayer => {
    setPlayers([...players, newPlayer])
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Manage Players</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Add New Player</h2>
            <AddPlayerForm onAddPlayer={addPlayer} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Player List</h2>
            <PlayerList players={players} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
