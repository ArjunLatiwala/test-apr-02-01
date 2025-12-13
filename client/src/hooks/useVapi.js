import { useState, useEffect, useCallback, useRef } from 'react'
import Vapi from '@vapi-ai/web'

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY

export function useVapi() {
  const [vapi, setVapi] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState([])
  const [error, setError] = useState(null)
  const [callStatus, setCallStatus] = useState('idle') // idle, connecting, active, ended
  const [volumeLevel, setVolumeLevel] = useState(0)
  
  const callIdRef = useRef(null)

  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      console.warn('VAPI public key not configured')
      return
    }

    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY)
    
    // Connection events
    vapiInstance.on('call-start', () => {
      setIsConnected(true)
      setCallStatus('active')
      setError(null)
    })

    vapiInstance.on('call-end', () => {
      setIsConnected(false)
      setIsListening(false)
      setIsSpeaking(false)
      setCallStatus('ended')
      callIdRef.current = null
    })

    // Speech events
    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true)
      setIsListening(false)
    })

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false)
    })

    // Transcript events
    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        if (message.transcriptType === 'final') {
          setTranscript(prev => [
            ...prev,
            {
              role: message.role,
              text: message.transcript,
              timestamp: new Date().toISOString()
            }
          ])
        }
      } else if (message.type === 'conversation-update') {
        // Handle conversation updates if needed
      }
    })

    // Volume level for visualization
    vapiInstance.on('volume-level', (level) => {
      setVolumeLevel(level)
      if (level > 0.1) {
        setIsListening(true)
      }
    })

    // Error handling
    vapiInstance.on('error', (err) => {
      console.error('VAPI Error:', err)
      setError(err.message || 'An error occurred')
      setCallStatus('idle')
    })

    setVapi(vapiInstance)

    return () => {
      vapiInstance.stop()
    }
  }, [])

  const startCall = useCallback(async (assistantId, metadata = {}) => {
    if (!vapi) {
      setError('VAPI not initialized')
      return null
    }

    try {
      setCallStatus('connecting')
      setTranscript([])
      setError(null)

      const call = await vapi.start(assistantId, {
        metadata
      })
      
      callIdRef.current = call?.id
      return call
    } catch (err) {
      console.error('Failed to start call:', err)
      setError(err.message || 'Failed to start call')
      setCallStatus('idle')
      return null
    }
  }, [vapi])

  const endCall = useCallback(() => {
    if (vapi) {
      vapi.stop()
    }
  }, [vapi])

  const sendMessage = useCallback((message) => {
    if (vapi && isConnected) {
      vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: message
        }
      })
      
      // Add to local transcript
      setTranscript(prev => [
        ...prev,
        {
          role: 'user',
          text: message,
          timestamp: new Date().toISOString(),
          isChat: true
        }
      ])
    }
  }, [vapi, isConnected])

  const toggleMute = useCallback(() => {
    if (vapi) {
      const isMuted = vapi.isMuted()
      vapi.setMuted(!isMuted)
      return !isMuted
    }
    return false
  }, [vapi])

  return {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    callStatus,
    volumeLevel,
    callId: callIdRef.current,
    startCall,
    endCall,
    sendMessage,
    toggleMute
  }
}

