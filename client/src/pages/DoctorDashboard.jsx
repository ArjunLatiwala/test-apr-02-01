import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getSessions } from '../services/api'
import { format, formatDistanceToNow } from 'date-fns'

export default function DoctorDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { doctor, logout } = useAuth()
  const navigate = useNavigate()

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const data = await getSessions(filter === 'all' ? null : filter)
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [filter])

  const handleLogout = () => {
    logout()
    navigate('/doctor/login')
  }

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      session.patient_email?.toLowerCase().includes(query) ||
      session.patient_name?.toLowerCase().includes(query)
    )
  })

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    pending: sessions.filter(s => s.status === 'in_progress').length,
    flagged: sessions.filter(s => s.insights?.flagged_concerns?.length > 0).length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-accent-teal bg-accent-teal/20'
      case 'in_progress': return 'text-accent-gold bg-accent-gold/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="safe-area-top bg-[#1a1a2e]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold">Dashboard</h1>
            <p className="text-sm text-white/60">Welcome, Dr. {doctor?.name || 'Doctor'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4"
          >
            <Users className="w-5 h-5 text-primary-400 mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-white/60">Total Sessions</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4"
          >
            <CheckCircle className="w-5 h-5 text-accent-teal mb-2" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-white/60">Completed</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4"
          >
            <Clock className="w-5 h-5 text-accent-gold mb-2" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-white/60">In Progress</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4"
          >
            <AlertCircle className="w-5 h-5 text-accent-coral mb-2" />
            <p className="text-2xl font-bold">{stats.flagged}</p>
            <p className="text-xs text-white/60">Flagged</p>
          </motion.div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="input-field pl-10 py-2.5 text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
          <button
            onClick={fetchSessions}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
          {['all', 'completed', 'in_progress'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sessions found</p>
            </div>
          ) : (
            filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/doctor/session/${session.id}`}
                  className="block glass rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                          {session.patient_name || session.patient_email || 'Unknown Patient'}
                        </h3>
                        {session.insights?.flagged_concerns?.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-accent-coral" />
                        )}
                      </div>
                      <p className="text-sm text-white/60 truncate">
                        {session.patient_email}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(session.status)}`}>
                          {session.status === 'in_progress' ? 'In Progress' : session.status}
                        </span>
                        <span className="text-xs text-white/40">
                          {session.created_at && formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

