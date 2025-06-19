import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '../../src/app/login/page'
import LoginForm from '../../src/app/components/LoginForm'

jest.mock('../../src/app/components/LoginForm', () => {
  return jest.fn(() => (
    <div data-testid="mocked-login-form">Mocked Login Form</div>
  ))
})

describe('Login Page', () => {
  beforeEach(() => {
    LoginForm.mockClear()
  })

  it('renders the login page', () => {
    render(<Login />)
    expect(screen.getByTestId('mocked-login-form')).toBeInTheDocument()
  })

  it('renders the LoginForm component', () => {
    render(<Login />)
    expect(LoginForm).toHaveBeenCalled()
  })

  it('LoginForm is rendered exactly once', () => {
    render(<Login />)
    expect(LoginForm).toHaveBeenCalledTimes(1)
  })

  it('matches snapshot', () => {
    const { container } = render(<Login />)
    expect(container).toMatchSnapshot()
  })
})
