import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Header({ title = 'Doctor Assistant', showBackButton = false, onBack }) {
  return (
    <header className="safe-area-top">
      <div className="flex items-center justify-between px-4 py-4">
        {showBackButton ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-8" />
        )}
        
        <div className="flex items-center gap-2">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h1 className="text-lg font-display font-semibold">{title}</h1>
        </div>
        
        <div className="w-8" />
      </div>
    </header>
  )
}

