import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import routes from '../routes/api.js'
import Player from '../models/Player.js'
import User from '../models/User.js'

let app
let mongoServer

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
      attackScore: 30,
      defenseScore: 30,
      fitnessScore: 30,
      gender: 'male',
      isPlayingThisWeek: true,
    })
  })

  describe('GET /players', () => {
    it('should return all players', async () => {
      const response = await request(app).get('/players')

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
        attackScore: 40,
        defenseScore: 40,
        fitnessScore: 40,
        gender: 'female',
        isPlayingThisWeek: true,
      }

      const response = await request(app).post('/players').send(newPlayer)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe(newPlayer.name)
      expect(response.body._id).toBeDefined()
    })

    it('should reject invalid player data', async () => {
      const invalidPlayer = {
        name: 'A',
        attackScore: 100,
        defenseScore: -1,
        fitnessScore: 'invalid',
        gender: 'invalid',
        isPlayingThisWeek: 'not-boolean',
      }

      const response = await request(app).post('/players').send(invalidPlayer)

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /players/:id', () => {
    it('should update player weekly status', async () => {
      const response = await request(app)
        .put(`/players/${testPlayer._id}`)
        .send({
          name: testPlayer.name,
          attackScore: testPlayer.attackScore,
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
      const response = await request(app).put(`/players/${fakeId}`).send({
        name: 'Test Player',
        attackScore: 30,
        defenseScore: 30,
        fitnessScore: 30,
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
        attackScore: 45,
        defenseScore: 45,
        fitnessScore: 45,
        gender: 'female',
        isPlayingThisWeek: false,
      }

      const response = await request(app)
        .put(`/players/${testPlayer._id}/playerInfo`)
        .send(updatedInfo)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe(updatedInfo.name)
      expect(response.body.attackScore).toBe(updatedInfo.attackScore)
    })

    it('should reject invalid updates', async () => {
      const response = await request(app)
        .put(`/players/${testPlayer._id}/playerInfo`)
        .send({
          name: 'A',
          attackScore: 100,
          defenseScore: -1,
          fitnessScore: 'invalid',
          gender: 'invalid',
        })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /players/:id', () => {
    it('should delete an existing player', async () => {
      const response = await request(app).delete(`/players/${testPlayer._id}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Player deleted successfully')

      const deletedPlayer = await Player.findById(testPlayer._id)
      expect(deletedPlayer).toBeNull()
    })

    it('should return 404 for non-existent player', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const response = await request(app).delete(`/players/${fakeId}`)

      expect(response.status).toBe(404)
    })
  })

  describe('POST /balance-teams', () => {
    it('should balance teams with valid number of teams', async () => {
      const response = await request(app)
        .post('/balance-teams')
        .send({ numTeams: 2 })

      expect(response.status).toBe(200)
    })

    it('should reject invalid number of teams', async () => {
      const response = await request(app)
        .post('/balance-teams')
        .send({ numTeams: 1 })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /players-bulk-update', () => {
    it('should update all players status', async () => {
      const response = await request(app)
        .put('/players-bulk-update')
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
        .send({ isPlayingThisWeek: 'not-a-boolean' })

      expect(response.status).toBe(400)
    })
  })
})
