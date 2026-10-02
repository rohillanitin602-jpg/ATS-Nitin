import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import api from '../api/axios'
import StatCard from '../components/StatCard'

const PIE_COLORS = ['#8B7CFF', '#22D3EE', '#FFB454', '#4ADE80', '#FF6B6B', '#94A3B8']

export default function RecruiterDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/recruiter').then((res) => setData(res.data)).catch(() => {})
  }, [])

  if (!data) return <p className="text-mist/60">Loading dashboard…</p>

  const { kpis, applications_per_month, applications_by_job, status_distribution } = data

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display font-bold text-white text-2xl sm:text-3xl">Recruiter dashboard</h1>
        <Link to="/recruiter/jobs/new" className="btn-primary">+ Post a job</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label="Total jobs" value={kpis.total_jobs} icon="J" accent="violet" />
        <StatCard label="Applications" value={kpis.total_applications} icon="A" accent="aqua" />
        <StatCard label="Shortlisted" value={kpis.shortlisted} icon="S" accent="amber" />
        <StatCard label="Interviews" value={kpis.interviews} icon="I" accent="violet" />
        <StatCard label="Selected" value={kpis.selected} icon="✓" accent="aqua" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Applications per month</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={applications_per_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#B7BEDE" fontSize={12} />
              <YAxis stroke="#B7BEDE" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1A1F3B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#8B7CFF" strokeWidth={3} dot={{ fill: '#8B7CFF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Applications by job</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={applications_by_job}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="job" stroke="#B7BEDE" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#B7BEDE" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1A1F3B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="count" fill="#22D3EE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-white mb-4">Candidate status distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={status_distribution} dataKey="count" nameKey="status" innerRadius={60} outerRadius={95} paddingAngle={3}>
              {status_distribution.map((entry, i) => (
                <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1A1F3B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {status_distribution.map((s, i) => (
            <span key={s.status} className="flex items-center gap-1.5 text-xs text-mist/70">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              {s.status} ({s.count})
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
