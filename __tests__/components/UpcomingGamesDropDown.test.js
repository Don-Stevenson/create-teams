import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UpcomingGamesDropDown from '../../src/app/components/UpcomingGamesDropDown'

describe('UpcomingGamesDropDown', () => {
  const mockUpcomingGames = [
    { value: 'game1', label: 'Game 1' },
    { value: 'game2', label: 'Game 2' },
  ]
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dropdown with default text', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )
    expect(screen.getByText('Select an upcoming game')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    expect(screen.getByText('Game 1')).toBeInTheDocument()
    expect(screen.getByText('Game 2')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    // Open dropdown
    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    // Click outside
    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('Game 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Game 2')).not.toBeInTheDocument()
  })

  it('selects a game and calls onSelect with correct value', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    // Open dropdown
    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    // Select a game
    const gameOption = screen.getByText('Game 1')
    fireEvent.click(gameOption)

    // Check if onSelect was called with correct value
    expect(mockOnSelect).toHaveBeenCalledWith('game1')

    // Check if dropdown is closed and selected value is displayed
    expect(screen.getByText('Game 1')).toBeInTheDocument()
    expect(screen.queryByText('Game 2')).not.toBeInTheDocument()
  })

  it('maintains selected value after reopening dropdown', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    // Open dropdown and select a game
    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Game 1'))

    // Reopen dropdown
    fireEvent.click(screen.getByText('Game 1'))

    // There should be two elements with 'Game 1': the button and the option
    const game1Elements = screen.getAllByText('Game 1')
    expect(game1Elements.length).toBe(2)
    expect(screen.getByText('Game 2')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    const container = screen.getByText('Select an upcoming game').closest('div')
    expect(container).toHaveClass(
      'border-[1px]',
      'border-loonsRed',
      'rounded-md',
      'px-3',
      'py-1'
    )
  })
})
