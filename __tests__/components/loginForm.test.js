import {
  render,
  screen,
  fireEvent,
  waitFor,
  createEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/router'
import LoginForm from '../../src/app/components/LoginForm'

jest.mock('next/router', () => ({
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

jest.mock('../../config', () => 'http://test-api')

const mockError = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('LoginForm', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockError.mockReset()

    useRouter.mockImplementation(() => ({
      push: mockPush,
    }))

    global.fetch = jest.fn()
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
    render(<LoginForm />)

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api/api/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass',
          }),
          credentials: 'include',
        })
      )

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()
  })

  it('handles failed login correctly', async () => {
    render(<LoginForm />)

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Login failed' }),
      })
    )

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
    render(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')

    await waitFor(() => {
      fireEvent.submit(screen.getByRole('button', { name: /login/i }))
    })

    expect(
      screen.getByText("There's been an error. Please try again")
    ).toBeInTheDocument()

    fireEvent.focus(usernameInput)

    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()

    fireEvent.submit(screen.getByRole('button', { name: /login/i }))
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
    render(<LoginForm />)

    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      fireEvent.click(submitButton)
    })

    expect(
      await screen.getByText(/There's been an error. Please try again/i)
    ).toBeInTheDocument()

    expect(mockError).toHaveBeenCalled()
  })
})
