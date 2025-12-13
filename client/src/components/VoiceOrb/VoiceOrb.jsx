import { motion } from 'framer-motion'

export default function VoiceOrb({ 
  isActive = false, 
  isSpeaking = false, 
  isListening = false,
  volumeLevel = 0,
  size = 'large' 
}) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-36 h-36',
    large: 'w-48 h-48'
  }

  const scale = isActive ? 1 + (volumeLevel * 0.15) : 1

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {isActive && (
        <>
          <motion.div
            className={`absolute ${sizeClasses[size]} rounded-full bg-primary-500/10`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className={`absolute ${sizeClasses[size]} rounded-full bg-primary-400/10`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.05, 0.2]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          />
        </>
      )}

      {/* Main orb container */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Gradient background */}
        <div 
          className={`absolute inset-0 rounded-full ${
            isActive 
              ? isSpeaking 
                ? 'orb-speaking' 
                : 'orb-active'
              : ''
          }`}
          style={{
            background: isActive
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 35%, #f64f59 70%, #ff6b6b 100%)'
              : 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)'
          }}
        />

        {/* Inner liquid effect */}
        <motion.div
          className="absolute inset-2 rounded-full overflow-hidden"
          style={{
            background: isActive
              ? 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}
        >
          {/* Animated waves inside */}
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 70% 70%, rgba(102, 126, 234, 0.4) 0%, transparent 50%)'
                }}
                animate={{
                  x: [0, 10, 0, -10, 0],
                  y: [0, -10, 0, 10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 30% 60%, rgba(118, 75, 162, 0.4) 0%, transparent 40%)'
                }}
                animate={{
                  x: [0, -15, 0, 15, 0],
                  y: [0, 15, 0, -15, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </>
          )}
        </motion.div>

        {/* Highlight */}
        <div 
          className="absolute top-3 left-4 w-1/4 h-1/4 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)'
          }}
        />

        {/* Status indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-accent-teal' : 'bg-white/30'
            }`}
            animate={isListening ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.div
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-accent-coral' : 'bg-white/30'
            }`}
            animate={isSpeaking ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Status text */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/60 whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {!isActive && 'Ready to start'}
        {isActive && isSpeaking && 'Speaking...'}
        {isActive && isListening && !isSpeaking && 'Listening...'}
        {isActive && !isListening && !isSpeaking && 'Processing...'}
      </motion.div>
    </div>
  )
}

