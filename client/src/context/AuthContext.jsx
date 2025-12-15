import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('doctorToken')
    const doctorData = localStorage.getItem('doctorData')
    
    if (token && doctorData) {
      try {
        setDoctor(JSON.parse(doctorData))
      } catch (e) {
        localStorage.removeItem('doctorToken')
        localStorage.removeItem('doctorData')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    const data = await response.json()
    localStorage.setItem('doctorToken', data.token)
    localStorage.setItem('doctorData', JSON.stringify(data.doctor))
    setDoctor(data.doctor)
    return data
  }

  const logout = () => {
    localStorage.removeItem('doctorToken')
    localStorage.removeItem('doctorData')
    setDoctor(null)
  }

  const getToken = () => localStorage.getItem('doctorToken')

  return (
    <AuthContext.Provider value={{ doctor, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
