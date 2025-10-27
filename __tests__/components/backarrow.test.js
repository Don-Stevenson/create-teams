import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BackArrow } from '@/app/components/ui/BackArrow/BackArrow'

describe('BackArrow', () => {
  it('renders the BackArrow', () => {
    render(<BackArrow />)
    const backArrowImage = screen.getByAltText('Back arrow image')

    expect(backArrowImage).toBeInTheDocument()
  })
})
