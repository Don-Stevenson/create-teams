import express from 'express'
import { body, validationResult, check } from 'express-validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Player from '../models/Player.js'
import balanceTeams from '../utils/balanceTeams.js'
import validate from '../middleware/validate.js'
import User from '../models/User.js'
import auth from '../middleware/auth.js'
import { upcomingGamesList, rsvpsForGame } from '../utils/getUpcomingGames.js'
import {
  addToBlacklist,
  isBlacklisted,
  getBlacklist,
} from '../utils/tokenBlacklist.js'
import {
  createSession,
  invalidateSession,
  isSessionValid,
  getAllSessions,
} from '../utils/sessionStore.js'

const router = express.Router()

// Public routes (no authentication required)
const publicRouter = express.Router()

// // Registration route
// router.post(
//   '/register',
//   [
//     body('username').trim().isLength({ min: 3 }).escape(),
//     body('password').isLength({ min: 6 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//     }

//     try {
//       const user = await User.create(req.body)
//       res.status(201).json({
//         success: true,
//         user: { id: user._id, username: user.username },
//       })
//     } catch (error) {
//       res.status(400).json({ success: false, error: error.message })
//     }
//   }

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

    // Create session
    createSession(user._id, token)

    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in production
      maxAge: 3600000,
      path: '/',
    })
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// Test endpoint to force clear all auth state
publicRouter.post('/force-clear-auth', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production'
  // Clear the token from cookies
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  })

  // Force clear all sessions and blacklist (for testing)
  const currentToken = req.cookies?.token
  if (currentToken) {
    addToBlacklist(currentToken)
    invalidateSession(currentToken)
  }

  res.json({ success: true, message: 'All auth state cleared' })
})

// Debug endpoint to see blacklist and session state
publicRouter.get('/debug-auth-state', (req, res) => {
  const token = req.cookies?.token

  if (token) {
    const blacklisted = isBlacklisted(token)
    const sessionValid = isSessionValid(token)

    res.json({
      hasToken: true,
      tokenPreview: token.substring(0, 20) + '...',
      blacklisted,
      sessionValid,
      blacklistSize: getBlacklist().size,
      activeSessionsCount: getAllSessions().length,
    })
  } else {
    res.json({
      hasToken: false,
      blacklistSize: getBlacklist().size,
      activeSessionsCount: getAllSessions().length,
    })
  }
})

// Test endpoint to check auth state
publicRouter.get('/test-auth', (req, res) => {
  if (req.cookies?.token) {
    const blacklisted = isBlacklisted(req.cookies.token)
    const sessionValid = isSessionValid(req.cookies.token)

    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
      res.json({
        hasToken: true,
        blacklisted,
        sessionValid,
        valid: true,
        userId: decoded.userId,
      })
    } catch (error) {
      res.json({
        hasToken: true,
        blacklisted,
        sessionValid,
        valid: false,
        error: error.message,
      })
    }
  } else {
    res.json({ hasToken: false })
  }
})

// Test endpoint to manually clear cookies
publicRouter.get('/clear-cookies', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production'
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  })

  res.status(200).json({ success: true, message: 'Cookies cleared' })
})

// Logout route
publicRouter.post('/logout', (req, res) => {
  // Add current token to blacklist
  const currentToken = req.cookies?.token
  if (currentToken) {
    addToBlacklist(currentToken)
    invalidateSession(currentToken)
  }

  const isProduction = process.env.NODE_ENV === 'production'
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  })

  res.status(200).json({ success: true })
})

// Auth check route
publicRouter.get('/auth/check', auth, (req, res) => {
  res
    .status(200)
    .json({ success: true, message: 'Authenticated', userId: req.userId })
})

// Debug endpoint to see cookies and headers
publicRouter.get('/debug-cookies', (req, res) => {
  const cookieHeader = req.headers.cookie
  const allCookies = req.cookies
  const token = req.cookies?.token

  console.log('Debug cookies request:')
  console.log('Cookie header:', cookieHeader)
  console.log('Parsed cookies:', allCookies)
  console.log('Token cookie:', token)

  res.json({
    cookieHeader,
    allCookies,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : null,
    headers: {
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
    },
  })
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
protectedRouter.post('/balance-teams', express.json(), async (req, res) => {
  try {
    const { numTeams, players } = req.body

    // Validate request body
    if (!req.body) {
      console.error('No request body received')
      return res.status(400).json({ error: 'No request body received' })
    }

    if (!numTeams) {
      console.error('No numTeams provided')
      return res.status(400).json({ error: 'Number of teams is required' })
    }

    const parsedNumTeams = parseInt(numTeams, 10)
    if (isNaN(parsedNumTeams) || parsedNumTeams < 2) {
      console.error('Invalid number of teams:', numTeams)
      return res.status(400).json({ error: 'Invalid number of teams' })
    }

    if (!players) {
      console.error('No players array provided')
      return res.status(400).json({ error: 'Players array is required' })
    }

    // Ensure players is an array
    let playersArray = players
    if (typeof players === 'string') {
      try {
        // Try to parse the string as JSON
        playersArray = JSON.parse(players)
      } catch (e) {
        console.error('Failed to parse players string:', e)
        return res.status(400).json({ error: 'Invalid players data format' })
      }
    }

    if (!Array.isArray(playersArray)) {
      console.error('Players is not an array:', typeof playersArray)
      return res.status(400).json({ error: 'Players must be an array' })
    }

    if (playersArray.length === 0) {
      console.error('Empty players array')
      return res.status(400).json({ error: 'Players array cannot be empty' })
    }

    // Clean up player data
    const cleanedPlayers = playersArray.map((player, index) => {
      if (!player || typeof player !== 'object') {
        console.error(`Invalid player at index ${index}:`, player)
        throw new Error(`Invalid player data structure at index ${index}`)
      }

      const cleanedPlayer = {
        name: String(player.name || ''),
        gameKnowledgeScore: Number(player.gameKnowledgeScore || 0),
        goalScoringScore: Number(player.goalScoringScore || 0),
        attackScore: Number(player.attackScore || 0),
        midfieldScore: Number(player.midfieldScore || 0),
        defenseScore: Number(player.defenseScore || 0),
        fitnessScore: Number(player.fitnessScore || 0),
        gender: String(player.gender || 'male'),
        isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
      }

      // Validate cleaned player data
      if (!cleanedPlayer.name) {
        throw new Error(`Player at index ${index} has no name`)
      }

      if (
        cleanedPlayer.gameKnowledgeScore < 0 ||
        cleanedPlayer.gameKnowledgeScore > 10 ||
        cleanedPlayer.goalScoringScore < 0 ||
        cleanedPlayer.goalScoringScore > 10 ||
        cleanedPlayer.attackScore < 0 ||
        cleanedPlayer.attackScore > 10 ||
        cleanedPlayer.midfieldScore < 0 ||
        cleanedPlayer.midfieldScore > 10 ||
        cleanedPlayer.defenseScore < 0 ||
        cleanedPlayer.defenseScore > 10 ||
        cleanedPlayer.fitnessScore < 0 ||
        cleanedPlayer.fitnessScore > 10
      ) {
        throw new Error(
          `Player ${cleanedPlayer.name} has invalid scores (must be between 0 and 10)`
        )
      }

      if (!['male', 'female', 'nonBinary'].includes(cleanedPlayer.gender)) {
        throw new Error(
          `Player ${cleanedPlayer.name} has invalid gender: ${cleanedPlayer.gender}`
        )
      }

      return cleanedPlayer
    })

    const { teams, totalPlayersPlaying } = balanceTeams(
      cleanedPlayers,
      parsedNumTeams
    )
    return res.json({ teams, totalPlayersPlaying })
  } catch (error) {
    console.error('Error processing request:', error)
    return res.status(400).json({ error: error.message })
  }
})

// Route for bulk updating players is playing this week
protectedRouter.put(
  '/players-bulk-update',
  express.json(),
  async (req, res) => {
    try {
      // Extract and validate the data
      const { isPlayingThisWeek, playerIds } = req.body

      // Validate playerIds
      if (!Array.isArray(playerIds) || playerIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'playerIds must be a non-empty array',
        })
      }

      // Ensure all playerIds are strings
      const sanitizedPlayerIds = playerIds.map(id => String(id))

      // Update the players
      const result = await Player.updateMany(
        { _id: { $in: sanitizedPlayerIds } },
        { $set: { isPlayingThisWeek: Boolean(isPlayingThisWeek) } }
      )

      res.json({
        success: true,
        message: 'Players updated successfully',
        modifiedCount: result.modifiedCount,
      })
    } catch (error) {
      console.error('Error updating players:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update players',
        details: error.message,
      })
    }
  }
)

// GET upcoming games
protectedRouter.get('/upcoming-games', async (req, res) => {
  res.json(upcomingGamesList)
})

// GET rsvps for a game
protectedRouter.get('/rsvps-for-game/:gameId', async (req, res) => {
  const { gameId } = req.params
  try {
    const rsvps = await rsvpsForGame({
      teamId: process.env.TEAM_ID,
      gameId,
    })
    res.json(rsvps)
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    res.status(500).json({ error: 'Failed to fetch RSVPs' })
  }
})

// Mount the routers
router.use('/', publicRouter)
router.use('/', protectedRouter)

export default router
