import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MobileMenuButton } from '../../src/app/components/ui/Navbar/MobileMenuButton'

describe('MobileMenuButton', () => {
  let mockSetIsMobileMenuOpen

  beforeEach(() => {
    mockSetIsMobileMenuOpen = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the MobileMenuButton component with required props', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      expect(
        screen.getByRole('button', { name: 'Mobile navigation menu button' })
      ).toBeInTheDocument()
    })

    it('has responsive classes to hide on desktop screens', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })

      expect(button).toHaveClass('md:hidden')
    })

    it('renders three hamburger menu lines', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })
      const spans = button.querySelectorAll('span')

      expect(spans).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('has correct aria-label', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })

      expect(button).toHaveAttribute(
        'aria-label',
        'Mobile navigation menu button'
      )
    })

    it('sets aria-expanded to false when menu is closed', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })

      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('sets aria-expanded to true when menu is open', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={true}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })

      expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Interaction', () => {
    it('calls setIsMobileMenuOpen with opposite value when clicked and menu is closed', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })

      fireEvent.click(button)

      expect(mockSetIsMobileMenuOpen).toHaveBeenCalledTimes(1)
      expect(mockSetIsMobileMenuOpen).toHaveBeenCalledWith(true)
    })

    it('calls setIsMobileMenuOpen with opposite value when clicked and menu is open', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={true}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })

      fireEvent.click(button)

      expect(mockSetIsMobileMenuOpen).toHaveBeenCalledTimes(1)
      expect(mockSetIsMobileMenuOpen).toHaveBeenCalledWith(false)
    })
  })

  describe('Visual States', () => {
    it('applies closed state classes when menu is closed', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })
      const spans = button.querySelectorAll('span')

      // First line - no rotation when closed
      expect(spans[0]).not.toHaveClass('rotate-45')
      expect(spans[0]).not.toHaveClass('translate-y-2')

      // Middle line - visible when closed
      expect(spans[1]).not.toHaveClass('opacity-0')

      // Bottom line - no rotation when closed
      expect(spans[2]).not.toHaveClass('-rotate-45')
      expect(spans[2]).not.toHaveClass('-translate-y-2')
    })

    it('applies open state classes when menu is open', () => {
      render(
        <MobileMenuButton
          isMobileMenuOpen={true}
          setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
        />
      )
      const button = screen.getByRole('button', {
        name: 'Mobile navigation menu button',
      })
      const spans = button.querySelectorAll('span')

      // First line - rotated to form X
      expect(spans[0]).toHaveClass('rotate-45')
      expect(spans[0]).toHaveClass('translate-y-2')

      // Middle line - hidden when open
      expect(spans[1]).toHaveClass('opacity-0')

      // Bottom line - rotated to form X
      expect(spans[2]).toHaveClass('-rotate-45')
      expect(spans[2]).toHaveClass('-translate-y-2')
    })
  })
})
