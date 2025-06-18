import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connectDB from './db/connection.js'
import errorHandler from './middleware/errorHandler.js'
import xss from 'xss'
import apiRoutes from './routes/api.js'

const app = express()

// Middleware
app.use(
  express.json({
    strict: false,
    verify: (req, res, buf) => {
      req.rawBody = buf.toString()
    },
  })
)
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)

const allowedOrigins = [
  'http://localhost:3000', // local dev
  'https://create-teams.vercel.app', // Vercel prod
]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

app.use(mongoSanitize())
app.use(hpp())
app.options('*', cors()) // Allow preflight requests for all routes

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key])
        } else if (Array.isArray(req.body[key])) {
          req.body[key] = req.body[key].map(item =>
            typeof item === 'string' ? xss(item) : item
          )
        }
      }
    }
  }
  next()
}

app.use(sanitizeInput)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // increase this number
})
app.use('/api/', limiter)

// Connect to database
connectDB()

// Routes
app.use('/api', apiRoutes)

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5050
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app
