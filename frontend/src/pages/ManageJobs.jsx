import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ManageJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/jobs', { params: { status: 'all' } }).then((res) => {
      setJobs(res.data.filter((j) => j.recruiter_id === user.id))
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting? This also removes its applications.')) return
    await api.delete(`/jobs/${id}`)
    load()
  }

  const toggleStatus = async (job) => {
    await api.put(`/jobs/${job.id}`, { status: job.status === 'active' ? 'closed' : 'active' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display font-bold text-white text-2xl sm:text-3xl">Manage jobs</h1>
        <Link to="/recruiter/jobs/new" className="btn-primary">+ Post a job</Link>
      </div>

      {loading && <p className="text-mist/60">Loading…</p>}
      {!loading && jobs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-mist/70 mb-4">You haven't posted any jobs yet.</p>
          <Link to="/recruiter/jobs/new" className="btn-primary">Post your first job</Link>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium">{job.title}</p>
                <span className={`chip ${job.status === 'active' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/20 bg-white/5 text-mist/60'}`}>
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-mist/60 mt-1">{job.location} · {job.job_type} · {job.applicants_count} applicants</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn-glass btn-sm">Applicants</Link>
              <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn-neu btn-sm">Edit</Link>
              <button onClick={() => toggleStatus(job)} className="btn-aqua btn-sm">
                {job.status === 'active' ? 'Close' : 'Reopen'}
              </button>
              <button onClick={() => handleDelete(job.id)} className="btn-danger btn-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
