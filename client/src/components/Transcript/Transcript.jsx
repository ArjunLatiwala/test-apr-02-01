import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function Transcript({ messages = [], isExpanded = false, onToggle }) {
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setAutoScroll(isAtBottom)
    }
  }

  if (!isExpanded) {
    return (
      <motion.button
        onClick={onToggle}
        className="w-full text-center py-3 text-white/60 hover:text-white/80 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm flex items-center justify-center gap-2">
          View full transcript
          <ChevronDown className="w-4 h-4" />
        </span>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-t border-white/10"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white/80">Transcript</span>
        <ChevronUp className="w-4 h-4 text-white/60" />
      </button>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="max-h-64 overflow-y-auto px-4 pb-4 space-y-3 hide-scrollbar"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-4">
              Transcript will appear here...
            </p>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className={`text-xs mb-1 ${
                  message.role === 'user' ? 'text-primary-400' : 'text-accent-teal'
                }`}>
                  {message.role === 'user' ? 'You' : 'Digital Agent'}
                </span>
                <p className={`text-sm ${
                  message.role === 'user' ? 'text-primary-300' : 'text-white/80'
                }`}>
                  {message.text}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

