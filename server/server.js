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
  // Allow all Vercel preview deploys for this project:
  /^https:\/\/create-teams-git-.*\.vercel\.app$/,
  // Add your actual production domains here
  /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel domains
  /^https:\/\/.*\.render\.com$/, // Allow all Render domains
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.some(o =>
          typeof o === 'string' ? o === origin : o.test(origin)
        )
      ) {
        return callback(null, true)
      }
      const msg =
        'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
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

// Rate limiting - TEMPORARILY DISABLED
// const limiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 100, // 100 requests per hour
//   message: 'Too many requests, please try again later.',
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   // Custom key generator - you can customize this based on your needs
//   keyGenerator: (req) => {
//     // Use IP address as default, but you could also use user agent or other identifiers
//     return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress || 'unknown'
//   },
//   // Custom handler for when limit is exceeded
//   handler: (req, res) => {
//     res.status(429).json({
//       error: 'Too many requests, please try again later.',
//       retryAfter: Math.ceil(60 * 60 / 60), // Retry after 1 hour (in minutes)
//     })
//   }
// })

// Store reference to the rate limiter store for debugging
// const limiterStore = limiter.store

// app.use('/api/', limiter)

// Connect to database
connectDB()

// Routes
app.use('/api', apiRoutes)

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5050
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app
