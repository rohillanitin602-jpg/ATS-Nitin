import React from 'react'

export default function StatCard({ label, value, accent = 'violet', icon }) {
  const accents = {
    violet: 'from-violet-400 to-violet-600 shadow-glow-violet',
    aqua: 'from-aqua-400 to-aqua-500 shadow-glow-aqua',
    amber: 'from-amber-400 to-orange-400',
  }
  return (
    <div className="neu rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${accents[accent]} grid place-items-center text-ink font-display font-bold text-lg`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-mist/70 uppercase tracking-wide truncate">{label}</p>
      </div>
    </div>
  )
}
