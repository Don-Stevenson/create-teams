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

// Registration route
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = await User.create(req.body)
      res.status(201).json({
        success: true,
        user: { id: user._id, username: user.username },
      })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
)

// login route
router.post('/login', async (req, res) => {
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
      maxAge: 3600000,
      sameSite: 'strict',
    })
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ success: true })
})

// Validation rules
const playerValidationRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('attackScore').isInt({ min: 0, max: 50 }),
  body('defenseScore').isInt({ min: 0, max: 50 }),
  body('fitnessScore').isInt({ min: 0, max: 50 }),
  body('gender').isIn(['male', 'female', 'nonBinary']),
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
  validate([body('isPlayingThisWeek').isBoolean()]),
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

router.put(
  '/players/:id/playerInfo',
  validate([
    body('name').trim().isLength({ min: 2, max: 50 }).escape(),
    body('attackScore').isInt({ min: 0, max: 50 }),
    body('defenseScore').isInt({ min: 0, max: 50 }),
    body('fitnessScore').isInt({ min: 0, max: 50 }),
    body('isPlayingThisWeek').custom(value => {
      if (value === 'true' || value === 'false' || typeof value === 'boolean') {
        return true
      }
      throw new Error('isPlayingThisWeek must be a boolean or "true"/"false"')
    }),
    body('gender').isIn(['male', 'female', 'nonBinary']),
  ]),
  async (req, res, next) => {
    try {
      const {
        name,
        attackScore,
        defenseScore,
        fitnessScore,
        isPlayingThisWeek,
        gender,
      } = req.body

      // Convert isPlayingThisWeek to boolean
      const isPlaying =
        isPlayingThisWeek === 'true' || isPlayingThisWeek === true

      const updatedPlayer = await Player.findByIdAndUpdate(
        req.params.id,
        {
          name,
          attackScore: Number(attackScore),
          defenseScore: Number(defenseScore),
          fitnessScore: Number(fitnessScore),
          isPlayingThisWeek: isPlaying,
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
router.delete('/players/:id', async (req, res, next) => {
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
router.post(
  '/balance-teams',
  validate([body('numTeams').isInt({ min: 2, max: 10 })]),
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

// Check if user is authenticated
router.get('/auth/check', auth, (req, res) => {
  // If the user reaches here, the auth middleware has validated the JWT
  res.status(200).json({ success: true, message: 'Authenticated' })
})

export default router
