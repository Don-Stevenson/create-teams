import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '../../../lib/db/connection'
import User from '../../../lib/models/User'
import { createSession } from '../../../lib/utils/sessionStore'

export async function POST(request) {
  try {
    await connectDB()

    const { username, password } = await request.json()

    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    // Create session
    createSession(user._id, token)

    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({ success: true })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Set to false for localhost development
      sameSite: 'lax',
      maxAge: 3600000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
