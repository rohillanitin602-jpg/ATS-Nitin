import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

const STATUS_FLOW = ['applied', 'shortlisted', 'interview', 'selected', 'rejected']

const STATUS_STYLE = {
  applied: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  shortlisted: 'border-aqua-400/30 bg-aqua-400/10 text-aqua-400',
  interview: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
  selected: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-red-400/30 bg-red-400/10 text-red-300',
  withdrawn: 'border-white/20 bg-white/5 text-mist/70',
}

export default function Applicants() {
  const { jobId } = useParams()
  const [applicants, setApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get(`/applications/job/${jobId}`).then((res) => setApplicants(res.data)).finally(() => setLoading(false))
    api.get(`/jobs/${jobId}`).then((res) => setJob(res.data))
  }

  useEffect(load, [jobId])

  const handleStatusChange = async (appId, status) => {
    await api.put(`/applications/${appId}/status`, { status })
    load()
  }

  const handleDownload = async (candidateId, candidateName) => {
    const res = await api.get(`/candidates/${candidateId}/resume`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `${candidateName.replace(/\s+/g, '_')}_resume.pdf`
    link.click()
  }

  return (
    <div>
      <h1 className="font-display font-bold text-white text-2xl sm:text-3xl mb-1">Applicants</h1>
      {job && <p className="text-mist/60 mb-6">{job.title} at {job.company}</p>}

      {loading && <p className="text-mist/60">Loading…</p>}
      {!loading && applicants.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-mist/70">No applicants yet for this role.</p>
        </div>
      )}

      <div className="space-y-3">
        {applicants.map((a) => (
          <div key={a.id} className="card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white font-medium">{a.candidate_name}</p>
              <p className="text-xs text-mist/60">{a.candidate_email} · applied {new Date(a.applied_at).toLocaleDateString()}</p>
              {a.cover_note && <p className="text-xs text-mist/50 mt-1 max-w-md">"{a.cover_note}"</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className={`chip ${STATUS_STYLE[a.status]}`}>{a.status}</span>
              {a.resume_filename && (
                <button onClick={() => handleDownload(a.candidate_id, a.candidate_name)} className="btn-glass btn-sm">
                  Download resume
                </button>
              )}
              <select
                className="field !w-auto !py-2 !px-3 text-sm"
                value={a.status}
                onChange={(e) => handleStatusChange(a.id, e.target.value)}
              >
                {[...STATUS_FLOW, 'withdrawn'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
