import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import BalanceTeamsPage from '../../src/app/page'

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

  it('renders without crashing', () => {
    render(<BalanceTeamsPage />)
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  it('shows checking authentication message', () => {
    render(<BalanceTeamsPage />)
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  it('applies the correct styling classes', () => {
    const { container } = render(<BalanceTeamsPage />)
    const flexDiv = container.querySelector(
      'div.flex.items-center.justify-center.min-h-screen'
    )
    expect(flexDiv).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = render(<BalanceTeamsPage />)
    expect(container).toMatchSnapshot()
  })
})
