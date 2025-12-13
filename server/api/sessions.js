import { Router } from 'express'
import { 
  createPatient, 
  createSession, 
  updateSession, 
  getSession, 
  getSessions,
  getInsights 
} from '../lib/supabase.js'
import { authenticateToken } from './auth.js'

const router = Router()

// Create new session (patient-facing, no auth required)
router.post('/', async (req, res) => {
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
})

// End session and save transcript (patient-facing)
router.post('/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { transcript, vapiCallId } = req.body

    // Format transcript for storage
    let rawTranscript = transcript
    if (Array.isArray(transcript)) {
      rawTranscript = transcript.map(msg => ({
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp
      }))
    }

    const session = await updateSession(sessionId, {
      status: 'completed',
      raw_transcript: rawTranscript,
      vapi_call_id: vapiCallId,
      ended_at: new Date().toISOString()
    })

    res.json({
      message: 'Session ended',
      session
    })
  } catch (error) {
    console.error('End session error:', error)
    res.status(500).json({ message: 'Failed to end session' })
  }
})

// Update session
router.patch('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const updates = req.body

    // Only allow certain fields to be updated
    const allowedUpdates = ['status', 'answers', 'vapi_call_id']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    const session = await updateSession(sessionId, filteredUpdates)

    res.json({
      message: 'Session updated',
      session
    })
  } catch (error) {
    console.error('Update session error:', error)
    res.status(500).json({ message: 'Failed to update session' })
  }
})

// Get sessions (doctor-facing, auth required)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query
    
    const sessions = await getSessions(null, status)

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

    res.json({ sessions: formattedSessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({ message: 'Failed to fetch sessions' })
  }
})

// Get single session (doctor-facing, auth required)
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    
    const session = await getSession(sessionId)
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    // Format response
    const formattedSession = {
      id: session.id,
      patient_id: session.patient_id,
      patient_email: session.patients?.email,
      patient_name: session.patients?.name,
      gender: session.patients?.gender,
      status: session.status,
      vapi_call_id: session.vapi_call_id,
      raw_transcript: session.raw_transcript,
      answers: session.answers,
      created_at: session.created_at,
      started_at: session.started_at,
      ended_at: session.ended_at,
      insights: session.insights?.[0] || null
    }

    res.json({ session: formattedSession })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({ message: 'Failed to fetch session' })
  }
})

// Get session insights
router.get('/:sessionId/insights', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    
    const insights = await getInsights(sessionId)
    
    if (!insights) {
      return res.status(404).json({ message: 'Insights not found' })
    }

    res.json({ insights })
  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({ message: 'Failed to fetch insights' })
  }
})

export default router

