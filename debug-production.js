#!/usr/bin/env node

/**
 * Production Debug Script
 * Run this to check your production deployment configuration for Next.js
 */

console.log('🔍 Next.js Production Debug Check\n')

// Check environment variables
console.log('1. Environment Variables:')
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')
console.log('   ATLAS_URI:', process.env.ATLAS_URI ? 'SET' : 'NOT SET')
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET')
console.log()

// Check URLs
console.log('2. Next.js API Routes:')
console.log('   API routes are served from: /api/*')
console.log('   Frontend and backend are now unified in Next.js')
console.log()

// Cookie settings
console.log('3. Cookie Settings:')
console.log('   Production cookies will be:')
console.log('   - secure: true (HTTPS only)')
console.log('   - sameSite: "lax" (same-site requests)')
console.log('   - httpOnly: true (JS cannot access)')
console.log()

console.log('🚀 Next Steps:')
console.log('1. Check your Vercel environment variables')
console.log('2. Verify JWT_SECRET and ATLAS_URI are set')
console.log('3. Check browser Network tab for API errors')
console.log('4. Check Vercel function logs for authentication errors')
console.log()

console.log('💡 Common Issues:')
console.log('- JWT_SECRET not set in Vercel')
console.log('- ATLAS_URI not set in Vercel')
console.log('- Database connection issues')
console.log('- Next.js API route configuration issues')
console.log('- HTTPS cookie issues')
