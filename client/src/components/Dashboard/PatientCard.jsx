import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function PatientCard({ session, index = 0 }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-accent-teal" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-accent-gold" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-accent-teal bg-accent-teal/20'
      case 'in_progress':
        return 'text-accent-gold bg-accent-gold/20'
      default:
        return 'text-white/60 bg-white/10'
    }
  }

  const hasConcerns = session.insights?.flagged_concerns?.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/doctor/session/${session.id}`}
        className="block glass rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Patient name and flags */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate group-hover:text-primary-400 transition-colors">
                {session.patient_name || session.patient_email?.split('@')[0] || 'Unknown Patient'}
              </h3>
              {hasConcerns && (
                <span className="flex items-center gap-1 text-xs text-accent-coral bg-accent-coral/20 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  {session.insights.flagged_concerns.length}
                </span>
              )}
            </div>

            {/* Email */}
            <p className="text-sm text-white/60 truncate mb-2">
              {session.patient_email}
            </p>

            {/* Status and time */}
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                {session.status === 'in_progress' ? 'In Progress' : 
                 session.status === 'completed' ? 'Completed' : session.status}
              </span>
              
              {session.created_at && (
                <span className="text-xs text-white/40">
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  )
}

