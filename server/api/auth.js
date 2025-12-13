import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createDoctor, getDoctorByEmail } from '../lib/supabase.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'doctor-assistant-secret-key'
const JWT_EXPIRES_IN = '7d'

// Register new doctor
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if doctor already exists
    const existing = await getDoctorByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create doctor
    const doctor = await createDoctor(email, passwordHash, name)

    // Generate token
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.status(201).json({
      message: 'Account created successfully',
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Failed to create account' })
  }
})

// Login doctor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Get doctor
    const doctor = await getDoctorByEmail(email)
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, doctor.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate token
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Verify token middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.doctor = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// Get current doctor
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const doctor = await getDoctorByEmail(req.doctor.email)
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    res.json({
      doctor: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name
      }
    })
  } catch (error) {
    console.error('Get doctor error:', error)
    res.status(500).json({ message: 'Failed to get doctor info' })
  }
})

export default router

