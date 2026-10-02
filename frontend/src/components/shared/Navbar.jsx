/**
 * Navbar — responsive top navigation.
 *
 * Visitor:   Home | Jobs | Login | Register
 * Candidate: Home | Jobs | My Applications | Dashboard | Logout
 * Employer:  Home | My Jobs | Post Job | Dashboard | Logout
 */

import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Briefcase, Menu, X, ChevronDown, Bell, User,
  LogOut, LayoutDashboard, FileText, PlusSquare, List,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials, mediaUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'

const NavItem = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `text-sm font-medium px-1 py-2 transition-colors ${
        isActive
          ? 'text-primary-600'
          : 'text-slate-600 hover:text-slate-900'
      }`
    }
  >
    {children}
  </NavLink>
)

const Navbar = () => {
  const { isAuthenticated, user, logout, isEmployer, isCandidate } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setUserMenuOpen(false)
    setMobileOpen(false)
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const closeMobile = () => setMobileOpen(false)

  const avatarSrc = mediaUrl(user?.profile_picture)

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Briefcase size={16} className="text-white" strokeWidth={2.5} />
            </div>
            JobBoard
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/jobs">Jobs</NavItem>
            {isCandidate && (
              <>
                <NavItem to="/candidate/applications">My Applications</NavItem>
                <NavItem to="/candidate/dashboard">Dashboard</NavItem>
              </>
            )}
            {isEmployer && (
              <>
                <NavItem to="/employer/jobs">My Jobs</NavItem>
                <NavItem to="/employer/post-job">Post a Job</NavItem>
                <NavItem to="/employer/dashboard">Dashboard</NavItem>
              </>
            )}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-ghost btn text-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary btn text-sm">
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications bell */}
                <Link
                  to="/notifications"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user?.full_name}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                        {getInitials(user?.full_name)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      {isCandidate && (
                        <>
                          <Link
                            to="/candidate/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard size={15} className="text-slate-400" /> Dashboard
                          </Link>
                          <Link
                            to="/candidate/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <User size={15} className="text-slate-400" /> Profile
                          </Link>
                          <Link
                            to="/candidate/applications"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <FileText size={15} className="text-slate-400" /> My Applications
                          </Link>
                        </>
                      )}

                      {isEmployer && (
                        <>
                          <Link
                            to="/employer/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard size={15} className="text-slate-400" /> Dashboard
                          </Link>
                          <Link
                            to="/employer/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <User size={15} className="text-slate-400" /> Company Profile
                          </Link>
                          <Link
                            to="/employer/post-job"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <PlusSquare size={15} className="text-slate-400" /> Post a Job
                          </Link>
                          <Link
                            to="/employer/applicants"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <List size={15} className="text-slate-400" /> Applicants
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <nav className="container-page py-4 flex flex-col gap-1">
            <NavItem to="/" onClick={closeMobile}>Home</NavItem>
            <NavItem to="/jobs" onClick={closeMobile}>Jobs</NavItem>

            {isCandidate && (
              <>
                <NavItem to="/candidate/applications" onClick={closeMobile}>My Applications</NavItem>
                <NavItem to="/candidate/dashboard" onClick={closeMobile}>Dashboard</NavItem>
                <NavItem to="/candidate/profile" onClick={closeMobile}>Profile</NavItem>
                <NavItem to="/candidate/resumes" onClick={closeMobile}>Resumes</NavItem>
              </>
            )}

            {isEmployer && (
              <>
                <NavItem to="/employer/dashboard" onClick={closeMobile}>Dashboard</NavItem>
                <NavItem to="/employer/jobs" onClick={closeMobile}>My Jobs</NavItem>
                <NavItem to="/employer/post-job" onClick={closeMobile}>Post a Job</NavItem>
                <NavItem to="/employer/applicants" onClick={closeMobile}>Applicants</NavItem>
                <NavItem to="/employer/profile" onClick={closeMobile}>Company Profile</NavItem>
              </>
            )}

            <NavItem to="/notifications" onClick={closeMobile}>Notifications</NavItem>

            <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={closeMobile} className="btn-secondary btn w-full justify-center">
                    Log in
                  </Link>
                  <Link to="/register" onClick={closeMobile} className="btn-primary btn w-full justify-center">
                    Sign up
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="btn-danger btn w-full justify-center"
                >
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
