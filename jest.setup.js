// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Configure the global test environment for React's concurrent mode
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Suppress console errors for specific React warnings during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: The current testing environment is not configured to support act\(...\)/.test(
        args[0]
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
