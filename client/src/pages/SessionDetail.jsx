import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Brain,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  Calendar,
  Clock
} from 'lucide-react'
import { getSession, getSessionInsights, generateInsights } from '../services/api'
import { format } from 'date-fns'

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    concerns: true,
    risks: false,
    recommendations: false,
    transcript: false
  })

  useEffect(() => {
    fetchData()
  }, [sessionId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sessionData, insightsData] = await Promise.all([
        getSession(sessionId),
        getSessionInsights(sessionId).catch(() => null)
      ])
      setSession(sessionData.session)
      setInsights(insightsData?.insights)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true)
    try {
      const result = await generateInsights(sessionId)
      setInsights(result.insights)
    } catch (err) {
      console.error('Failed to generate insights:', err)
    } finally {
      setGeneratingInsights(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getRiskColor = (level) => {
    if (level >= 7) return 'text-accent-coral bg-accent-coral/20'
    if (level >= 4) return 'text-accent-gold bg-accent-gold/20'
    return 'text-accent-teal bg-accent-teal/20'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-white/60 mb-4">Session not found</p>
        <button onClick={() => navigate('/doctor/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="safe-area-top bg-[#1a1a2e]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold truncate">
              {session.patient_name || 'Patient Session'}
            </h1>
            <p className="text-sm text-white/60 truncate">{session.patient_email}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Gender</p>
                <p className="font-medium capitalize">{session.gender || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-teal/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-teal" />
              </div>
              <div>
                <p className="text-xs text-white/60">Date</p>
                <p className="font-medium">
                  {session.created_at && format(new Date(session.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <p className="text-xs text-white/60">Duration</p>
                <p className="font-medium">
                  {session.ended_at && session.started_at
                    ? `${Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000)} min`
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                session.status === 'completed' ? 'bg-accent-teal/20' : 'bg-accent-gold/20'
              }`}>
                <Activity className={`w-5 h-5 ${
                  session.status === 'completed' ? 'text-accent-teal' : 'text-accent-gold'
                }`} />
              </div>
              <div>
                <p className="text-xs text-white/60">Status</p>
                <p className="font-medium capitalize">{session.status}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Generate Insights Button */}
        {!insights && session.status === 'completed' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleGenerateInsights}
            disabled={generatingInsights}
            className="w-full btn-primary mb-6 flex items-center justify-center gap-2"
          >
            {generatingInsights ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generate AI Insights
              </>
            )}
          </motion.button>
        )}

        {/* Insights Sections */}
        {insights && (
          <div className="space-y-4">
            {/* Summary Section */}
            <CollapsibleSection
              title="Summary"
              icon={<FileText className="w-5 h-5" />}
              isExpanded={expandedSections.summary}
              onToggle={() => toggleSection('summary')}
            >
              <div className="space-y-3">
                {insights.summary && Object.entries(insights.summary).map(([section, content]) => (
                  <div key={section} className="border-l-2 border-primary-500/50 pl-3">
                    <h4 className="text-sm font-medium text-primary-400 capitalize mb-1">
                      {section.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-white/70">{content}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Flagged Concerns */}
            {insights.flagged_concerns?.length > 0 && (
              <CollapsibleSection
                title="Flagged Concerns"
                icon={<AlertTriangle className="w-5 h-5 text-accent-coral" />}
                badge={insights.flagged_concerns.length}
                badgeColor="bg-accent-coral"
                isExpanded={expandedSections.concerns}
                onToggle={() => toggleSection('concerns')}
              >
                <div className="space-y-2">
                  {insights.flagged_concerns.map((concern, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent-coral/10 border border-accent-coral/20"
                    >
                      <AlertTriangle className="w-4 h-4 text-accent-coral flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-accent-coral">{concern.type}</p>
                        <p className="text-sm text-white/70">{concern.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Risk Scores */}
            {insights.risk_scores && (
              <CollapsibleSection
                title="Risk Assessment"
                icon={<Activity className="w-5 h-5" />}
                isExpanded={expandedSections.risks}
                onToggle={() => toggleSection('risks')}
              >
                <div className="space-y-3">
                  {Object.entries(insights.risk_scores).map(([risk, score]) => (
                    <div key={risk} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{risk.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              score >= 7 ? 'bg-accent-coral' : score >= 4 ? 'bg-accent-gold' : 'bg-accent-teal'
                            }`}
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded ${getRiskColor(score)}`}>
                          {score}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && (
              <CollapsibleSection
                title="Recommendations"
                icon={<Brain className="w-5 h-5 text-primary-400" />}
                isExpanded={expandedSections.recommendations}
                onToggle={() => toggleSection('recommendations')}
              >
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 
                                     flex items-center justify-center flex-shrink-0 text-xs font-medium">
                        {index + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* Raw Transcript */}
        <CollapsibleSection
          title="Full Transcript"
          icon={<FileText className="w-5 h-5" />}
          isExpanded={expandedSections.transcript}
          onToggle={() => toggleSection('transcript')}
          className="mt-4"
        >
          {session.raw_transcript ? (
            <div className="space-y-3 max-h-96 overflow-y-auto hide-scrollbar">
              {typeof session.raw_transcript === 'string' 
                ? <p className="text-sm text-white/70 whitespace-pre-wrap">{session.raw_transcript}</p>
                : Array.isArray(session.raw_transcript) && session.raw_transcript.map((msg, index) => (
                    <div 
                      key={index}
                      className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <span className={`text-xs ${msg.role === 'user' ? 'text-primary-400' : 'text-accent-teal'}`}>
                        {msg.role === 'user' ? 'Patient' : 'Assistant'}
                      </span>
                      <p className={`text-sm ${msg.role === 'user' ? 'text-primary-300' : 'text-white/70'}`}>
                        {msg.text}
                      </p>
                    </div>
                  ))
              }
            </div>
          ) : (
            <p className="text-sm text-white/40">No transcript available</p>
          )}
        </CollapsibleSection>
      </main>
    </div>
  )
}

function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  isExpanded, 
  onToggle, 
  badge, 
  badgeColor = 'bg-primary-500',
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl overflow-hidden ${className}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{title}</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor} text-white`}>
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

