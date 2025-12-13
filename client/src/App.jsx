import { Routes, Route, Navigate } from 'react-router-dom'
import PatientInterview from './pages/PatientInterview'
import DoctorLogin from './pages/DoctorLogin'
import DoctorDashboard from './pages/DoctorDashboard'
import SessionDetail from './pages/SessionDetail'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen gradient-bg">
        <Routes>
          {/* Patient Routes */}
          <Route path="/" element={<PatientInterview />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/session/:sessionId" 
            element={
              <ProtectedRoute>
                <SessionDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App

