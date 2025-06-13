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
  express.json(),
  validate([
    body('numTeams')
      .isInt({ min: 2 })
      .withMessage('Number of teams must be at least 2'),
    body('players')
      .custom((value, { req }) => {
        // Log the raw value and request body
        console.log('Validating players array:', {
          value,
          valueType: typeof value,
          isArray: Array.isArray(value),
          length: value?.length,
          rawBody: req.body,
          bodyType: typeof req.body,
          bodyKeys: Object.keys(req.body),
          rawBodyString: JSON.stringify(req.body),
          contentType: req.headers['content-type'],
        })

        // Check if value exists
        if (!value) {
          console.error('Players value is undefined or null')
          return false
        }

        // If value is a string, try to parse it
        if (typeof value === 'string') {
          try {
            // Try to parse the string as JSON
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) {
              req.body.players = parsed
              return true
            }
          } catch (e) {
            console.error('Failed to parse players string:', e)
            // If parsing fails, try to parse the entire request body
            try {
              const parsedBody = JSON.parse(req.body.players)
              if (Array.isArray(parsedBody)) {
                req.body.players = parsedBody
                return true
              }
            } catch (e2) {
              console.error('Failed to parse entire request body:', e2)
            }
          }
          return false
        }

        // If value is not an array, return false
        if (!Array.isArray(value)) {
          console.error('Players is not an array:', value)
          return false
        }

        // If array is empty, return false
        if (value.length === 0) {
          console.error('Players array is empty')
          return false
        }

        // Validate each player object
        for (const player of value) {
          if (!player || typeof player !== 'object') {
            console.error('Invalid player object:', player)
            return false
          }

          // Check required fields
          const requiredFields = [
            'name',
            'gameKnowledgeScore',
            'goalScoringScore',
            'attackScore',
            'midfieldScore',
            'defenseScore',
            'fitnessScore',
          ]

          for (const field of requiredFields) {
            if (!(field in player)) {
              console.error(
                `Missing required field ${field} in player:`,
                player
              )
              return false
            }
          }
        }

        // Log each player in the array
        console.log(
          'Players array contents:',
          value.map(player => ({
            name: player.name,
            id: player._id,
            scores: {
              gameKnowledge: player.gameKnowledgeScore,
              goalScoring: player.goalScoringScore,
              attack: player.attackScore,
              midfield: player.midfieldScore,
              defense: player.defenseScore,
              fitness: player.fitnessScore,
            },
          }))
        )

        return true
      })
      .withMessage('Players must be a non-empty array of valid player objects'),
  ]),
  async (req, res, next) => {
    try {
      // Log the raw request body
      console.log('Raw request body:', {
        body: req.body,
        bodyType: typeof req.body,
        playersType: typeof req.body.players,
        isArray: Array.isArray(req.body.players),
        playersLength: req.body.players?.length,
        bodyKeys: Object.keys(req.body),
        contentType: req.headers['content-type'],
      })

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(err => ({
          param: err.param,
          path: err.path,
          msg: err.msg,
          value: err.value,
          type: typeof err.value,
          location: err.location,
        }))
        console.error(
          'Validation errors:',
          JSON.stringify(errorDetails, null, 2)
        )
        return res.status(400).json({ errors: errorDetails })
      }

      const { numTeams, players } = req.body

      // Log the parsed request data
      console.log('Parsed request:', {
        numTeams,
        playerCount: players?.length,
        isArray: Array.isArray(players),
        firstPlayer: players?.[0],
        playersType: typeof players,
      })

      // Add validation and logging
      if (!players || !Array.isArray(players)) {
        console.error('Invalid players data:', players)
        return res.status(400).json({ error: 'Invalid players data' })
      }

      if (players.length === 0) {
        return res.status(400).json({ error: 'No players provided' })
      }

      // Ensure all numeric fields are numbers
      const cleanPlayers = players.map(player => ({
        ...player,
        gameKnowledgeScore: Number(player.gameKnowledgeScore),
        goalScoringScore: Number(player.goalScoringScore),
        attackScore: Number(player.attackScore),
        midfieldScore: Number(player.midfieldScore),
        defenseScore: Number(player.defenseScore),
        fitnessScore: Number(player.fitnessScore),
        gender: player.gender || 'male',
        isPlayingThisWeek: true,
      }))

      try {
        const balancedTeams = balanceTeams(cleanPlayers, numTeams)
        console.log('Successfully balanced teams:', {
          teamCount: balancedTeams.teams.length,
          totalPlayers: balancedTeams.totalPlayersPlaying,
          firstTeam: balancedTeams.teams[0],
        })
        return res.json(balancedTeams)
      } catch (error) {
        console.error('Error in balanceTeams:', error)
        return res.status(400).json({ error: error.message })
      }
    } catch (err) {
      console.error('Error in balance-teams:', err)
      return res.status(400).json({ error: err.message })
    }
  }
)

// Route for bulk updating players is playing this week
protectedRouter.put(
  '/players-bulk-update',
  express.json(),
  async (req, res) => {
    try {
      // Log the raw request body
      console.log('Raw request body:', req.body)

      // Extract and validate the data
      let { isPlayingThisWeek, playerIds } = req.body

      // Convert isPlayingThisWeek to boolean if it's a string
      if (typeof isPlayingThisWeek === 'string') {
        isPlayingThisWeek = isPlayingThisWeek.toLowerCase() === 'true'
      }

      // Convert playerIds to array if it's a string
      if (typeof playerIds === 'string') {
        playerIds = playerIds.split(',').map(id => id.trim())
      }

      console.log('Processed request data:', {
        isPlayingThisWeek,
        isPlayingThisWeekType: typeof isPlayingThisWeek,
        playerIds,
        playerIdsType: Array.isArray(playerIds) ? 'array' : typeof playerIds,
        playerIdsLength: Array.isArray(playerIds) ? playerIds.length : 'N/A',
      })

      // Validate isPlayingThisWeek
      if (typeof isPlayingThisWeek !== 'boolean') {
        console.log('Validation failed for isPlayingThisWeek:', {
          value: isPlayingThisWeek,
          type: typeof isPlayingThisWeek,
          rawValue: req.body.isPlayingThisWeek,
        })
        return res.status(400).json({
          errors: [
            {
              type: 'field',
              value: isPlayingThisWeek,
              msg: 'isPlayingThisWeek must be a boolean value',
              path: 'isPlayingThisWeek',
              location: 'body',
            },
          ],
        })
      }

      // Validate playerIds
      if (!Array.isArray(playerIds) || playerIds.length === 0) {
        console.log('Validation failed for playerIds:', {
          value: playerIds,
          isArray: Array.isArray(playerIds),
          length: Array.isArray(playerIds) ? playerIds.length : 'N/A',
          rawValue: req.body.playerIds,
        })
        return res.status(400).json({
          errors: [
            {
              type: 'field',
              value: playerIds,
              msg: 'playerIds must be a non-empty array',
              path: 'playerIds',
              location: 'body',
            },
          ],
        })
      }

      // Update all specified players
      const result = await Player.updateMany(
        { _id: { $in: playerIds } },
        { $set: { isPlayingThisWeek } }
      )
      console.log('Update result:', result)

      res.json({ message: 'Players updated successfully' })
    } catch (error) {
      console.error('Error updating players:', error)
      res.status(500).json({ error: 'Failed to update players' })
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
