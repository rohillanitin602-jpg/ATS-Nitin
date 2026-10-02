import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import JobCard from '../components/JobCard'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote']

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [skill, setSkill] = useState('')
  const [jobType, setJobType] = useState('')

  const fetchJobs = useCallback(async (params) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/jobs', { params })
      setJobs(res.data)
    } catch (err) {
      setError('Could not load jobs. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs({
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = (e) => {
    e.preventDefault()
    const params = {}
    if (search) params.search = search
    if (location) params.location = location
    if (skill) params.skill = skill
    if (jobType) params.job_type = jobType
    setSearchParams(params)
    fetchJobs(params)
  }

  return (
    <div>
      <h1 className="font-display font-bold text-white text-2xl sm:text-3xl mb-6">Browse open roles</h1>

      <form onSubmit={handleFilter} className="glass rounded-2xl p-4 sm:p-5 grid sm:grid-cols-5 gap-3 mb-8">
        <input className="field sm:col-span-2" placeholder="Title, company or skill" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="field" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="field" placeholder="Skill filter" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <select className="field" value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="">Any job type</option>
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="btn-primary sm:col-span-5">Apply filters</button>
      </form>

      {loading && <p className="text-mist/60">Loading jobs…</p>}
      {error && <p className="text-red-300">{error}</p>}
      {!loading && !error && jobs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-mist/70">No jobs match your filters yet. Try widening your search.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  )
}
