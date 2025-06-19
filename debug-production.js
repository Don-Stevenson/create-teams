#!/usr/bin/env node

/**
 * Production Debug Script
 * Run this to check your production deployment configuration
 */

console.log('🔍 Production Debug Check\n')

// Check environment variables
console.log('1. Environment Variables:')
console.log(
  '   NEXT_PUBLIC_API_URL:',
  process.env.NEXT_PUBLIC_API_URL || 'NOT SET'
)
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')
console.log('   ATLAS_URI:', process.env.ATLAS_URI ? 'SET' : 'NOT SET')
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET')
console.log()

// Check URLs
console.log('2. Frontend/Backend URLs:')
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'
console.log('   Frontend expects backend at:', apiUrl + '/api')
console.log('   Is this your actual Render backend URL?')
console.log()

// CORS check
console.log('3. CORS Configuration:')
console.log('   Your backend allows these origins:')
console.log('   - http://localhost:3000')
console.log('   - https://create-teams.vercel.app')
console.log('   - https://*.vercel.app')
console.log('   - https://*.render.com')
console.log('   Make sure your frontend URL matches one of these patterns')
console.log()

// Cookie settings
console.log('4. Cookie Settings:')
console.log('   Production cookies will be:')
console.log('   - secure: true (HTTPS only)')
console.log('   - sameSite: "none" (cross-site requests allowed)')
console.log('   - httpOnly: true (JS cannot access)')
console.log()

console.log('🚀 Next Steps:')
console.log('1. Check your Vercel environment variables')
console.log('2. Check your Render environment variables')
console.log('3. Verify your frontend URL matches the CORS configuration')
console.log('4. Check browser Network tab for CORS errors')
console.log('5. Check backend logs for authentication errors')
console.log()

console.log('💡 Common Issues:')
console.log('- NEXT_PUBLIC_API_URL not set in Vercel')
console.log('- JWT_SECRET not set in Render')
console.log('- ATLAS_URI not set in Render')
console.log('- Frontend URL not in CORS allowlist')
console.log('- HTTPS cookie issues')
