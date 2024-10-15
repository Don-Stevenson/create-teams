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
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(helmet())

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)

app.use(
  cors({
    origin: process.env.ORIGIN_URL, // Frontend origin
    credentials: true, // Allow sending cookies and credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
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
        req.body[key] = xss(req.body[key])
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
