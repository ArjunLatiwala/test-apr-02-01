// Vercel Serverless API Entry Point
import express from 'express'
import cors from 'cors'

// Import routes
import authRoutes from '../server/api/auth.js'
import sessionsRoutes from '../server/api/sessions.js'
import webhookRoutes from '../server/api/webhook.js'
import insightsRoutes from '../server/api/insights.js'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}))

// Parse JSON for all routes except webhook
app.use((req, res, next) => {
  if (req.path.startsWith('/api/webhook')) {
    express.raw({ type: 'application/json' })(req, res, next)
  } else {
    express.json()(req, res, next)
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/webhook', webhookRoutes)
app.use('/api/insights', insightsRoutes)

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

export default app

