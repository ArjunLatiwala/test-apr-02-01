import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'doctor-assistant-secret-key'

export function verifyToken(req) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return { error: 'Authentication required', status: 401 }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return { doctor: decoded }
  } catch (error) {
    return { error: 'Invalid or expired token', status: 403 }
  }
}

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// CORS headers helper
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
}

