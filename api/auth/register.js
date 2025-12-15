import bcrypt from 'bcryptjs'
import { createDoctor, getDoctorByEmail } from '../lib/supabase.js'
import { createToken, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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
    const token = createToken({ id: doctor.id, email: doctor.email })

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
}

