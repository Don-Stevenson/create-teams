// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Configure the global test environment for React's concurrent mode
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Next.js app directory components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

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
