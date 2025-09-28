// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Set NODE_ENV to test to enable React's development mode
process.env.NODE_ENV = 'test'

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

// Suppress React Query and act() warnings during tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    // Suppress act() warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes(
        'Warning: The current testing environment is not configured to support act'
      ) ||
        args[0].includes('act(...)'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    // Suppress React Query warnings that are expected during tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Query data cannot be undefined') ||
        args[0].includes('No QueryClient set') ||
        args[0].includes('Missing queryFn'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Mock localStorage globally for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage globally for tests
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock
