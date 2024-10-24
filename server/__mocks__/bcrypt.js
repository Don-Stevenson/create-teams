import { jest } from '@jest/globals'
const bcrypt = jest.createMockFromModule('bcryptjs')

bcrypt.hash = jest.fn().mockImplementation((password, salt) => {
  return Promise.resolve('hashedPassword')
})

export default bcrypt
