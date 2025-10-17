import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ScoreItem } from '../../src/app/components/ui/Card/ScoreItem'

describe('ScoreItem', () => {
  it('renders the label and value', () => {
    render(<ScoreItem label="Test Label" value="10" />)
    expect(screen.getByText(/Test Label/i)).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
