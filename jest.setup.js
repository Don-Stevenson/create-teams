// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Configure the global test environment for React's concurrent mode
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Suppress only act() warnings during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Only suppress act() warnings
    if (
      typeof args[0] === 'string' &&
      args[0].includes(
        'Warning: The current testing environment is not configured to support act'
      )
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
