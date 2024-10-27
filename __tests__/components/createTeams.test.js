import { render, screen, waitFor } from '@testing-library/react'
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
  beforeEach(() => {
    jest.clearAllMocks()
    api.get.mockResolvedValue({ data: mockPlayers })
    api.post.mockResolvedValue({ data: mockBalancedTeams })
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

    const createTeamsButton = screen.getByText('Create Balanced Teams')
    await user.click(createTeamsButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/balance-teams', { numTeams: 2 })
    })

    expect(screen.getByText('Red Team 1')).toBeInTheDocument()
    expect(screen.getByText('Black Team 1')).toBeInTheDocument()
  })

  test('handles error states correctly', async () => {
    api.get.mockRejectedValueOnce(new Error('Failed to fetch'))
    render(<CreateTeams />)

    await waitFor(() => {
      expect(
        screen.getAllByText(/Failed to fetch players/i)[0]
      ).toBeInTheDocument()
      expect(
        screen.getAllByText(/Failed to fetch players/i)[1]
      ).toBeInTheDocument()
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

    const createTeamsButton = screen.getByText('Create Balanced Teams')
    await user.click(createTeamsButton)

    await waitFor(() => {
      expect(
        screen.getByText(/Total Number of People Playing: 2/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/Team Score: 24/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Midfield:/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Mobility\/Stamina:/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Attack:/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Defense:/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Game Knowledge:/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Goal Scoring:/i)[0]).toBeInTheDocument()
      expect(screen.getByText(/Team Score: 23.0/i)).toBeInTheDocument()
    })
  })

  test('handles API errors during team creation', async () => {
    const { user } = await setup()

    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Failed to create teams' } },
    })

    const createTeamsButton = screen.getByText('Create Balanced Teams')
    await user.click(createTeamsButton)

    await waitFor(() => {
      expect(
        screen.getAllByText('Failed to create teams')[0]
      ).toBeInTheDocument()
      expect(
        screen.getAllByText('Failed to create teams')[1]
      ).toBeInTheDocument()
    })
  })

  test('updates selected player count correctly', async () => {
    await setup()

    const countText = screen.getByText(/Total Players Selected:/i)
    expect(countText).toBeInTheDocument()
    expect(countText).toHaveTextContent('1')
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

    const playerCheckbox = screen.getAllByRole('checkbox')[1]
    await user.click(playerCheckbox)

    await waitFor(() => {
      expect(
        screen.getAllByText(/Failed to update player status/i)[0]
      ).toBeInTheDocument()

      expect(
        screen.getAllByText(/Failed to update player status/i)[1]
      ).toBeInTheDocument()
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
      expect(
        screen.getAllByText('Failed to update all players')[0]
      ).toBeInTheDocument()
      expect(
        screen.getAllByText('Failed to update all players')[1]
      ).toBeInTheDocument()
    })
  })
})
