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

// Suppress all console warnings and errors during tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = jest.fn() // Suppress all errors
  console.warn = jest.fn() // Suppress all warnings
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

// Mock Request and Response for Next.js server components
global.Request = class Request {
  constructor(input, init) {
    this.url = input
    this.method = init?.method || 'GET'
    this.headers = {
      get: jest.fn(),
      ...init?.headers,
    }
  }
}

global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || ''
    this.headers = new Map(Object.entries(init?.headers || {}))
  }

  // Add json method to Response
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  // Static json method for NextResponse
  static json(data, init = {}) {
    const response = new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init.headers,
      },
    })
    response._jsonData = data
    return response
  }
}

// Mock Headers API
global.Headers = class Headers extends Map {
  constructor(init) {
    super(Object.entries(init || {}))
  }

  get(name) {
    return super.get(name.toLowerCase())
  }

  set(name, value) {
    return super.set(name.toLowerCase(), value)
  }

  has(name) {
    return super.has(name.toLowerCase())
  }
}
