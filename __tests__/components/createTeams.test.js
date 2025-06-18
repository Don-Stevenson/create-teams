import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import CreateTeams from '../../src/app/components/CreateTeams'
import api from '../../utils/api'

jest.mock('../../utils/api')

const mockPlayers = [
  {
    _id: '1',
    name: 'John Doe',
    isPlayingThisWeek: true,
    goalScoringScore: 5,
    gameKnowledgeScore: 4,
    attackScore: 8,
    midfieldSccore: 7,
    defenseScore: 7,
    fitnessScore: 9,
    gender: 'male',
  },
  {
    _id: '2',
    name: 'Jane Smith',
    isPlayingThisWeek: false,
    goalScoringScore: 5,
    gameKnowledgeScore: 4,
    midfieldSccore: 7,
    attackScore: 7,
    defenseScore: 8,
    fitnessScore: 8,
    gender: 'female',
  },
]

const mockBalancedTeams = {
  totalPlayersPlaying: 2,
  teams: [
    {
      players: [mockPlayers[0]],
      totalScore: 24,
      totalGoalScoringScore: 7,
      totalGameKnowledgeScore: 6,
      totalMidfieldScore: 6,
      totalAttackScore: 8,
      totalDefenseScore: 7,
      fitnessScore: 9,
      genderCount: { male: 1, female: 0, nonBinary: 0 },
    },
    {
      players: [mockPlayers[1]],
      totalScore: 23,
      totalGoalScoringScore: 7,
      totalGameKnowledgeScore: 6,
      totalMidfieldScore: 6,
      totalAttackScore: 7,
      totalDefenseScore: 8,
      fitnessScore: 8,
      genderCount: { male: 0, female: 1, nonBinary: 0 },
    },
  ],
}

const setup = async () => {
  const user = userEvent.setup()
  const utils = render(<CreateTeams />)
  await waitFor(() => {
    expect(api.get).toHaveBeenCalledWith('/players')
  })
  return {
    user,
    ...utils,
  }
}

describe('CreateTeams', () => {
  let originalConsoleError

  beforeEach(() => {
    jest.clearAllMocks()
    api.get.mockResolvedValue({ data: mockPlayers })
    api.post.mockResolvedValue({ data: mockBalancedTeams })
    originalConsoleError = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  describe('Loading States', () => {
    it('shows loading message when initially loading', async () => {
      await act(async () => {
        render(<CreateTeams />)
      })

      expect(screen.getByText('Loading players...')).toBeInTheDocument()
    })

    it('hides loading message after players are loaded', async () => {
      await act(async () => {
        render(<CreateTeams />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument()
      })
    })

    it('shows loading state during team creation', async () => {
      const { user } = await setup()

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create balanced teams/i })
        ).not.toBeDisabled()
      })

      const createTeamsButton = screen.getByRole('button', {
        name: /create balanced teams/i,
      })
      await user.click(createTeamsButton)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create balanced teams/i })
        ).not.toBeDisabled()
      })
    })

    it('handles error during initial load gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('Failed to fetch'))

      await act(async () => {
        render(<CreateTeams />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument()
        expect(screen.getAllByText('Failed to fetch players')).toHaveLength(2)
      })
    })
  })

  test('renders component and fetches players', async () => {
    await setup()

    expect(screen.getByText('Player List')).toBeInTheDocument()
    expect(screen.getByText(/Total Players Selected:/)).toBeInTheDocument()
  })

  test('handles player toggle correctly', async () => {
    const { user } = await setup()

    const checkbox = screen.getByRole('checkbox', {
      name: /Toggle All Players/i,
    })
    await user.click(checkbox)

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/players-bulk-update', {
        isPlayingThisWeek: 'true',
      })
    })
  })

  test('creates balanced teams', async () => {
    const { user } = await setup()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create balanced teams/i })
      ).not.toBeDisabled()
    })

    const createTeamsButton = screen.getByRole('button', {
      name: /create balanced teams/i,
    })
    await user.click(createTeamsButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/balance-teams', { numTeams: 2 })
    })

    await waitFor(() => {
      const teamElements = screen.getAllByText(/Team/i)
      expect(teamElements).toHaveLength(2)
    })
  })

  test('handles error states correctly', async () => {
    api.get.mockRejectedValueOnce(new Error('Failed to fetch'))
    render(<CreateTeams />)

    await waitFor(() => {
      expect(screen.getAllByText('Failed to fetch players')).toHaveLength(2)
    })
  })

  test('updates number of teams input', async () => {
    const { user } = await setup()

    const numTeamsInput = screen.getByLabelText('Number of Teams')
    await user.clear(numTeamsInput)
    await user.type(numTeamsInput, '4')

    expect(numTeamsInput).toHaveValue(4)
  })

  test('displays team statistics correctly', async () => {
    const { user } = await setup()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create balanced teams/i })
      ).not.toBeDisabled()
    })

    const createTeamsButton = screen.getByRole('button', {
      name: /create balanced teams/i,
    })
    await user.click(createTeamsButton)

    await waitFor(() => {
      expect(
        screen.getByText(/Total Number of People Playing: 2/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/Team Score: 24/i)).toBeInTheDocument()
      expect(screen.getByText(/Team Score: 23/i)).toBeInTheDocument()
    })
  })

  test('handles API errors during team creation', async () => {
    const { user } = await setup()

    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Failed to create teams' } },
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create balanced teams/i })
      ).not.toBeDisabled()
    })

    const createTeamsButton = screen.getByRole('button', {
      name: /create balanced teams/i,
    })
    await user.click(createTeamsButton)

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Failed to create teams')
      expect(errorMessages).toHaveLength(2)
    })
  })

  test('updates selected player count correctly', async () => {
    await setup()

    const countText = screen.getByText(/Total Players Selected:/i)
    expect(countText).toBeInTheDocument()
    expect(countText).toHaveTextContent('Total Players Selected: 0')
  })

  test('validates number of teams input constraints', async () => {
    await setup()

    const numTeamsInput = screen.getByLabelText('Number of Teams')
    expect(numTeamsInput).toHaveAttribute('min', '2')
    expect(numTeamsInput).toHaveAttribute('max', '10')
  })

  test('handles failed player update gracefully', async () => {
    const { user } = await setup()

    api.put.mockRejectedValueOnce(new Error('Update failed'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create balanced teams/i })
      ).not.toBeDisabled()
    })

    const playerCheckbox = screen.getAllByRole('checkbox')[1]
    await user.click(playerCheckbox)

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'Failed to update player status'
      )
      expect(errorMessages).toHaveLength(2)
    })
  })

  test('handles bulk update failure gracefully', async () => {
    const { user } = await setup()

    api.put.mockRejectedValueOnce(new Error('Bulk update failed'))

    const toggleAllCheckbox = screen.getByRole('checkbox', {
      name: /Toggle All Players/i,
    })
    await user.click(toggleAllCheckbox)

    await waitFor(() => {
      expect(screen.getAllByText('Failed to update all players')).toHaveLength(
        2
      )
    })
  })

  test('toggles player list visibility', async () => {
    const { user } = await setup()

    const toggleButton = screen.getByRole('button', {
      name: /Hide Player List/i,
    })
    expect(toggleButton).toBeInTheDocument()

    await user.click(toggleButton)
    expect(
      screen.getByRole('button', { name: /Show Player List/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Show Player List/i }))
    expect(
      screen.getByRole('button', { name: /Hide Player List/i })
    ).toBeInTheDocument()
  })

  test('shows loading message with minimum duration', async () => {
    jest.useFakeTimers()
    await act(async () => {
      render(<CreateTeams />)
    })

    expect(screen.getByText('Loading players...')).toBeInTheDocument()

    await act(async () => {
      jest.advanceTimersByTime(400)
    })

    await waitFor(() => {
      expect(screen.queryByText('Loading players...')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  test('shows loading message during team creation', async () => {
    const { user } = await setup()

    const createTeamsButton = screen.getByRole('button', {
      name: /create balanced teams/i,
    })

    await user.click(createTeamsButton)

    expect(screen.getByText('Loading players...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Loading players...')).not.toBeInTheDocument()
    })
  })

  test('updates selected player count when toggling individual players', async () => {
    const { user } = await setup()

    await waitFor(() => {
      expect(screen.queryByText('Loading players...')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Total Players Selected: 1/i)).toBeInTheDocument()

    api.put.mockResolvedValueOnce({
      data: { ...mockPlayers[0], isPlayingThisWeek: false },
    })

    const playerCheckbox = screen.getByRole('checkbox', { checked: true })
    await user.click(playerCheckbox)

    await waitFor(() => {
      expect(screen.getByText(/Total Players Selected: 0/i)).toBeInTheDocument()
    })

    api.put.mockResolvedValueOnce({
      data: { ...mockPlayers[0], isPlayingThisWeek: true },
    })

    await user.click(playerCheckbox)

    await waitFor(() => {
      expect(screen.getByText(/Total Players Selected: 1/i)).toBeInTheDocument()
    })
  })
})
