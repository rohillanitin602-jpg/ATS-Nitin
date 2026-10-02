import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const stats = [
  { label: 'Active job postings', value: '2,400+' },
  { label: 'Candidates hired monthly', value: '860' },
  { label: 'Avg. time to shortlist', value: '36 hrs' },
]

const steps = [
  { title: 'Build your profile', text: 'Candidates upload a resume once and apply everywhere with it.' },
  { title: 'Match with roles', text: 'Search and filter by skills, location, salary and experience.' },
  { title: 'Track every step', text: 'Follow an application from submitted to selected in real time.' },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative rounded-3xl overflow-hidden hero-grid py-16 sm:py-24 px-4 sm:px-10 glass">
        <div className="relative z-10 max-w-3xl">
          <span className="chip border-violet-400/30 bg-violet-400/10 text-violet-300 mb-5">
            Built for recruiters &amp; candidates
          </span>
          <h1 className="font-display font-bold text-white text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] leading-[1.05]">
            Hiring, tracked from
            <br className="hidden sm:block" /> first click to offer letter.
          </h1>
          <p className="mt-5 text-mist/80 max-w-xl text-[clamp(0.95rem,0.9rem+0.3vw,1.1rem)]">
            Hirely pairs a fast job search with a full applicant tracking workflow —
            so recruiters see every candidate move from applied to selected, and
            candidates always know where they stand.
          </p>

          <form onSubmit={handleSearch} className="mt-8 glass-strong rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
            <input
              className="field !bg-transparent !border-white/10 flex-[2]"
              placeholder="Job title, company or skill"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input
              className="field !bg-transparent !border-white/10 flex-1"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button type="submit" className="btn-primary sm:w-auto w-full">Search jobs</button>
          </form>

          <div className="flex flex-wrap gap-6 mt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display font-bold text-2xl text-white">{s.value}</p>
                <p className="text-xs text-mist/60 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-16">
        <h2 className="font-display font-bold text-white text-2xl sm:text-3xl mb-8">How Hirely works</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="neu rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-aqua-500 grid place-items-center text-ink font-display font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-mist/70">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="mt-16 grid md:grid-cols-2 gap-5">
        <div className="card flex flex-col">
          <h3 className="font-display font-semibold text-white text-xl mb-2">I'm hiring</h3>
          <p className="text-sm text-mist/70 mb-5 flex-1">
            Post roles, screen resumes and move candidates through a pipeline with a live analytics dashboard.
          </p>
          <a href="/register" className="btn-aqua btn-block">Post a job</a>
        </div>
        <div className="card flex flex-col">
          <h3 className="font-display font-semibold text-white text-xl mb-2">I'm job hunting</h3>
          <p className="text-sm text-mist/70 mb-5 flex-1">
            Upload your resume once, apply to roles in a click, and track every application's status.
          </p>
          <a href="/register" className="btn-primary btn-block">Find a job</a>
        </div>
      </section>
    </div>
  )
}
