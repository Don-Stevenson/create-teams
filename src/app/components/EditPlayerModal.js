// components/editPlayerModal
import React, { useState, useEffect } from 'react'

const EditPlayerModal = ({ player, onUpdatePlayer, onClose }) => {
  const [editedPlayer, setEditedPlayer] = useState(player)

  useEffect(() => {
    setEditedPlayer(player)
  }, [player])

  const handleInputChange = e => {
    const { name, value } = e.target
    setEditedPlayer(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onUpdatePlayer(editedPlayer)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Edit Player</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-bold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedPlayer.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="attackScore"
              className="block text-gray-700 font-bold mb-2"
            >
              Attack Score (1-50)
            </label>
            <input
              type="number"
              id="attackScore"
              name="attackScore"
              value={editedPlayer.attackScore}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="defenseScore"
              className="block text-gray-700 font-bold mb-2"
            >
              Defense Score (1-50)
            </label>
            <input
              type="number"
              id="defenseScore"
              name="defenseScore"
              value={editedPlayer.defenseScore}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="fitnessScore"
              className="block text-gray-700 font-bold mb-2"
            >
              Fitness Score (1-50)
            </label>
            <input
              type="number"
              id="fitnessScore"
              name="fitnessScore"
              value={editedPlayer.fitnessScore}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-black font-bold py-2 px-4 border border-gray-300 rounded w-[142px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPlayerModal
