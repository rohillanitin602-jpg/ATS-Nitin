import React from 'react'
import { Link } from 'react-router-dom'

export default function JobCard({ job }) {
  return (
    <div className="card flex flex-col h-full hover:border-violet-400/40 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-white text-lg truncate">{job.title}</h3>
          <p className="text-sm text-mist/80 truncate">{job.company} · {job.location}</p>
        </div>
        <span className="chip border-aqua-400/30 bg-aqua-400/10 text-aqua-400 shrink-0">{job.job_type}</span>
      </div>

      <p className="text-sm text-mist/70 mt-3 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.skills?.slice(0, 4).map((s) => (
          <span key={s} className="chip border-violet-400/30 bg-violet-400/10 text-violet-300">{s}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs text-mist/60">
        <span>{job.experience} · {job.salary}</span>
        <span>{job.applicants_count} applicants</span>
      </div>

      <Link to={`/jobs/${job.id}`} className="btn-primary btn-block mt-4">
        View &amp; Apply
      </Link>
    </div>
  )
}
