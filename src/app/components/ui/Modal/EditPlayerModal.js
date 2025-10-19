// components/editPlayerModal
import React, { useState, useEffect } from 'react'
import { Button } from '../Button/Button'

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      data-testid="edit-player-modal"
    >
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Edit Player</h2>
        <form
          onSubmit={handleSubmit}
          data-testid="edit-player-form"
          className="text-sm"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedPlayer.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="gameKnowledgeScore"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Game Knowledge Score Score (1-10)
            </label>
            <input
              type="number"
              id="gameKnowledgeScore"
              name="gameKnowledgeScore"
              value={editedPlayer.gameKnowledgeScore}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="goalScoringScore"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Goal Scoring Score (1-10)
            </label>
            <input
              type="number"
              id="goalScoringScore"
              name="goalScoringScore"
              value={editedPlayer.goalScoringScore}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="attackScore"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Attack Score (1-10)
            </label>
            <input
              type="number"
              id="attackScore"
              name="attackScore"
              value={editedPlayer.attackScore}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="midfieldScore"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Midfield Score (1-10)
            </label>
            <input
              type="number"
              id="midfieldScore"
              name="midfieldScore"
              value={editedPlayer.midfieldScore}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="defenseScore"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Defense Score (1-10)
            </label>
            <input
              type="number"
              id="defenseScore"
              name="defenseScore"
              value={editedPlayer.defenseScore}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="fitnessScore"
              className="block text-gray-700 font-bold mb-2 text-sm"
            >
              Mobility/Stamina Score (1-10)
            </label>
            <input
              type="number"
              id="fitnessScore"
              name="fitnessScore"
              value={editedPlayer.fitnessScore}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="flex justify-between gap-2">
            <Button
              onClick={onClose}
              text="Cancel"
              variant="secondary"
              testId="cancel-button"
              classes="text-sm bg-white"
            />
            <Button
              type="submit"
              text="Save Changes"
              variant="primary"
              testId="save-changes-button"
              classes="text-sm"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPlayerModal
