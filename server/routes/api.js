import express from 'express'
import { body, validationResult, check } from 'express-validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Player from '../models/Player.js'
import balanceTeams from '../utils/balanceTeams.js'
import validate from '../middleware/validate.js'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Public routes (no authentication required)
const publicRouter = express.Router()

// Login route
publicRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    })
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// Logout route
publicRouter.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ success: true })
})

// Auth check route
publicRouter.get('/auth/check', auth, (req, res) => {
  res
    .status(200)
    .json({ success: true, message: 'Authenticated', userId: req.userId })
})

// Protected routes (authentication required)
const protectedRouter = express.Router()
protectedRouter.use(auth)

// Validation rules
const playerValidationRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('gameKnowledgeScore').isLength({ min: 1, max: 10 }),
  body('goalScoringScore').isLength({ min: 1, max: 10 }),
  body('attackScore').isInt({ min: 1, max: 10 }),
  body('midfieldScore').isInt({ min: 1, max: 10 }),
  body('defenseScore').isInt({ min: 1, max: 10 }),
  body('fitnessScore').isInt({ min: 1, max: 10 }),
  body('gender').isIn(['male', 'female', 'nonBinary']),
  body('isPlayingThisWeek').isBoolean(),
]

// GET all players
protectedRouter.get('/players', async (req, res, next) => {
  try {
    const players = await Player.find().select('-__v')
    res.json(players)
  } catch (err) {
    next(err)
  }
})

// POST a new player
protectedRouter.post(
  '/players',
  validate(playerValidationRules),
  async (req, res, next) => {
    try {
      const player = new Player(req.body)
      const newPlayer = await player.save()
      res.status(201).json(newPlayer)
    } catch (err) {
      console.error(err)
      next(err)
    }
  }
)

// PUT update player's weekly status
protectedRouter.put(
  '/players/:id',
  validate(playerValidationRules),
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

protectedRouter.put(
  '/players/:id/playerInfo',
  validate(playerValidationRules),
  async (req, res, next) => {
    try {
      const {
        name,
        gameKnowledgeScore,
        goalScoringScore,
        attackScore,
        midfieldScore,
        defenseScore,
        fitnessScore,
        isPlayingThisWeek,
        gender,
      } = req.body

      const updatedPlayer = await Player.findByIdAndUpdate(
        req.params.id,
        {
          name,
          gameKnowledgeScore: Number(gameKnowledgeScore),
          goalScoringScore: Number(goalScoringScore),
          attackScore: Number(attackScore),
          midfieldScore: Number(midfieldScore),
          defenseScore: Number(defenseScore),
          fitnessScore: Number(fitnessScore),
          isPlayingThisWeek: Boolean(isPlayingThisWeek),
          gender,
        },
        { new: true, runValidators: true }
      )

      if (!updatedPlayer) {
        return res.status(404).json({ message: 'Player not found' })
      }

      res.json(updatedPlayer)
    } catch (err) {
      console.error('Error updating player:', err)
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res
          .status(400)
          .json({ message: 'Invalid data format', error: err.message })
      }
      next(err)
    }
  }
)

// DELETE a player
protectedRouter.delete('/players/:id', async (req, res, next) => {
  try {
    const deletedPlayer = await Player.findByIdAndDelete(req.params.id)
    if (!deletedPlayer) {
      return res.status(404).json({ message: 'Player not found' })
    }
    res.json({ message: 'Player deleted successfully' })
  } catch (err) {
    next(err)
  }
})

// POST balance teams
protectedRouter.post(
  '/balance-teams',
  validate([body('numTeams').isInt({ min: 2 })]),
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

// Route for bulk updating players is playing this week
protectedRouter.put(
  '/players-bulk-update',
  [
    body('isPlayingThisWeek')
      .isBoolean()
      .withMessage('isPlayingThisWeek must be a boolean value'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { isPlayingThisWeek } = req.body
      const result = await Player.updateMany(
        {},
        { $set: { isPlayingThisWeek: isPlayingThisWeek } }
      )

      res.status(200).json({
        success: true,
        message: 'All players updated successfully',
      })
    } catch (error) {
      console.error('Error updating players:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
)

// Mount the routers
router.use('/', publicRouter)
router.use('/', protectedRouter)

export default router
