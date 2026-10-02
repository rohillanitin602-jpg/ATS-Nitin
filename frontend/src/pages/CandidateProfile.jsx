import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ phone: '', headline: '', skills: '', experience_years: '', location: '', bio: '' })
  const [resumeFile, setResumeFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/candidates/me').then((res) => {
      const p = res.data
      setProfile(p)
      setForm({
        phone: p.phone || '', headline: p.headline || '',
        skills: (p.skills || []).join(', '), experience_years: p.experience_years ?? '',
        location: p.location || '', bio: p.bio || '',
      })
    })
  }, [])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience_years: form.experience_years === '' ? null : Number(form.experience_years),
      }
      const res = await api.put('/candidates/me', payload)
      setProfile(res.data)
      setMessage('Profile updated.')
    } catch {
      setMessage('Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!resumeFile) return
    const data = new FormData()
    data.append('file', resumeFile)
    try {
      const res = await api.post('/candidates/me/resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile(res.data)
      setMessage('Resume uploaded.')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Resume upload failed.')
    }
  }

  if (!profile) return <p className="text-mist/60">Loading…</p>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-white text-2xl sm:text-3xl mb-6">Your profile</h1>

      {message && <p className="mb-4 text-sm text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-3">{message}</p>}

      <div className="card mb-6">
        <h2 className="font-display font-semibold text-white mb-4">Resume</h2>
        <p className="text-sm text-mist/70 mb-3">
          {profile.resume_filename ? 'Resume on file — upload a new PDF to replace it.' : 'No resume uploaded yet.'}
        </p>
        <form onSubmit={handleResumeUpload} className="flex flex-col sm:flex-row gap-3">
          <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="field flex-1" />
          <button type="submit" className="btn-aqua">Upload PDF</button>
        </form>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="field" value={form.phone} onChange={update('phone')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="field" value={form.location} onChange={update('location')} />
          </div>
        </div>
        <div>
          <label className="label">Headline</label>
          <input className="field" placeholder="Frontend Developer with 2 years experience" value={form.headline} onChange={update('headline')} />
        </div>
        <div>
          <label className="label">Skills (comma separated)</label>
          <input className="field" placeholder="React, JavaScript, CSS" value={form.skills} onChange={update('skills')} />
        </div>
        <div>
          <label className="label">Years of experience</label>
          <input type="number" step="0.5" min="0" className="field" value={form.experience_years} onChange={update('experience_years')} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="field min-h-[100px]" value={form.bio} onChange={update('bio')} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
