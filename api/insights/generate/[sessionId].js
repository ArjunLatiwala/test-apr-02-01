import { getSession, createInsights, getInsights } from '../../lib/supabase.js'
import { generatePatientInsights } from '../../lib/openai.js'
import { verifyToken, setCorsHeaders } from '../../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify authentication
  const auth = verifyToken(req)
  if (auth.error) {
    return res.status(auth.status).json({ message: auth.error })
  }

  const { sessionId } = req.query

  try {
    // Get session data
    const session = await getSession(sessionId)
    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (!session.raw_transcript) {
      return res.status(400).json({ message: 'Session has no transcript to analyze' })
    }

    // Check if insights already exist
    const existingInsights = await getInsights(sessionId)
    
    // Generate insights from transcript
    const insights = await generatePatientInsights(session.raw_transcript, {
      patientEmail: session.patients?.email,
      patientName: session.patients?.name,
      gender: session.patients?.gender
    })

    // Store insights
    const storedInsights = await createInsights(sessionId, insights)

    res.status(200).json({
      message: existingInsights ? 'Insights regenerated' : 'Insights generated',
      insights: storedInsights
    })
  } catch (error) {
    console.error('Generate insights error:', error)
    res.status(500).json({ message: 'Failed to generate insights' })
  }
}

