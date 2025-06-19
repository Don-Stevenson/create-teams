#!/usr/bin/env node

/**
 * Script to create a test user in the database
 * Run this once to create a user for testing
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './server/.env' })
dotenv.config()

// Simple User schema - matching your model
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

const User = mongoose.model('User', UserSchema)

async function createTestUser() {
  try {
    // Connect to database
    const uri = process.env.ATLAS_URI
    if (!uri) {
      console.error('❌ ATLAS_URI not found in environment variables')
      console.log(
        'Make sure you have a .env file in the server directory with ATLAS_URI set'
      )
      process.exit(1)
    }

    console.log('🔌 Connecting to database...')
    await mongoose.connect(uri)
    console.log('✅ Connected to database')

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'testuser' })
    if (existingUser) {
      console.log('👥 User "testuser" already exists')
      console.log('You can log in with:')
      console.log('Username: testuser')
      console.log('Password: testpass123')
      return
    }

    // Create new user
    console.log('👤 Creating test user...')
    const newUser = new User({
      username: 'testuser',
      password: 'testpass123',
    })

    await newUser.save()
    console.log('✅ Test user created successfully!')
    console.log('')
    console.log('🎉 You can now log in with:')
    console.log('Username: testuser')
    console.log('Password: testpass123')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

createTestUser()
