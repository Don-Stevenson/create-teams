import React, { useState, useRef, useEffect } from 'react'
import ChevronDownIcon from '../../Chevron/ChevronDownIcon'

const UpcomingGamesDropDown = ({
  upcomingGames,
  onSelect,
  gamesError,
  gamesErrorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const dropdownRef = useRef(null)

  const handleTriggerClick = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = option => {
    setSelectedValue(option.label)
    setIsOpen(false)
    onSelect(option.value)
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="border-[1px] border-black rounded-md px-3 py-1 z-50"
      ref={dropdownRef}
    >
      <button
        onClick={handleTriggerClick}
        className="font-bold text-lg text-black flex items-center justify-between w-full"
      >
        {selectedValue || 'Select an upcoming game'}
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <ul className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border border-black rounded-md shadow-lg w-[80%] md:w-[60%] lg:w-[40%] z-50">
          {gamesError ? (
            <li className="px-4 py-3 text-red-600 bg-red-50 rounded-md">
              <div className="font-semibold mb-1">
                ⚠️ Heja Service Unavailable
              </div>
              <div className="text-sm">
                {gamesErrorMessage ||
                  'Heja is currently unavailable. Please try again later.'}
              </div>
            </li>
          ) : upcomingGames.length === 0 ? (
            <li className="px-4 py-3 text-gray-600">
              No upcoming games available
            </li>
          ) : (
            upcomingGames.map(game => (
              <li
                className="border-2 border-white hover:border-2 hover:bg-[#cedaf0] rounded-md px-2 list-disc list-inside cursor-pointer"
                key={game.value}
                onClick={() => handleOptionClick(game)}
              >
                {game.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default UpcomingGamesDropDown
