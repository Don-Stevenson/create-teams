// server/server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import connectDB from './db/connection.js'
import errorHandler from './middleware/errorHandler.js'
import xss from 'xss'
import apiRoutes from './routes/api.js' // Import the routes

const app = express()

// Connect to database
connectDB()

// Security middlewares
app.use(helmet())
app.use(cors())
app.use(mongoSanitize())
app.use(hpp())

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        req.body[key] = xss(req.body[key])
      }
    }
  }
  next()
}

// Use the sanitizeInput middleware
app.use(express.json({ limit: '10kb' })) // Body parser, reading data from body into req.body
app.use(sanitizeInput) // Apply XSS sanitization middleware

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Routes
app.use('/api', apiRoutes) // Use the imported routes

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
