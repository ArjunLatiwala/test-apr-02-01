import { Router } from 'express'
import { getSession, createInsights, getInsights } from '../lib/supabase.js'
import { generatePatientInsights } from '../lib/openai.js'
import { authenticateToken } from './auth.js'

const router = Router()

// Generate insights for a session
router.post('/generate/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params

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

    res.json({
      message: existingInsights ? 'Insights regenerated' : 'Insights generated',
      insights: storedInsights
    })
  } catch (error) {
    console.error('Generate insights error:', error)
    res.status(500).json({ message: 'Failed to generate insights' })
  }
})

// Get insights for a session
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    
    const insights = await getInsights(sessionId)
    
    if (!insights) {
      return res.status(404).json({ message: 'Insights not found for this session' })
    }

    res.json({ insights })
  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({ message: 'Failed to fetch insights' })
  }
})

export default router

