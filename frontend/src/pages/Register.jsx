import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [role, setRole] = useState('candidate')
  const [form, setForm] = useState({ name: '', email: '', password: '', company_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, role }
      if (role === 'candidate') delete payload.company_name
      const res = await api.post('/auth/register', payload)
      login(res.data)
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="glass-hairline rounded-3xl p-8">
        <h1 className="font-display font-bold text-white text-2xl mb-1">Create your account</h1>
        <p className="text-sm text-mist/70 mb-6">Choose how you'll use Hirely.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={role === 'candidate' ? 'btn-primary' : 'btn-neu'}
          >
            I'm a candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={role === 'recruiter' ? 'btn-aqua' : 'btn-neu'}
          >
            I'm a recruiter
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required className="field" value={form.name} onChange={update('name')} placeholder="Nitin Kumar" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="field" value={form.email} onChange={update('email')} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={6} className="field" value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
          </div>
          {role === 'recruiter' && (
            <div>
              <label className="label">Company name</label>
              <input required className="field" value={form.company_name} onChange={update('company_name')} placeholder="ABC Technologies" />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary btn-block mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-mist/60 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-violet-300 hover:text-violet-200 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
