import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, MessageSquare, Phone, PhoneOff } from 'lucide-react'
import Header from '../components/Header'
import VoiceOrb from '../components/VoiceOrb'
import ChatInterface from '../components/ChatInterface'
import Transcript from '../components/Transcript'
import { useVapi } from '../hooks/useVapi'
import { createSession, endSession } from '../services/api'

const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID

export default function PatientInterview() {
  const [step, setStep] = useState('welcome') // welcome, interview, complete
  const [patientEmail, setPatientEmail] = useState('')
  const [patientName, setPatientName] = useState('')
  const [gender, setGender] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState(null)

  const {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    callStatus,
    volumeLevel,
    startCall,
    endCall,
    sendMessage,
    toggleMute
  } = useVapi()

  // Handle call end
  useEffect(() => {
    if (callStatus === 'ended' && sessionId) {
      handleCallEnded()
    }
  }, [callStatus, sessionId])

  const handleStart = async () => {
    if (!patientEmail.trim()) {
      setError('Please enter your email')
      return
    }

    setError(null)
    
    try {
      // Create session in backend
      const session = await createSession(patientEmail, patientName, gender)
      setSessionId(session.id)
      setStep('interview')

      // Start VAPI call with metadata
      await startCall(ASSISTANT_ID, {
        sessionId: session.id,
        patientEmail,
        patientName,
        gender
      })
    } catch (err) {
      console.error('Failed to start:', err)
      setError(err.message || 'Failed to start interview')
    }
  }

  const handleEndCall = async () => {
    endCall()
  }

  const handleCallEnded = async () => {
    try {
      // Send final transcript to backend
      if (sessionId) {
        await endSession(sessionId, transcript)
      }
      setStep('complete')
    } catch (err) {
      console.error('Failed to save session:', err)
    }
  }

  const handleMuteToggle = () => {
    const newMuted = toggleMute()
    setIsMuted(newMuted)
  }

  const handleSendMessage = (message) => {
    sendMessage(message)
  }

  const handleReset = () => {
    setStep('welcome')
    setPatientEmail('')
    setPatientName('')
    setGender('')
    setSessionId(null)
    setShowChat(false)
    setShowTranscript(false)
    setIsMuted(false)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Doctor Assistant" />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-8"
            >
              <h2 className="text-3xl font-display font-bold mb-4">Welcome</h2>
              
              <div className="mb-8">
                <VoiceOrb isActive={false} size="large" />
              </div>

              <p className="text-white/60 text-center mb-8 max-w-sm">
                Hello. To prepare for your follow-up visit with the doctor, I'm going to ask you a series of questions about your health since your last appointment. Please answer as best you can.
              </p>

              <div className="w-full max-w-sm space-y-4">
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field"
                />
                
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your name (optional)"
                  className="input-field"
                />

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select gender (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>

                {error && (
                  <p className="text-accent-coral text-sm text-center">{error}</p>
                )}

                <button
                  onClick={handleStart}
                  className="btn-primary w-full"
                >
                  Start
                </button>
              </div>
            </motion.div>
          )}

          {/* Interview Screen */}
          {step === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Voice/Chat toggle area */}
              {!showChat ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                  <div className="mb-12">
                    <VoiceOrb
                      isActive={isConnected}
                      isSpeaking={isSpeaking}
                      isListening={isListening}
                      volumeLevel={volumeLevel}
                      size="large"
                    />
                  </div>

                  {/* Latest message display */}
                  {transcript.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-sm text-center mb-8"
                    >
                      <p className="text-xs text-primary-400 mb-2">
                        {transcript[transcript.length - 1].role === 'user' ? 'You' : 'Digital Agent'}
                      </p>
                      <p className="text-white/80 text-sm">
                        {transcript[transcript.length - 1].text}
                      </p>
                    </motion.div>
                  )}

                  {/* Transcript toggle */}
                  <Transcript
                    messages={transcript}
                    isExpanded={showTranscript}
                    onToggle={() => setShowTranscript(!showTranscript)}
                  />
                </div>
              ) : (
                <ChatInterface
                  messages={transcript}
                  onSendMessage={handleSendMessage}
                  isActive={isConnected}
                />
              )}

              {/* Bottom controls */}
              <div className="safe-area-bottom px-6 py-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4">
                  {/* View transcript / Chat toggle */}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {showChat ? 'View transcript' : 'View transcript'}
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {/* Mute button */}
                  <button
                    onClick={handleMuteToggle}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isMuted ? 'bg-accent-coral' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* End call button */}
                  <button
                    onClick={handleEndCall}
                    className="btn-danger flex items-center gap-2"
                  >
                    End
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete Screen */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-accent-teal/20 flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h2 className="text-3xl font-display font-bold mb-4">Thank you!</h2>
              
              <p className="text-white/60 text-center mb-8 max-w-sm">
                That is all the questions I have. The doctor has your responses and will be with you shortly.
              </p>

              <div className="w-full max-w-sm space-y-4">
                <input
                  type="email"
                  value={patientEmail}
                  readOnly
                  className="input-field bg-white/5"
                />
                
                <button
                  onClick={handleReset}
                  className="btn-primary w-full"
                >
                  Start New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

