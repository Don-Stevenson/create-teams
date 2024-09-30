import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const uri = process.env.ATLAS_URI || ''

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })
    console.log('Connected to MongoDB successfully!')
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  }
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close()
    console.log('Mongoose connection disconnected through app termination')
    process.exit(0)
  } catch (err) {
    console.error('Error during Mongoose connection closure:', err)
    process.exit(1)
  }
})

export default connectDB
