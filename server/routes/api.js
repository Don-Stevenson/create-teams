// server/routes/api.js
import express from 'express'
const router = express.Router()
import { check } from 'express-validator'
import Player from '../models/Player.js'
import balanceTeams from '../utils/teamBalancer.js'
import validate from '../middleware/validate.js'

// Validation rules
const playerValidationRules = [
  check('name').trim().isLength({ min: 2, max: 50 }).escape(),
  check('attackScore').isInt({ min: 0, max: 100 }),
  check('defenseScore').isInt({ min: 0, max: 100 }),
  check('fitnessScore').isInt({ min: 0, max: 100 }),
  check('gender').isIn(['male', 'female', 'other']),
]

// GET all players
router.get('/players', async (req, res, next) => {
  try {
    const players = await Player.find().select('-__v')
    res.json(players)
  } catch (err) {
    next(err)
  }
})

// POST a new player
router.post(
  '/players',
  validate(playerValidationRules),
  async (req, res, next) => {
    try {
      const player = new Player(req.body)
      const newPlayer = await player.save()
      res.status(201).json(newPlayer)
    } catch (err) {
      next(err)
    }
  }
)

// PUT update player's weekly status
router.put(
  '/players/:id',
  [check('isPlayingThisWeek').isBoolean()],
  validate([check('isPlayingThisWeek').isBoolean()]),
  async (req, res, next) => {
    try {
      const updatedPlayer = await Player.findByIdAndUpdate(
        req.params.id,
        { isPlayingThisWeek: req.body.isPlayingThisWeek },
        { new: true, runValidators: true }
      )
      if (!updatedPlayer) {
        return res.status(404).json({ message: 'Player not found' })
      }
      res.json(updatedPlayer)
    } catch (err) {
      next(err)
    }
  }
)

// POST balance teams
router.post(
  '/balance-teams',
  validate([check('numTeams').isInt({ min: 2, max: 10 })]),
  async (req, res, next) => {
    try {
      const playingPlayers = await Player.find({ isPlayingThisWeek: true })
      const balancedTeams = balanceTeams(playingPlayers, req.body.numTeams)
      res.json(balancedTeams)
    } catch (err) {
      next(err)
    }
  }
)

export default router
