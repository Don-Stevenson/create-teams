import { jest } from '@jest/globals'

// Simple mock that stores password mappings
const passwordMap = new Map()

const bcrypt = {
  genSalt: jest.fn().mockImplementation(rounds => {
    return Promise.resolve('mockSalt')
  }),

  hash: jest.fn().mockImplementation((password, salt) => {
    const hashedPassword = `hashed_${password}`
    passwordMap.set(hashedPassword, password)
    return Promise.resolve(hashedPassword)
  }),

  compare: jest.fn().mockImplementation((password, hashedPassword) => {
    const originalPassword = passwordMap.get(hashedPassword)
    return Promise.resolve(originalPassword === password)
  }),
}

export default bcrypt
