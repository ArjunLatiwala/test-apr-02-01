import { motion } from 'framer-motion'

export default function StatsCard({ icon, value, label, delay = 0, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-primary-400',
    teal: 'text-accent-teal',
    gold: 'text-accent-gold',
    coral: 'text-accent-coral'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-4"
    >
      <div className={colorClasses[color]}>
        {icon}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </motion.div>
  )
}

