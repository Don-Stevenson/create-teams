import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { isBlacklisted } from '../../../../lib/utils/tokenBlacklist'
import { isSessionValid } from '../../../../lib/utils/sessionStore'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    let token = cookieStore.get('token')?.value

    // If no cookie token, check for Authorization header (Bearer token)
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json(
          { message: 'Unauthenticated request' },
          { status: 401 }
        )
      }
      token = authHeader.split(' ')[1] // Format: "Bearer TOKEN"
    }

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthenticated request' },
        { status: 401 }
      )
    }

    // Check if token is blacklisted
    const blacklisted = isBlacklisted(token)
    if (blacklisted) {
      return NextResponse.json(
        { message: 'Token has been invalidated' },
        { status: 401 }
      )
    }

    // Check if session is valid
    const sessionValid = isSessionValid(token)
    if (!sessionValid) {
      return NextResponse.json(
        { message: 'Session has been invalidated' },
        { status: 401 }
      )
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      return NextResponse.json({
        success: true,
        message: 'Authenticated',
        userId: decoded.userId,
      })
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Token has expired' },
          { status: 401 }
        )
      }
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { message: 'Unauthenticated request' },
          { status: 401 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { message: 'Unauthenticated request' },
      { status: 500 }
    )
  }
}
