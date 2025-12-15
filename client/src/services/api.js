const API_BASE = '/api'

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('doctorToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Session APIs
export async function createSession(patientEmail, patientName, gender) {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientEmail, patientName, gender })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create session')
  }
  
  return response.json()
}

export async function updateSession(sessionId, data) {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update session')
  }
  
  return response.json()
}

export async function endSession(sessionId, transcript, vapiCallId) {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, vapiCallId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to end session')
  }
  
  return response.json()
}

// Doctor APIs
export async function getSessions(status = null) {
  const params = status ? `?status=${status}` : ''
  const response = await fetch(`${API_BASE}/sessions${params}`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch sessions')
  }
  
  return response.json()
}

export async function getSession(sessionId) {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch session')
  }
  
  return response.json()
}

export async function getSessionInsights(sessionId) {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/insights`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch insights')
  }
  
  return response.json()
}

export async function generateInsights(sessionId) {
  const response = await fetch(`${API_BASE}/insights/generate/${sessionId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to generate insights')
  }
  
  return response.json()
}

// Auth APIs
export async function registerDoctor(email, password, name) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Registration failed')
  }
  
  return response.json()
}
