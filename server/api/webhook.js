import { Router } from 'express'
import { updateSession } from '../lib/supabase.js'
import { verifyWebhookSignature } from '../lib/vapi.js'
import { generatePatientInsights } from '../lib/openai.js'
import { createInsights } from '../lib/supabase.js'

const router = Router()
const WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET

// VAPI webhook handler
router.post('/', async (req, res) => {
  try {
    // Parse raw body
    const payload = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body)
    const signature = req.headers['x-vapi-signature']

    // Verify signature
    if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      console.warn('Invalid webhook signature')
      return res.status(401).json({ message: 'Invalid signature' })
    }

    const event = JSON.parse(payload)
    console.log('Webhook event:', event.type || event.message?.type)

    // Handle different event types
    const eventType = event.type || event.message?.type

    switch (eventType) {
      case 'call-start':
        await handleCallStart(event)
        break
      
      case 'call-end':
        await handleCallEnd(event)
        break
      
      case 'transcript':
        // Real-time transcript updates - can be used for live display
        break
      
      case 'status-update':
        await handleStatusUpdate(event)
        break

      case 'speech-update':
        // Speech events - can be used for debugging
        break

      default:
        console.log('Unhandled webhook event:', eventType)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
})

async function handleCallStart(event) {
  const { call } = event
  if (!call) return

  const sessionId = call.metadata?.sessionId
  if (!sessionId) {
    console.log('No session ID in call metadata')
    return
  }

  try {
    await updateSession(sessionId, {
      vapi_call_id: call.id,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    console.log(`Call started for session ${sessionId}`)
  } catch (error) {
    console.error('Failed to update session on call start:', error)
  }
}

async function handleCallEnd(event) {
  const { call } = event
  if (!call) return

  const sessionId = call.metadata?.sessionId
  if (!sessionId) {
    console.log('No session ID in call metadata')
    return
  }

  try {
    // Get transcript from the call
    const transcript = call.transcript || call.messages || []

    // Update session with final transcript
    await updateSession(sessionId, {
      status: 'completed',
      raw_transcript: transcript,
      ended_at: new Date().toISOString()
    })
    console.log(`Call ended for session ${sessionId}`)

    // Generate insights asynchronously
    if (transcript && transcript.length > 0) {
      generateAndStoreInsights(sessionId, transcript, call.metadata)
        .catch(err => console.error('Failed to generate insights:', err))
    }
  } catch (error) {
    console.error('Failed to update session on call end:', error)
  }
}

async function handleStatusUpdate(event) {
  const { call, status } = event
  if (!call) return

  const sessionId = call.metadata?.sessionId
  if (!sessionId) return

  // Map VAPI status to our status
  const statusMap = {
    'ringing': 'in_progress',
    'in-progress': 'in_progress',
    'forwarding': 'in_progress',
    'ended': 'completed'
  }

  const mappedStatus = statusMap[status] || status

  try {
    await updateSession(sessionId, { status: mappedStatus })
  } catch (error) {
    console.error('Failed to update session status:', error)
  }
}

async function generateAndStoreInsights(sessionId, transcript, metadata = {}) {
  try {
    console.log(`Generating insights for session ${sessionId}`)
    
    const insights = await generatePatientInsights(transcript, {
      patientEmail: metadata.patientEmail,
      patientName: metadata.patientName,
      gender: metadata.gender
    })

    await createInsights(sessionId, insights)
    console.log(`Insights generated and stored for session ${sessionId}`)
  } catch (error) {
    console.error('Failed to generate/store insights:', error)
  }
}

export default router

