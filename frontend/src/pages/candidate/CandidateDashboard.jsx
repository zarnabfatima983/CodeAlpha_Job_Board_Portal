/**
 * Candidate Dashboard Overview
 * APIs:
 *   GET /api/candidates/dashboard/   → { total_applications, applications_by_status, total_resumes }
 *   GET /api/applications/my-applications/   → list of recent applications
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, CheckCircle, Clock, XCircle, Star,
  MessageSquare, Send, ArrowRight, Briefcase,
  TrendingUp, Upload, User, Eye,
} from 'lucide-react'
import { getCandidateDashboard } from '../../api/candidatesApi'
import { getMyApplications } from '../../api/applicationsApi'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import { timeAgo, getStatusConfig, mediaUrl, getInitials } from '../../utils/helpers'

const StatCard = ({ icon: Icon, label, value, color, bg, to }) => {
  const inner = (
    <div className={`card p-5 flex items-center gap-4 ${to ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={color} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

const CandidateDashboard = () => {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, appsRes] = await Promise.all([
          getCandidateDashboard(),
          getMyApplications(),
        ])
        setStats(dashRes.data?.data ?? dashRes.data)
        const apps = appsRes.data?.results ?? appsRes.data
        setRecent(Array.isArray(apps) ? apps.slice(0, 5) : [])
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading dashboard…" /></div>
  if (error)   return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const byStatus = stats?.applications_by_status || {}
  const avatarSrc = mediaUrl(user?.profile_picture)

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt={user?.full_name} className="h-14 w-14 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/20 font-bold text-xl flex items-center justify-center">
                {getInitials(user?.full_name)}
              </div>
            )}
          </div>
          <div>
            <p className="text-primary-200 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.full_name}</h1>
            <p className="text-primary-200 text-xs mt-0.5">{user?.email}</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-2">
            <Link to="/jobs" className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <Briefcase size={14} /> Find Jobs
            </Link>
            <Link to="/candidate/profile" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 text-xs px-3 py-1 rounded-lg transition-colors">
              <User size={12} /> View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Send}        label="Total Applied"  value={stats?.total_applications}       color="text-primary-600"  bg="bg-primary-50"  to="/candidate/applications" />
        <StatCard icon={Clock}       label="Under Review"   value={byStatus.under_review ?? 0}      color="text-yellow-600"   bg="bg-yellow-50" />
        <StatCard icon={Star}        label="Shortlisted"    value={byStatus.shortlisted ?? 0}       color="text-purple-600"   bg="bg-purple-50" />
        <StatCard icon={CheckCircle} label="Selected"       value={byStatus.selected ?? 0}          color="text-emerald-600"  bg="bg-emerald-50" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Interview Stage"  value={byStatus.interview ?? 0}  color="text-orange-600"  bg="bg-orange-50" />
        <StatCard icon={XCircle}       label="Not Selected"     value={byStatus.rejected ?? 0}   color="text-red-600"     bg="bg-red-50" />
        <StatCard icon={FileText}      label="Just Applied"     value={byStatus.applied ?? 0}    color="text-blue-600"    bg="bg-blue-50" />
        <StatCard icon={Upload}        label="Resumes"          value={stats?.total_resumes ?? 0} color="text-slate-600"  bg="bg-slate-100" to="/candidate/resumes" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center">
              <Send size={28} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">No applications yet.</p>
              <Link to="/jobs" className="btn-primary btn btn-sm mt-3 inline-flex">Browse Jobs</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((app) => {
                const sc = getStatusConfig(app.application_status)
                return (
                  <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={16} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {app.job_title || app.job?.title || 'Job'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {app.employer_name || app.job?.employer?.company_name || ''} · {timeAgo(app.applied_at)}
                      </p>
                    </div>
                    <Badge color={sc.color} dot>{sc.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-slate-900 mb-1">Quick Actions</h2>
          {[
            { to: '/jobs',                    icon: Briefcase,    label: 'Browse Open Jobs',      desc: 'Find your next opportunity',    color: 'text-primary-600', bg: 'bg-primary-50' },
            { to: '/candidate/applications',  icon: FileText,     label: 'My Applications',       desc: 'Track your application status', color: 'text-blue-600',    bg: 'bg-blue-50' },
            { to: '/candidate/resumes',       icon: Upload,       label: 'Manage Resumes',        desc: 'Upload or update your resume',  color: 'text-purple-600',  bg: 'bg-purple-50' },
            { to: '/candidate/profile',       icon: User,         label: 'Update Profile',        desc: 'Keep your profile fresh',       color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={color} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-primary-600 transition-colors">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-400 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CandidateDashboard
