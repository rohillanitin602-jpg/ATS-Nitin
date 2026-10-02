import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function JobDetails() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  const [applyState, setApplyState] = useState({ status: 'idle', message: '' })
  const [coverNote, setCoverNote] = useState('')

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then((res) => setJob(res.data)).catch(() => setError('Job not found.'))
  }, [jobId])

  const handleApply = async (e) => {
    e.preventDefault()
    setApplyState({ status: 'loading', message: '' })
    try {
      await api.post('/applications', { job_id: jobId, cover_note: coverNote })
      setApplyState({ status: 'success', message: 'Application submitted! Track it from My Applications.' })
    } catch (err) {
      setApplyState({ status: 'error', message: err.response?.data?.detail || 'Could not submit application.' })
    }
  }

  if (error) return <p className="text-red-300">{error}</p>
  if (!job) return <p className="text-mist/60">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/jobs" className="text-sm text-mist/60 hover:text-white">← Back to jobs</Link>

      <div className="card mt-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-white text-2xl">{job.title}</h1>
            <p className="text-mist/70 mt-1">{job.company} · {job.location}</p>
          </div>
          <span className="chip border-aqua-400/30 bg-aqua-400/10 text-aqua-400">{job.job_type}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {job.skills?.map((s) => (
            <span key={s} className="chip border-violet-400/30 bg-violet-400/10 text-violet-300">{s}</span>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm">
          <div className="neu rounded-xl p-4">
            <p className="text-mist/60 text-xs uppercase">Experience</p>
            <p className="text-white font-medium mt-1">{job.experience}</p>
          </div>
          <div className="neu rounded-xl p-4">
            <p className="text-mist/60 text-xs uppercase">Salary</p>
            <p className="text-white font-medium mt-1">{job.salary}</p>
          </div>
          <div className="neu rounded-xl p-4">
            <p className="text-mist/60 text-xs uppercase">Applicants</p>
            <p className="text-white font-medium mt-1">{job.applicants_count}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-display font-semibold text-white mb-2">About this role</h2>
          <p className="text-mist/80 whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        {user?.role === 'candidate' && (
          <div className="mt-8 pt-6 border-t border-white/5">
            {applyState.status === 'success' ? (
              <p className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">{applyState.message}</p>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                {applyState.status === 'error' && (
                  <p className="text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm">{applyState.message}</p>
                )}
                <label className="label">Cover note (optional)</label>
                <textarea className="field min-h-[100px]" placeholder="Why you're a great fit…" value={coverNote} onChange={(e) => setCoverNote(e.target.value)} />
                <button type="submit" disabled={applyState.status === 'loading'} className="btn-primary">
                  {applyState.status === 'loading' ? 'Submitting…' : 'Apply for this role'}
                </button>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <Link to="/login" className="btn-primary">Log in to apply</Link>
          </div>
        )}

        {user?.role === 'recruiter' && (
          <div className="mt-8 pt-6 border-t border-white/5 text-sm text-mist/60">
            You're viewing this as a recruiter. Manage applicants from <Link className="text-violet-300" to={`/recruiter/jobs/${job.id}/applicants`}>the applicants view</Link>.
          </div>
        )}
      </div>
    </div>
  )
}
