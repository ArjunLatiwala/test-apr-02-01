import { createPatient, createSession, getSessions } from '../lib/supabase.js'
import { verifyToken, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // POST - Create new session (no auth required - patient facing)
  if (req.method === 'POST') {
    try {
      const { patientEmail, patientName, gender } = req.body

      if (!patientEmail) {
        return res.status(400).json({ message: 'Patient email is required' })
      }

      // Create or get patient
      const patient = await createPatient(patientEmail, patientName, gender)

      // Create session
      const session = await createSession(patient.id)

      res.status(201).json({
        message: 'Session created',
        id: session.id,
        patientId: patient.id,
        status: session.status
      })
    } catch (error) {
      console.error('Create session error:', error)
      res.status(500).json({ message: 'Failed to create session' })
    }
    return
  }

  // GET - List sessions (auth required - doctor facing)
  if (req.method === 'GET') {
    const auth = verifyToken(req)
    if (auth.error) {
      return res.status(auth.status).json({ message: auth.error })
    }

    try {
      const { status } = req.query
      const sessions = await getSessions(null, status || null)

      // Format response with patient info
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        patient_email: session.patients?.email,
        patient_name: session.patients?.name,
        gender: session.patients?.gender,
        status: session.status,
        created_at: session.created_at,
        ended_at: session.ended_at,
        insights: session.insights?.[0] || null
      }))

      res.status(200).json({ sessions: formattedSessions })
    } catch (error) {
      console.error('Get sessions error:', error)
      res.status(500).json({ message: 'Failed to fetch sessions' })
    }
    return
  }

  res.status(405).json({ message: 'Method not allowed' })
}

