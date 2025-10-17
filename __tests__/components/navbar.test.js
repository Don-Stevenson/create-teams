import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NavBar from '../../src/app/components/ui/Navbar/NavBar'

describe('NavBar', () => {
  it('renders the NavBar component', () => {
    render(<NavBar />)
    expect(
      screen.getByAltText('Toronto Walking Soccer Loons Club Logo')
    ).toBeInTheDocument()
    expect(screen.getAllByText('Create Teams')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Manage Players')[0]).toBeInTheDocument()
    expect(screen.getAllByText('About')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Logout')[0]).toBeInTheDocument()
  })
  it('renders the MobileMenuButton component', () => {
    render(<NavBar />)
    expect(
      screen.getByRole('button', { name: 'Mobile navigation menu button' })
    ).toBeInTheDocument()
  })
  it('renders the MobileNavigatonMenu component', () => {
    render(<NavBar />)
    expect(
      screen.getByRole('navigation', { name: 'Mobile navigation menu' })
    ).toBeInTheDocument()
  })
})
