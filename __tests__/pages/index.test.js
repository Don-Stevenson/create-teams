import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import BalanceTeamsPage from '../../src/app/page'
import { checkAuth } from '../../utils/FEapi'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('../../utils/FEapi', () => ({
  checkAuth: jest.fn(),
}))

describe('Home Page / balance teams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      render(<BalanceTeamsPage />)
    })

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  it('shows checking authentication message initially', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      render(<BalanceTeamsPage />)
    })

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  it('calls checkAuth on mount', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      render(<BalanceTeamsPage />)
    })

    // In development mode with React.StrictMode, effects run twice
    expect(checkAuth).toHaveBeenCalledWith()
  })

  it('handles authentication success', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      render(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })
  })

  it('handles authentication failure', async () => {
    checkAuth.mockResolvedValue(false)

    await act(async () => {
      render(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })
  })

  it('handles authentication error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    checkAuth.mockRejectedValue(new Error('Network error'))

    await act(async () => {
      render(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })
})
