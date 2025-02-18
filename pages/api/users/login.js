// Next.js API route for login
// localhost:3000/api/users/login

import User from '../../../server/models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    })
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})
