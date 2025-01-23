import { useState } from 'react'
import Select from 'react-select'

export default function AddPlayerModal({
  onAddPlayer,
  onClose,
  isOpen,
  playerAdded,
}) {

  const [playerData, setPlayerData] = useState({
    name: '',
    gameKnowledgeScore: '',
    goalScoringScore: '',
    attackScore: '',
    defenseScore: '',
    midfieldScore: '',
    fitnessScore: '',
    gender: '',
    isPlayingThisWeek: true,
  })
  const [error, setError] = useState(null)

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'nonBinary', label: 'Non Binary' },
  ]

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      await onAddPlayer(playerData)
      setPlayerData({
        name: '',
        gameKnowledgeScore: '',
        goalScoringScore: '',
        attackScore: '',
        midfieldScore: '',
        defenseScore: '',
        fitnessScore: '',
        gender: '',
        isPlayingThisWeek: true,
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Error. Please double check your input values'
      )
    }
  }

  const handleChange = e => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value })
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50">
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded px-8 pt-4 pb-4 mt-4 lg:mt-5 mb-4 lg:mb-5 w-70 sm:w-96 h-[775px] lg:w-96 overflow-visible"
          data-testid="add-player-form"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Add Player
            </h2>
            {error && !playerAdded && (
              <p className="text-red-500 text-xs italic mt-4">{error}</p>
            )}
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              placeholder="name"
              value={playerData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="gameKnowledgeScore"
            >
              Game Knowledge Score
            </label>
            <input
              className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="gameKnowledgeScore"
              type="number"
              placeholder="1-10"
              name="gameKnowledgeScore"
              value={playerData.gameKnowledgeScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="goalScoringScore"
            >
              Goal Scoring Score
            </label>
            <input
              className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="goalScoringScore"
              type="number"
              placeholder="1-10"
              name="goalScoringScore"
              value={playerData.goalScoringScore}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="attackScore"
            >
              Attack Score
            </label>
            <input
              className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="attackScore"
              type="number"
              placeholder="1-10"
              name="attackScore"
              value={playerData.attackScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="midfieldScore"
            >
              Midfield Score
            </label>
            <input
              className="shadow appearance-none border rounded w-[100px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="midfieldScore"
              type="number"
              placeholder="1-10"
              name="midfieldScore"
              value={playerData.midfieldScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="defenseScore"
            >
              Defense Score
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 w-[100px] text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="defenseScore"
              type="number"
              placeholder="1-10"
              name="defenseScore"
              value={playerData.defenseScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="fitnessScore"
            >
              Mobility/Stamina
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 w-[100px] text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="fitnessScore"
              type="number"
              placeholder="1-10"
              name="fitnessScore"
              value={playerData.fitnessScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="gender"
              aria-labelledby="gender"
              data-testid="gender"
            >
              Gender
            </label>
            <Select
              name="gender"
              options={genderOptions}
              value={genderOptions.find(
                option => option.value === playerData.gender
              )}
              onChange={selectedOption =>
                setPlayerData({
                  ...playerData,
                  gender: selectedOption ? selectedOption.value : '',
                })
              }
              placeholder="Select Gender"
              isClearable
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              className="bg-white text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline border border-gray-700"
              type="submit"
              onClick={onClose}
            >
              cancel
            </button>
            <button
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Add Player
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
