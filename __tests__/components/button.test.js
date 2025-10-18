import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../../src/app/components/ui/Button/Button'

describe('Button', () => {
  it('renders the button with the correct text', () => {
    render(<Button text="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders the button with the correct loading message', () => {
    render(<Button text="Test" isLoading={true} loadingMessage="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders the button with the correct className', () => {
    render(<Button text="Test" classes="test-class" />)
    expect(screen.getByTestId('button-container')).toHaveClass('test-class')
  })

  it('renders the button with the correct variant', () => {
    render(<Button text="Test" variant="primary" />)
    expect(screen.getByTestId('button-container')).toHaveClass(
      'bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'
    )
  })

  it('renders the button with the correct onClick', () => {
    const onClick = jest.fn()
    render(<Button text="Test" onClick={onClick} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onClick).toHaveBeenCalled()
  })
})
