import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Players from '../../src/app/players/page'
import api from '../../utils/FEapi'
import PlayerList from '../../src/app/components/PlayerList'
import { renderWithQuery } from '../utils/test-utils'

// Mock the API axios instance
jest.mock('../../utils/FEapi', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  apiService: {
    players: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auth: {
      check: jest.fn(),
    },
  },
}))

jest.mock('../../src/app/components/withAuth', () => {
  return jest.fn(Component => {
    const WithAuthComponent = props => <Component {...props} />
    WithAuthComponent.displayName = `WithAuth(${
      Component.displayName || Component.name || 'Component'
    })`
    return WithAuthComponent
  })
})

jest.mock('../../src/app/components/Layout', () => {
  return jest.fn(({ children }) => (
    <div data-testid="mock-layout">{children}</div>
  ))
})

// Mock the React Query hooks to prevent warnings
jest.mock('../../src/app/hooks/useApi', () => ({
  usePlayers: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreatePlayer: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useUpdatePlayer: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useDeletePlayer: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}))

const mockPlayers = [
  {
    _id: '1',
    name: 'John Doe',
    attackScore: 6,
    defenseScore: 7,
    fitnessScore: 8,
    isPlayingThisWeek: true,
  },
  {
    _id: '2',
    name: 'Alice Smith',
    attackScore: 7,
    defenseScore: 8,
    fitnessScore: 9,
    isPlayingThisWeek: false,
  },
]

describe('Players Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    api.get.mockResolvedValue({ data: mockPlayers })
  })

  describe('Rendering', () => {
    it('renders the page with correct headings', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      expect(screen.getByText('Manage Players')).toBeInTheDocument()
      expect(screen.getByText('Add A New Player')).toBeInTheDocument()
      expect(screen.getByText('List of Players')).toBeInTheDocument()
    })

    it('fetches and displays players on mount', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/players')
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading message when initially loading', async () => {
      // Make the API call take some time
      api.get.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ data: mockPlayers }), 100)
          )
      )

      await act(async () => {
        renderWithQuery(<Players />)
      })

      expect(screen.getByText('Loading players')).toBeInTheDocument()
    })

    it('hides loading message after players are loaded', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })
    })

    it('handles loading state during data fetch', async () => {
      const delay = new Promise(resolve => setTimeout(resolve, 100))
      api.get.mockImplementationOnce(() =>
        delay.then(() => ({ data: mockPlayers }))
      )

      await act(async () => {
        renderWithQuery(<Players />)
      })

      expect(screen.getByText('Loading players')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('handles error during loading gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      api.get.mockRejectedValueOnce(new Error('Failed to fetch'))

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Add Player Functionality', () => {
    let user

    beforeEach(() => {
      user = userEvent.setup()
      jest.clearAllMocks()
    })

    it('toggles add player form visibility', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      const addButton = screen.getByText('Add A New Player')
      await act(async () => {
        await user.click(addButton)
      })

      expect(screen.getByTestId('add-player-form')).toBeInTheDocument()

      await act(async () => {
        await user.click(screen.getByText('cancel'))
      })

      expect(screen.queryByTestId('add-player-form')).not.toBeInTheDocument()
    })

    it('adds a new player successfully', async () => {
      const newPlayer = {
        _id: '3',
        name: 'New Player',
        gameKnowledgeScore: 2,
        goalScoringScore: 2,
        attackScore: 2,
        midfieldScore: 2,
        defenseScore: 2,
        fitnessScore: 2,
        gender: 'male',
        isPlayingThisWeek: true,
      }

      api.post.mockResolvedValueOnce({ data: newPlayer })

      await act(async () => {
        renderWithQuery(<Players />)
      })

      const addButton = screen.getAllByText('Add A New Player')[0]
      await act(async () => {
        await user.click(addButton)
      })

      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), newPlayer.name)
        await user.type(
          screen.getByLabelText(/game knowledge score/i),
          newPlayer.gameKnowledgeScore.toString()
        )
        await user.type(
          screen.getByLabelText(/goal scoring score/i),
          newPlayer.goalScoringScore.toString()
        )
        await user.type(
          screen.getByLabelText(/attack score/i),
          newPlayer.attackScore.toString()
        )
        await user.type(
          screen.getByLabelText(/midfield score/i),
          newPlayer.midfieldScore.toString()
        )
        await user.type(
          screen.getByLabelText(/defense score/i),
          newPlayer.defenseScore.toString()
        )
        await user.type(
          screen.getByLabelText(/mobility\/stamina/i),
          newPlayer.fitnessScore.toString()
        )
      })

      const form = screen.getByTestId('add-player-form')
      await act(async () => {
        fireEvent.submit(form)
      })

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/players',
          expect.objectContaining({
            name: newPlayer.name,
            gameKnowledgeScore: newPlayer.gameKnowledgeScore.toString(),
            goalScoringScore: newPlayer.goalScoringScore.toString(),
            attackScore: newPlayer.attackScore.toString(),
            midfieldScore: newPlayer.midfieldScore.toString(),
            defenseScore: newPlayer.defenseScore.toString(),
            fitnessScore: newPlayer.fitnessScore.toString(),
            isPlayingThisWeek: true,
          })
        )
      })
    })
  })

  describe('Edit Player Functionality', () => {
    it('opens edit modal when edit button is clicked', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        const editButton = screen.getAllByTestId('edit-player')[0]
        fireEvent.click(editButton)
      })

      expect(screen.getByTestId('edit-player-modal')).toBeInTheDocument()
    })

    describe('PlayerList', () => {
      it('calls onEditPlayer when edit button is clicked', async () => {
        const mockOnEditPlayer = jest.fn()
        await act(async () => {
          renderWithQuery(
            <PlayerList
              players={mockPlayers}
              onEditPlayer={mockOnEditPlayer}
              onDeletePlayer={() => {}}
              fetchPlayers={() => {}}
            />
          )
        })

        const editButton = screen.getAllByTestId('edit-player')[0]
        await act(async () => {
          fireEvent.click(editButton)
        })

        expect(mockOnEditPlayer).toHaveBeenCalledWith('2')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      api.get.mockRejectedValue(new Error('Failed to fetch'))

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/players')
      })

      consoleSpy.mockRestore()
    })

    it('handles update error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockPlayers = [
        {
          _id: '1',
          name: 'John Doe',
          attackScore: 2,
          defenseScore: 2,
          fitnessScore: 2,
          isPlayingThisWeek: true,
        },
      ]

      api.get.mockResolvedValue({ data: mockPlayers })
      const mockError = new Error('Update failed')
      api.put.mockRejectedValue(mockError)

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await screen.findByText('John Doe')
      const editButton = screen.getByTestId('edit-player')

      await act(async () => {
        fireEvent.click(editButton)
      })

      const modal = await screen.findByTestId('edit-player-modal')
      expect(modal).toBeInTheDocument()

      const nameInput = screen.getByLabelText('Name')
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } })
      })

      const saveChangesButton = screen.getByText(/Save Changes/i)
      await act(async () => {
        fireEvent.submit(saveChangesButton)
      })

      await waitFor(() => {
        expect(api.put).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })

  it('matches snapshot', async () => {
    await act(async () => {
      const { container } = renderWithQuery(<Players />)
      expect(container).toMatchSnapshot()
    })
  })
})
