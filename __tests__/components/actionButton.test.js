import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ActionButton } from '../../src/app/components/ui/Button/ActionButton'

describe('Action Button', () => {
  it('renders the button with the correct text', () => {
    render(<ActionButton>Test</ActionButton>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
  it('renders the button with the correct variant', () => {
    render(
      <ActionButton variant="delete" testId="action-button">
        Test
      </ActionButton>
    )
    expect(screen.getByTestId('action-button')).toHaveClass(
      'bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'
    )
  })
  it('renders the button with the correct variant', () => {
    render(
      <ActionButton variant="edit" testId="action-button">
        Test
      </ActionButton>
    )
    expect(screen.getByTestId('action-button')).toHaveClass(
      'bg-white hover:bg-gray-200 text-black border border-gray-300'
    )
  })
  it('renders the button with the correct onClick', () => {
    const onClick = jest.fn()
    render(
      <ActionButton onClick={onClick} testId="action-button">
        Test
      </ActionButton>
    )
    fireEvent.click(screen.getByTestId('action-button'))
    expect(onClick).toHaveBeenCalled()
  })
})
