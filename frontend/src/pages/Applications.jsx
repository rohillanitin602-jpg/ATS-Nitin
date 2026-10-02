import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const STATUS_STYLE = {
  applied: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  shortlisted: 'border-aqua-400/30 bg-aqua-400/10 text-aqua-400',
  interview: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
  selected: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-red-400/30 bg-red-400/10 text-red-300',
  withdrawn: 'border-white/20 bg-white/5 text-mist/70',
}

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/applications/mine').then((res) => setApplications(res.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleWithdraw = async (id) => {
    await api.put(`/applications/${id}/withdraw`)
    load()
  }

  return (
    <div>
      <h1 className="font-display font-bold text-white text-2xl sm:text-3xl mb-6">My applications</h1>

      {loading && <p className="text-mist/60">Loading…</p>}
      {!loading && applications.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-mist/70">You haven't applied to anything yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {applications.map((a) => (
          <div key={a.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{a.job_title}</p>
              <p className="text-xs text-mist/60 truncate">{a.company} · applied {new Date(a.applied_at).toLocaleDateString()}</p>
              {a.cover_note && <p className="text-xs text-mist/50 mt-1 line-clamp-1">"{a.cover_note}"</p>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`chip ${STATUS_STYLE[a.status]}`}>{a.status}</span>
              {a.status !== 'withdrawn' && a.status !== 'selected' && a.status !== 'rejected' && (
                <button onClick={() => handleWithdraw(a.id)} className="btn-ghost btn-sm">Withdraw</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
