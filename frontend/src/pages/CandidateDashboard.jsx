import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import JobCard from '../components/JobCard'

const STATUS_LABEL = {
  applied: 'Applied', shortlisted: 'Shortlisted', interview: 'Interview',
  selected: 'Selected', rejected: 'Rejected', withdrawn: 'Withdrawn',
}

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    api.get('/applications/mine').then((res) => setApplications(res.data)).catch(() => {})
    api.get('/jobs', { params: { status: 'active' } }).then((res) => setJobs(res.data.slice(0, 3))).catch(() => {})
  }, [])

  const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})

  return (
    <div>
      <h1 className="font-display font-bold text-white text-2xl sm:text-3xl mb-6">Candidate dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Applications sent" value={applications.length} icon="A" accent="violet" />
        <StatCard label="Shortlisted" value={counts.shortlisted || 0} icon="S" accent="aqua" />
        <StatCard label="Interviews" value={counts.interview || 0} icon="I" accent="amber" />
        <StatCard label="Offers" value={counts.selected || 0} icon="O" accent="violet" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white text-xl">Recommended roles</h2>
        <Link to="/jobs" className="text-sm text-violet-300 hover:text-violet-200">Browse all →</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white text-xl">Recent applications</h2>
        <Link to="/candidate/applications" className="text-sm text-violet-300 hover:text-violet-200">View all →</Link>
      </div>
      <div className="card divide-y divide-white/5">
        {applications.length === 0 && <p className="text-mist/60 py-4">No applications yet — go find something worth applying to.</p>}
        {applications.slice(0, 5).map((a) => (
          <div key={a.id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{a.job_title}</p>
              <p className="text-xs text-mist/60 truncate">{a.company}</p>
            </div>
            <span className="chip border-violet-400/30 bg-violet-400/10 text-violet-300 shrink-0">{STATUS_LABEL[a.status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
