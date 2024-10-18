import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Layout from '../../src/app/components/Layout'
import BalanceTeamsPage from '../../pages/index'

jest.mock('../../src/app/components/Layout', () => {
  return jest.fn(({ children }) => (
    <div data-testid="mock-layout">{children}</div>
  ))
})

jest.mock('../../src/app/components/CreateTeams', () => {
  return jest.fn(() => (
    <div data-testid="mock-create-teams">CreateTeams Component</div>
  ))
})

jest.mock('../../src/app/components/withAuth', () => {
  return jest.fn(Component => {
    const WithAuthComponent = props => <Component {...props} />
    WithAuthComponent.displayName = `withAuth(${Component.name})`
    return WithAuthComponent
  })
})

describe('Home Page / balance teams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<BalanceTeamsPage />)
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument()
  })

  it('renders the correct heading', () => {
    render(<BalanceTeamsPage />)
    expect(
      screen.getByRole('heading', { name: /create teams/i })
    ).toBeInTheDocument()
  })

  it('includes the CreateTeams component', () => {
    render(<BalanceTeamsPage />)
    expect(screen.getByTestId('mock-create-teams')).toBeInTheDocument()
  })

  it('uses the Layout component', () => {
    render(<BalanceTeamsPage />)
    expect(Layout).toHaveBeenCalled()
  })

  it('applies the correct styling classes', () => {
    render(<BalanceTeamsPage />)
    const containerDiv = screen.getByText(/create teams/i).closest('div')
    expect(containerDiv).toHaveClass('flex-col', 'mx-auto', 'px-4', 'py-8')
  })

  describe('Heading styles', () => {
    it('has the correct styling classes', () => {
      render(<BalanceTeamsPage />)
      const heading = screen.getByRole('heading', { name: /create teams/i })
      expect(heading).toHaveClass(
        'text-3xl',
        'font-bold',
        'mb-8',
        'text-loonsRed',
        'print:hidden'
      )
    })
  })
})
