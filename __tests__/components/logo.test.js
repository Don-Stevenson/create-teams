import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Logo } from '../../src/app/components/ui/Logo/Logo'

describe('Logo', () => {
  it('renders the Logo', () => {
    render(<Logo classes="bg-red" />)
    const logoImage = screen.getByAltText(
      'Toronto Walking Soccer Loons Club Logo'
    )

    expect(logoImage).toBeInTheDocument()
  })

  it('applies custom classes to the container', () => {
    const { container } = render(<Logo classes="bg-red custom-class" />)
    const logoContainer = container.firstChild
    expect(logoContainer).toHaveClass('bg-red')
    expect(logoContainer).toHaveClass('custom-class')
  })
})
