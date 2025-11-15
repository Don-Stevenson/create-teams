import React, { useState, useRef, useEffect } from 'react'
import ChevronDownIcon from '../../Chevron/ChevronDownIcon'

const UpcomingGamesDropDown = ({ upcomingGames, onSelect }) => {
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
          {upcomingGames.map(game => (
            <li
              className="border-2 border-white hover:border-2 hover:bg-[#cedaf0] rounded-md px-2 list-disc list-inside cursor-pointer"
              key={game.value}
              onClick={() => handleOptionClick(game)}
            >
              {game.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UpcomingGamesDropDown
