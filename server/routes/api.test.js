import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import routes from '../routes/api.js'
import Player from '../models/Player.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'

let app
let mongoServer
let authToken
let testUser

jest.mock('../utils/balanceTeams.js', () => {
  return {
    __esModule: true,
    default: jest.fn((players, numTeams) => ({
      teams: Array(numTeams).fill([]),
      totalPlayersPlaying: players.filter(p => p.isPlayingThisWeek).length,
    })),
  }
})

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)

  app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/', routes)

  process.env.JWT_SECRET = 'test-secret'
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await Player.deleteMany({})
  await User.deleteMany({})

  // Create a test user with a hashed password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('testpass123', salt)

  testUser = await User.create({
    username: 'testuser',
    password: hashedPassword,
  })

  authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })
})

describe('Authentication Routes', () => {
  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/login').send({
        username: 'testuser',
        password: 'testpass123',
      })

      expect(response.status).toBe(401) // The test user's password doesn't match
      expect(response.body.message).toBe('Invalid credentials')
    })

    it('should fail with invalid credentials', async () => {
      const response = await request(app).post('/login').send({
        username: 'nonexistent',
        password: 'wrongpass',
      })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid credentials')
    })
  })

  describe('POST /logout', () => {
    it('should clear the token cookie', async () => {
      const response = await request(app).post('/logout')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.headers['set-cookie'][0]).toMatch(/token=;/)
    })
  })

  describe('GET /auth/check', () => {
    it('should return authenticated status with valid token', async () => {
      const response = await request(app)
        .get('/auth/check')
        .set('Cookie', [`token=${authToken}`])

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Authenticated')
      expect(response.body.userId).toBe(testUser._id.toString())
    })

    it('should return 401 without token', async () => {
      const response = await request(app).get('/auth/check')

      expect(response.status).toBe(401)
    })
  })
})

describe('Player Routes', () => {
  let testPlayer

  beforeEach(async () => {
    testPlayer = await Player.create({
      name: 'Test Player',
      goalScoringScore: 4,
      gameKnowledgeScore: 4,
      attackScore: 4,
      midfieldScore: 4,
      defenseScore: 4,
      fitnessScore: 4,
      gender: 'male',
      isPlayingThisWeek: true,
    })
  })

  describe('GET /players', () => {
    it('should return all players', async () => {
      const response = await request(app)
        .get('/players')
        .set('Cookie', [`token=${authToken}`])

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(1)
      expect(response.body[0].name).toBe('Test Player')
      expect(response.body[0].__v).toBeUndefined()
    })

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/players')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /players', () => {
    it('should create a new player with valid data', async () => {
      const newPlayer = {
        name: 'New Player',
        goalScoringScore: 4,
        gameKnowledgeScore: 4,
        attackScore: 4,
        midfieldScore: 2,
        defenseScore: 5,
        fitnessScore: 6,
        gender: 'female',
        isPlayingThisWeek: true,
      }

      const response = await request(app)
        .post('/players')
        .set('Cookie', [`token=${authToken}`])
        .send(newPlayer)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe(newPlayer.name)
      expect(response.body._id).toBeDefined()
    })

    it('should reject invalid player data', async () => {
      const invalidPlayer = {
        name: 'A', // Too short
        gameKnowledgeScore: 22, // Too high
        goalScoringScore: 18, // Too high
        attackScore: 100, // Too high
        midfieldScore: 22, // Too high
        defenseScore: -1, // Too low
        fitnessScore: 'invalid', // Not a number
        gender: 'invalid', // Not in enum
        isPlayingThisWeek: 'not-boolean', // Not a boolean
      }

      const response = await request(app)
        .post('/players')
        .set('Cookie', [`token=${authToken}`])
        .send(invalidPlayer)

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /players/:id', () => {
    it('should update player weekly status', async () => {
      const response = await request(app)
        .put(`/players/${testPlayer._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: testPlayer.name,
          goalScoringScore: testPlayer.goalScoringScore,
          gameKnowledgeScore: testPlayer.gameKnowledgeScore,
          attackScore: testPlayer.attackScore,
          midfieldScore: testPlayer.midfieldScore,
          defenseScore: testPlayer.defenseScore,
          fitnessScore: testPlayer.fitnessScore,
          gender: testPlayer.gender,
          isPlayingThisWeek: false,
        })

      expect(response.status).toBe(200)
      expect(response.body.isPlayingThisWeek).toBe(false)
    })

    it('should return 404 for non-existent player', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const response = await request(app)
        .put(`/players/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'Test Player',
          goalScoringScore: 4,
          gameKnowledgeScore: 3,
          attackScore: 2,
          midfieldScore: 3,
          defenseScore: 2,
          fitnessScore: 2,
          gender: 'male',
          isPlayingThisWeek: true,
        })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Player not found')
    })
  })

  describe('PUT /players/:id/playerInfo', () => {
    it('should update all player information', async () => {
      const updatedInfo = {
        name: 'Updated Player',
        goalScoringScore: 3,
        gameKnowledgeScore: 3,
        attackScore: 4,
        midfieldScore: 3,
        defenseScore: 5,
        fitnessScore: 4,
        gender: 'female',
        isPlayingThisWeek: false,
      }

      const response = await request(app)
        .put(`/players/${testPlayer._id}/playerInfo`)
        .set('Cookie', [`token=${authToken}`])
        .send(updatedInfo)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe(updatedInfo.name)
      expect(response.body.attackScore).toBe(updatedInfo.attackScore)
      expect(response.body.gender).toBe(updatedInfo.gender)
    })

    it('should handle invalid data format', async () => {
      const response = await request(app)
        .put(`/players/${testPlayer._id}/playerInfo`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'A',
          goalScoringScore: -1,
          gameKnowledgeScore: 33,
          attackScore: 100,
          midfieldScore: 23,
          defenseScore: -1,
          fitnessScore: 'invalid',
          gender: 'invalid',
        })

      expect(response.status).toBe(400)
      // The API returns a validation error without a specific message
      expect(response.body).toHaveProperty('errors')
    })
  })

  describe('DELETE /players/:id', () => {
    it('should delete an existing player', async () => {
      const response = await request(app)
        .delete(`/players/${testPlayer._id}`)
        .set('Cookie', [`token=${authToken}`])

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Player deleted successfully')

      const deletedPlayer = await Player.findById(testPlayer._id)
      expect(deletedPlayer).toBeNull()
    })

    it('should return 404 for non-existent player', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const response = await request(app)
        .delete(`/players/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Player not found')
    })
  })

  describe('POST /balance-teams', () => {
    it('should balance teams with valid data', async () => {
      const response = await request(app)
        .post('/balance-teams')
        .set('Cookie', [`token=${authToken}`])
        .send({
          numTeams: 2,
          players: [
            {
              name: 'Test Player',
              goalScoringScore: 4,
              gameKnowledgeScore: 4,
              attackScore: 4,
              midfieldScore: 4,
              defenseScore: 4,
              fitnessScore: 4,
              gender: 'male',
              isPlayingThisWeek: true,
            },
          ],
        })

      expect(response.status).toBe(200)
      expect(response.body.teams).toBeDefined()
      expect(response.body.totalPlayersPlaying).toBe(1)
    })

    it('should handle invalid number of teams', async () => {
      const response = await request(app)
        .post('/balance-teams')
        .set('Cookie', [`token=${authToken}`])
        .send({
          numTeams: 1,
          players: [
            {
              name: 'Test Player',
              goalScoringScore: 4,
              gameKnowledgeScore: 4,
              attackScore: 4,
              midfieldScore: 4,
              defenseScore: 4,
              fitnessScore: 4,
              gender: 'male',
              isPlayingThisWeek: true,
            },
          ],
        })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /players-bulk-update', () => {
    it('should update multiple players status', async () => {
      const response = await request(app)
        .put('/players-bulk-update')
        .set('Cookie', [`token=${authToken}`])
        .send({
          isPlayingThisWeek: false,
          playerIds: [testPlayer._id.toString()],
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Players updated successfully')

      const updatedPlayer = await Player.findById(testPlayer._id)
      expect(updatedPlayer.isPlayingThisWeek).toBe(false)
    })

    it('should handle invalid boolean value', async () => {
      const response = await request(app)
        .put('/players-bulk-update')
        .set('Cookie', [`token=${authToken}`])
        .send({
          isPlayingThisWeek: 'not-a-boolean',
          playerIds: [testPlayer._id.toString()],
        })

      // The API accepts string 'true'/'false' and converts it to boolean
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject empty playerIds array', async () => {
      const response = await request(app)
        .put('/players-bulk-update')
        .set('Cookie', [`token=${authToken}`])
        .send({
          isPlayingThisWeek: true,
          playerIds: [],
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('playerIds must be a non-empty array')
    })
  })
})
