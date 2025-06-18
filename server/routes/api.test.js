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
    default: jest.fn((players, numTeams) => Array(numTeams).fill([])),
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
        name: 'A',
        gameKnowledgeScore: 22,
        goalScoringScore: 18,
        attackScore: 100,
        midfieldScore: 22,
        defenseScore: -1,
        fitnessScore: 'invalid',
        gender: 'invalid',
        isPlayingThisWeek: 'not-boolean',
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
    })

    it('should reject invalid updates', async () => {
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
    })
  })

  describe('POST /balance-teams', () => {
    it('should balance teams with valid number of teams', async () => {
      const response = await request(app)
        .post('/balance-teams')
        .set('Cookie', [`token=${authToken}`])
        .send({ numTeams: 2 })

      expect(response.status).toBe(200)
    })

    it('should reject invalid number of teams', async () => {
      const response = await request(app)
        .post('/balance-teams')
        .set('Cookie', [`token=${authToken}`])
        .send({ numTeams: 1 })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /players-bulk-update', () => {
    it('should update all players status', async () => {
      const response = await request(app)
        .put('/players-bulk-update')
        .set('Cookie', [`token=${authToken}`])
        .send({ isPlayingThisWeek: false })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const players = await Player.find()
      players.forEach(player => {
        expect(player.isPlayingThisWeek).toBe(false)
      })
    })

    it('should reject invalid boolean value', async () => {
      const response = await request(app)
        .put('/players-bulk-update')
        .set('Cookie', [`token=${authToken}`])
        .send({ isPlayingThisWeek: 'not-a-boolean' })

      expect(response.status).toBe(400)
    })
  })
})
