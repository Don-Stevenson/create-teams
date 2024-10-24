import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from './User'
import { jest } from '@jest/globals'
import bcrypt from '../__mocks__/bcrypt'

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}))

describe('User Model Test', () => {
  let mongoServer
  jest.setTimeout(30000)

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  })

  afterEach(async () => {
    await User.deleteMany({})
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  describe('User Validation', () => {
    it('should validate a valid user', async () => {
      const validUser = new User({
        username: 'testuser',
        password: 'password123',
      })
      const savedUser = await validUser.save()
      const hashedPasswordLength = 60
      expect(savedUser._id).toBeDefined()
      expect(savedUser.username).toBe('testuser')
      expect(savedUser.password.length).toBe(hashedPasswordLength)
    })

    it('should fail validation without username', async () => {
      const userWithoutUsername = new User({
        password: 'password123',
      })

      let err
      try {
        await userWithoutUsername.save()
      } catch (error) {
        err = error
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.errors.username).toBeDefined()
    })

    it('should fail validation without password', async () => {
      const userWithoutPassword = new User({
        username: 'testuser',
      })

      let err
      try {
        await userWithoutPassword.save()
      } catch (error) {
        err = error
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.errors.password).toBeDefined()
    })

    it('should enforce unique username constraint', async () => {
      const firstUser = new User({
        username: 'testuser',
        password: 'password123',
      })
      await firstUser.save()

      const duplicateUser = new User({
        username: 'testuser',
        password: 'differentpassword',
      })

      let err
      try {
        await duplicateUser.save()
      } catch (error) {
        err = error
      }

      expect(err).toBeDefined()
      expect(err.code).toBe(11000)
    })
  })

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
      })

      await user.save()
      const hashedPasswordLength = 60

      expect(user.password.length).toBe(hashedPasswordLength)
    })

    it('should not rehash password if not modified', async () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
      })

      await user.save()
      const hashCallCount = bcrypt.hash.mock.calls.length

      user.username = 'newusername'
      await user.save()

      expect(bcrypt.hash.mock.calls.length).toBe(hashCallCount)
    })
  })
})
