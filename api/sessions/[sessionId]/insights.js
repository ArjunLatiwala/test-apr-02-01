import { getInsights } from '../../lib/supabase.js'
import { verifyToken, setCorsHeaders } from '../../lib/auth.js'

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

  const { sessionId } = req.query

  try {
    const insights = await getInsights(sessionId)
    
    if (!insights) {
      return res.status(404).json({ message: 'Insights not found' })
    }

    res.status(200).json({ insights })
  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({ message: 'Failed to fetch insights' })
  }
}

