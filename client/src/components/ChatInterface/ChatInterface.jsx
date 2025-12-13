import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatInterface({ 
  messages = [], 
  onSendMessage, 
  isActive = false,
  placeholder = "Type your response..." 
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && isActive) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 hide-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-white/10 text-white/90 rounded-bl-md'
                }`}
              >
                {message.role !== 'user' && (
                  <p className="text-xs text-primary-400 mb-1 font-medium">Digital Agent</p>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.isChat && (
                  <p className="text-[10px] text-white/40 mt-1">sent via chat</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isActive ? placeholder : "Start the call to chat"}
            disabled={!isActive}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isActive}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-600 
                       hover:bg-primary-700 disabled:bg-white/10 disabled:cursor-not-allowed 
                       transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

