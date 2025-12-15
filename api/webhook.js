import { updateSession, createInsights } from './lib/supabase.js'
import { generatePatientInsights } from './lib/openai.js'

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for raw webhook payload
  },
}

// Helper to read raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Vapi-Signature')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get raw body for signature verification
    let payload
    if (typeof req.body === 'object') {
      payload = req.body
    } else {
      const rawBody = await getRawBody(req)
      payload = JSON.parse(rawBody)
    }

    const eventType = payload.type || payload.message?.type
    console.log('Webhook event:', eventType)

    // Handle different event types
    switch (eventType) {
      case 'call-start':
        await handleCallStart(payload)
        break
      
      case 'call-end':
        await handleCallEnd(payload)
        break
      
      case 'status-update':
        await handleStatusUpdate(payload)
        break

      default:
        console.log('Unhandled webhook event:', eventType)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
}

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

    // Generate insights asynchronously (fire and forget)
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

