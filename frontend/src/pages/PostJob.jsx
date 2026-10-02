import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote']
const EMPTY = { title: '', company: '', location: '', experience: '', salary: '', job_type: 'Full-time', skills: '', description: '' }

export default function PostJob() {
  const { jobId } = useParams()
  const isEdit = Boolean(jobId)
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobs/${jobId}`).then((res) => {
        const j = res.data
        setForm({ ...j, skills: (j.skills || []).join(', ') })
      })
    }
  }, [jobId, isEdit])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }
      if (isEdit) {
        await api.put(`/jobs/${jobId}`, payload)
      } else {
        await api.post('/jobs', payload)
      }
      navigate('/recruiter/jobs')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save the job posting.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-white text-2xl sm:text-3xl mb-6">
        {isEdit ? 'Edit job posting' : 'Post a new job'}
      </h1>

      {error && <p className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Job title</label>
            <input required className="field" value={form.title} onChange={update('title')} placeholder="Frontend Developer" />
          </div>
          <div>
            <label className="label">Company</label>
            <input required className="field" value={form.company} onChange={update('company')} placeholder="ABC Technologies" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input required className="field" value={form.location} onChange={update('location')} placeholder="Gurgaon" />
          </div>
          <div>
            <label className="label">Job type</label>
            <select className="field" value={form.job_type} onChange={update('job_type')}>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Experience</label>
            <input required className="field" value={form.experience} onChange={update('experience')} placeholder="0-2 years" />
          </div>
          <div>
            <label className="label">Salary</label>
            <input required className="field" value={form.salary} onChange={update('salary')} placeholder="5-8 LPA" />
          </div>
        </div>
        <div>
          <label className="label">Skills (comma separated)</label>
          <input className="field" value={form.skills} onChange={update('skills')} placeholder="React, JavaScript, HTML, CSS" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required className="field min-h-[140px]" value={form.description} onChange={update('description')} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary btn-block">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish job'}
        </button>
      </form>
    </div>
  )
}
