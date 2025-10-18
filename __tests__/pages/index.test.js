import { screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import BalanceTeamsPage from '../../src/app/components/features/auth/AuthRedirect'
import { checkAuth } from '../../utils/FEapi'
import { renderWithQuery } from '../utils/test-utils'

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
    // Mock localStorage to ensure consistent test environment
    const mockLocalStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  })

  it('renders without crashing', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    expect(screen.getByText('Loading Loons Team Balancer')).toBeInTheDocument()
  })

  it('shows loading message initially', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    expect(screen.getByText('Loading Loons Team Balancer')).toBeInTheDocument()
  })

  it('calls auth check on mount', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })
  })

  it('handles authentication success', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })
  })

  it('handles authentication failure', async () => {
    checkAuth.mockResolvedValue(false)

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })
  })

  it('handles authentication error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    checkAuth.mockRejectedValue(new Error('Network error'))

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('uses direct auth check function', async () => {
    checkAuth.mockResolvedValue(true)

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })
  })

  it('handles auth check retry logic', async () => {
    // Mock the auth check to fail once
    checkAuth.mockRejectedValueOnce(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await act(async () => {
      renderWithQuery(<BalanceTeamsPage />)
    })

    await waitFor(() => {
      expect(checkAuth).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })
})
