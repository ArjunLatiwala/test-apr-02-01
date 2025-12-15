import { getSession, updateSession } from '../lib/supabase.js'
import { verifyToken, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { sessionId } = req.query

  // GET - Get single session (auth required)
  if (req.method === 'GET') {
    const auth = verifyToken(req)
    if (auth.error) {
      return res.status(auth.status).json({ message: auth.error })
    }

    try {
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

      res.status(200).json({ session: formattedSession })
    } catch (error) {
      console.error('Get session error:', error)
      res.status(500).json({ message: 'Failed to fetch session' })
    }
    return
  }

  // PATCH - Update session (no auth - can be called by patient or webhook)
  if (req.method === 'PATCH') {
    try {
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

      res.status(200).json({
        message: 'Session updated',
        session
      })
    } catch (error) {
      console.error('Update session error:', error)
      res.status(500).json({ message: 'Failed to update session' })
    }
    return
  }

  res.status(405).json({ message: 'Method not allowed' })
}

