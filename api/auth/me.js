import { getDoctorByEmail } from '../lib/supabase.js'
import { verifyToken, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify authentication
  const auth = verifyToken(req)
  if (auth.error) {
    return res.status(auth.status).json({ message: auth.error })
  }

  try {
    const doctor = await getDoctorByEmail(auth.doctor.email)
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    res.status(200).json({
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
}

