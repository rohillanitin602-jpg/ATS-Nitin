import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkBase =
  'px-3 py-2 rounded-xl text-sm font-medium transition-colors'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-white text-lg">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-aqua-500 grid place-items-center text-ink text-base">
              H
            </span>
            Hirely
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/jobs" className={({ isActive }) => `${linkBase} ${isActive ? 'text-white bg-white/10' : 'text-mist hover:text-white hover:bg-white/5'}`}>
              Browse Jobs
            </NavLink>
            {user && (
              <NavLink to={dashboardPath} className={({ isActive }) => `${linkBase} ${isActive ? 'text-white bg-white/10' : 'text-mist hover:text-white hover:bg-white/5'}`}>
                Dashboard
              </NavLink>
            )}
            {user?.role === 'candidate' && (
              <NavLink to="/candidate/applications" className={({ isActive }) => `${linkBase} ${isActive ? 'text-white bg-white/10' : 'text-mist hover:text-white hover:bg-white/5'}`}>
                My Applications
              </NavLink>
            )}
            {user?.role === 'recruiter' && (
              <NavLink to="/recruiter/jobs" className={({ isActive }) => `${linkBase} ${isActive ? 'text-white bg-white/10' : 'text-mist hover:text-white hover:bg-white/5'}`}>
                Manage Jobs
              </NavLink>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
                <Link to="/register" className="btn-primary btn-sm">Get started</Link>
              </>
            ) : (
              <>
                <span className="text-sm text-mist/80">Hi, {user.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-glass btn-sm">Log out</button>
              </>
            )}
          </div>

          <button
            className="md:hidden btn-neu btn-sm !min-h-[40px] !px-3"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </nav>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-2">
          <NavLink to="/jobs" onClick={() => setOpen(false)} className="btn-ghost btn-block justify-start">Browse Jobs</NavLink>
          {user && (
            <NavLink to={dashboardPath} onClick={() => setOpen(false)} className="btn-ghost btn-block justify-start">Dashboard</NavLink>
          )}
          {user?.role === 'candidate' && (
            <NavLink to="/candidate/applications" onClick={() => setOpen(false)} className="btn-ghost btn-block justify-start">My Applications</NavLink>
          )}
          {user?.role === 'recruiter' && (
            <NavLink to="/recruiter/jobs" onClick={() => setOpen(false)} className="btn-ghost btn-block justify-start">Manage Jobs</NavLink>
          )}
          {!user ? (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost btn-block">Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary btn-block">Get started</Link>
            </div>
          ) : (
            <button onClick={() => { setOpen(false); handleLogout(); }} className="btn-glass btn-block mt-2">Log out</button>
          )}
        </div>
      )}
    </header>
  )
}
