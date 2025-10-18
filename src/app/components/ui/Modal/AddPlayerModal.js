import { useState } from 'react'
import Select from 'react-select'
import { Button } from '../Button/Button'

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
      <div className="flex items-center justify-center pt-5 pb-8 md:pt-4 md:pb-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded px-8 pt-4 pb-4 mt-4 lg:mt-5 lg:mb-5 w-70 sm:w-96 h-[36.5rem] md:h-[43rem] lg:w-96 overflow-visible gap-2"
          data-testid="add-player-form"
        >
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <h2 className="text-2xl font-semibold text-black mb-2 sm:mb-4">
              Add Player
            </h2>
            {error && !playerAdded && (
              <p className="text-red-500 text-xs italic mt-4">{error}</p>
            )}
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[180px] py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              placeholder="name"
              value={playerData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="gameKnowledgeScore"
            >
              Game Knowledge Score
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[60px] py-1 px-1 md:w-[100px] md:p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="gameKnowledgeScore"
              type="number"
              placeholder="1-10"
              name="gameKnowledgeScore"
              value={playerData.gameKnowledgeScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="goalScoringScore"
            >
              Goal Scoring Score
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[60px] py-1 px-1 md:w-[100px] md:p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="goalScoringScore"
              type="number"
              placeholder="1-10"
              name="goalScoringScore"
              value={playerData.goalScoringScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="attackScore"
            >
              Attack Score
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[60px] py-1 px-1 md:w-[100px] md:p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="attackScore"
              type="number"
              placeholder="1-10"
              name="attackScore"
              value={playerData.attackScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="midfieldScore"
            >
              Midfield Score
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[60px] py-1 px-1 md:w-[100px] md:p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="midfieldScore"
              type="number"
              placeholder="1-10"
              name="midfieldScore"
              value={playerData.midfieldScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="defenseScore"
            >
              Defense Score
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[60px] py-1 px-1 md:w-[100px] md:p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="defenseScore"
              type="number"
              placeholder="1-10"
              name="defenseScore"
              value={playerData.defenseScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              htmlFor="fitnessScore"
            >
              Mobility/Stamina
            </label>
            <input
              className="shadow appearance-none border text-xs sm:text-sm rounded w-[60px] py-1 px-1 md:w-[100px] md:p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="fitnessScore"
              type="number"
              placeholder="1-10"
              name="fitnessScore"
              value={playerData.fitnessScore}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-col gap-2 mb-2 md:gap-3 md:mb-3">
            <label
              className="block text-gray-700 text-xxs md:text-sm font-bold"
              id="gender-label"
            >
              Gender
            </label>
            <Select
              name="gender"
              aria-labelledby="gender-label"
              options={genderOptions}
              className="text-xs sm:text-sm"
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
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 md:mt-8">
            <Button
              type="submit"
              onClick={onClose}
              text="Cancel"
              variant="secondary"
              testId="cancel-button"
              classes="text-sm bg-white"
            />
            <Button
              type="submit"
              text="Add Player"
              variant="primary"
              testId="add-player-button"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
