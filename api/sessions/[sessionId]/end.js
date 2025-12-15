import { updateSession } from '../../lib/supabase.js'
import { setCorsHeaders } from '../../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { sessionId } = req.query

  try {
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

    res.status(200).json({
      message: 'Session ended',
      session
    })
  } catch (error) {
    console.error('End session error:', error)
    res.status(500).json({ message: 'Failed to end session' })
  }
}

