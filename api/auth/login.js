import bcrypt from 'bcryptjs'
import { getDoctorByEmail } from '../lib/supabase.js'
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
    const token = createToken({ id: doctor.id, email: doctor.email })

    res.status(200).json({
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
}

