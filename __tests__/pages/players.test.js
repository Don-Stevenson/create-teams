import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Players from '../../pages/players'
import api from '../../utils/api'
import PlayerList from '../../src/app/components/PlayerList'

jest.mock('../../utils/api')
jest.mock('../../src/app/components/withAuth', () => {
  return jest.fn(Component => {
    const WithAuthComponent = props => <Component {...props} />
    WithAuthComponent.displayName = `withAuth(${Component.name})`
    return WithAuthComponent
  })
})
jest.mock('../../src/app/components/Layout', () => {
  return jest.fn(({ children }) => (
    <div data-testid="mock-layout">{children}</div>
  ))
})

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
        render(<Players />)
      })

      expect(screen.getByText('Manage Players')).toBeInTheDocument()
      expect(screen.getByText('Add A New Player')).toBeInTheDocument()
      expect(screen.getByText('List of Players')).toBeInTheDocument()
    })

    it('fetches and displays players on mount', async () => {
      await act(async () => {
        render(<Players />)
      })

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/players')
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })
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
        render(<Players />)
      })
      const addButton = screen.getByText('Add A New Player')
      await user.click(addButton)
      expect(screen.getByTestId('add-player-form')).toBeInTheDocument()
      await user.click(screen.getByText('cancel'))
      expect(screen.queryByTestId('add-player-form')).not.toBeInTheDocument()
    })

    it('adds a new player successfully', async () => {
      const newPlayer = {
        _id: '3',
        name: 'New Player',
        gameKnowledgeScore: '2',
        goalScoringScore: '2',
        attackScore: '2',
        midfieldScore: '2',
        defenseScore: '2',
        fitnessScore: '2',
        gender: 'male',
        isPlayingThisWeek: true,
      }

      api.post.mockResolvedValueOnce({ data: newPlayer })

      await act(async () => {
        render(<Players />)
      })

      const addButton = screen.getByText('Add A New Player')
      await act(async () => {
        await user.click(addButton)
      })

      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), newPlayer.name)
        await user.type(
          screen.getByLabelText(/game knowledge score/i),
          newPlayer.gameKnowledgeScore
        )
        await user.type(
          screen.getByLabelText(/goal scoring score/i),
          newPlayer.goalScoringScore
        )
        await user.type(
          screen.getByLabelText(/attack score/i),
          newPlayer.attackScore
        )
        await user.type(
          screen.getByLabelText(/midfield score/i),
          newPlayer.midfieldScore
        )
        await user.type(
          screen.getByLabelText(/defense score/i),
          newPlayer.defenseScore
        )
        await user.type(
          screen.getByLabelText(/Mobility\/Stamina/i),
          newPlayer.fitnessScore
        )
        screen.getByTestId('gender')
      })

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /add player/i }))
      })

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/players',
          expect.objectContaining({
            name: newPlayer.name,
            goalScoringScore: newPlayer.goalScoringScore,
            gameKnowledgeScore: newPlayer.gameKnowledgeScore,
            attackScore: newPlayer.attackScore,
            midfieldScore: newPlayer.midfieldScore,
            defenseScore: newPlayer.defenseScore,
            fitnessScore: newPlayer.fitnessScore,
            isPlayingThisWeek: newPlayer.isPlayingThisWeek,
          })
        )
      })
    })

    describe('Edit Player Functionality', () => {
      it('opens edit modal when edit button is clicked', async () => {
        await act(async () => {
          render(<Players />)
        })

        await waitFor(() => {
          const editButton = screen.getAllByTestId('edit-player')[0]
          fireEvent.click(editButton)
        })
        expect(screen.getByTestId('edit-player-modal')).toBeInTheDocument()
      })

      describe('PlayerList', () => {
        it('calls onEditPlayer when edit button is clicked', () => {
          const mockOnEditPlayer = jest.fn()
          render(
            <PlayerList
              players={mockPlayers}
              onEditPlayer={mockOnEditPlayer}
              onDeletePlayer={() => {}}
              fetchPlayers={() => {}}
            />
          )

          const editButton = screen.getAllByTestId('edit-player')[0]
          fireEvent.click(editButton)

          expect(mockOnEditPlayer).toHaveBeenCalledWith('1')
        })
      })
    })

    describe('Delete Player Functionality', () => {
      it('shows delete confirmation modal', async () => {
        await act(async () => {
          render(<Players />)
        })

        await waitFor(() => {
          const deleteButton = screen.getAllByTestId('delete-player')[1]
          fireEvent.click(deleteButton)
        })
        expect(
          screen.getByText(/Are you sure you want to delete John Doe?/i)
        ).toBeInTheDocument()
      })

      it('deletes player when confirmed', async () => {
        api.delete.mockResolvedValue({})

        await act(async () => {
          render(<Players />)
        })

        await waitFor(async () => {
          const deleteButton = screen.getAllByTestId('delete-player')[1]
          fireEvent.click(deleteButton)

          const confirmDelete = screen.getAllByText('Delete')[2]
          fireEvent.click(confirmDelete)
        })
        expect(api.delete).toHaveBeenCalledWith('/players/1')
      })

      it('cancels deletion when cancel is clicked', async () => {
        await act(async () => {
          render(<Players />)
        })

        await waitFor(() => {
          const deleteButton = screen.getAllByTestId('delete-player')[0]
          fireEvent.click(deleteButton)

          const cancelButton = screen.getByText('Cancel')
          fireEvent.click(cancelButton)
        })

        expect(
          screen.queryByText(/Are you sure you want to delete/)
        ).not.toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    describe('Error Handling', () => {
      it('handles fetch error gracefully', async () => {
        const consoleSpy = jest
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        api.get.mockRejectedValue(new Error('Failed to fetch'))

        await act(async () => {
          render(<Players />)
        })

        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to fetch players:',
            expect.any(Error)
          )
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

        render(<Players />)

        await screen.findByText('John Doe')
        const editButton = screen.getByTestId('edit-player')
        fireEvent.click(editButton)

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

        expect(console.error).toHaveBeenCalledWith(
          'Failed to update player:',
          mockError
        )

        expect(modal).toBeInTheDocument()
        expect(nameInput.value).toBe('John Doe Updated')

        consoleSpy.mockRestore()
      })
    })

    it('matches snapshot', () => {
      const { container } = render(<Players />)
      expect(container).toMatchSnapshot()
    })
  })
})
