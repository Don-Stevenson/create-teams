import {
  render,
  screen,
  fireEvent,
  waitFor,
  createEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import LoginForm from '../../src/app/components/LoginForm'
import { login } from '../../utils/FEapi'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: props => <img {...props} />,
}))

jest.mock('../../utils/FEapi', () => ({
  login: jest.fn(),
}))

const mockError = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('LoginForm', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const originalConsoleError = console.error
  let mockError

  beforeEach(() => {
    jest.clearAllMocks()
    mockError = jest.fn()
    console.error = mockError

    useRouter.mockImplementation(() => ({
      push: mockPush,
      refresh: mockRefresh,
    }))
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders all form elements correctly', () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()

    expect(
      screen.getByAltText('Toronto Walking Soccer Loons Club Logo')
    ).toBeInTheDocument()

    expect(screen.getByText('Loons Team Balancer')).toBeInTheDocument()
  })

  it('updates input values on change', () => {
    render(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })

    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('testpass')
  })

  it('handles successful login correctly', async () => {
    login.mockResolvedValueOnce({ success: true })

    render(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('testuser', 'testpass')
      expect(mockPush).toHaveBeenCalledWith('/create-teams')
    })

    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()
  })

  it('handles failed login correctly', async () => {
    login.mockResolvedValueOnce({ success: false })

    render(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('clears error message when input is focused', async () => {
    login.mockResolvedValueOnce({ success: false })

    render(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    fireEvent.focus(usernameInput)

    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()

    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    fireEvent.focus(passwordInput)
    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()
  })

  it('prevents default form submission', () => {
    render(<LoginForm />)

    const form = screen.getByTestId('login-form')
    const submitEvent = createEvent.submit(form)

    fireEvent(form, submitEvent)

    expect(submitEvent.defaultPrevented).toBeTruthy()
  })

  it('handles network errors correctly', async () => {
    const networkError = new Error('Network error')
    login.mockRejectedValueOnce(networkError)

    render(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})
