import React, { useState, useRef, useEffect } from 'react'

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
    <div className="dropdown" ref={dropdownRef}>
      <button onClick={handleTriggerClick}>
        {selectedValue || 'Select an upcoming game'}
      </button>
      {isOpen && (
        <ul>
          {upcomingGames.map(game => (
            <li key={game.value} onClick={() => handleOptionClick(game)}>
              {game.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UpcomingGamesDropDown
