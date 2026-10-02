/**
 * Employer Dashboard Overview
 * API: GET /api/employers/dashboard/
 * Response: { total_jobs, open_jobs, closed_jobs, total_applications, applications_by_status }
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, CheckCircle, XCircle, Clock,
  Star, MessageSquare, TrendingUp, PlusSquare,
  ArrowRight, List, Building2, Eye,
} from 'lucide-react'
import { getEmployerDashboard } from '../../api/employersApi'
import { getMyJobs } from '../../api/jobsApi'
import { getEmployerApplications } from '../../api/applicationsApi'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import { timeAgo, getStatusConfig, mediaUrl, getInitials } from '../../utils/helpers'

const StatCard = ({ icon: Icon, label, value, color, bg, to }) => {
  const inner = (
    <div className={`card p-5 flex items-center gap-4 ${to ? 'hover:shadow-md transition-shadow' : ''}`}>
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

const EmployerDashboard = () => {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [jobs,    setJobs]    = useState([])
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, jobsRes, appsRes] = await Promise.all([
          getEmployerDashboard(),
          getMyJobs(),
          getEmployerApplications(),
        ])
        setStats(dashRes.data?.data ?? dashRes.data)
        const j = jobsRes.data?.results ?? jobsRes.data
        setJobs(Array.isArray(j) ? j.slice(0, 5) : [])
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
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 flex-wrap">
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
            <p className="text-emerald-200 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.full_name}</h1>
            <p className="text-emerald-200 text-xs mt-0.5">Recruiter Dashboard</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-2">
            <Link to="/employer/post-job" className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <PlusSquare size={14} /> Post a Job
            </Link>
            <Link to="/employer/applicants" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 text-xs px-3 py-1 rounded-lg transition-colors">
              <Users size={12} /> View Applicants
            </Link>
          </div>
        </div>
      </div>

      {/* Job stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="Total Jobs"     value={stats?.total_jobs}         color="text-primary-600"  bg="bg-primary-50"  to="/employer/jobs" />
        <StatCard icon={CheckCircle} label="Open Jobs"      value={stats?.open_jobs}          color="text-emerald-600"  bg="bg-emerald-50" />
        <StatCard icon={XCircle}     label="Closed Jobs"    value={stats?.closed_jobs}        color="text-slate-600"    bg="bg-slate-100" />
        <StatCard icon={Users}       label="Total Applicants" value={stats?.total_applications} color="text-blue-600"   bg="bg-blue-50"   to="/employer/applicants" />
      </div>

      {/* Application status breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { key: 'applied',      label: 'New',          icon: Clock,         color: 'text-blue-600',   bg: 'bg-blue-50' },
          { key: 'under_review', label: 'Reviewing',    icon: Eye,           color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { key: 'shortlisted',  label: 'Shortlisted',  icon: Star,          color: 'text-purple-600', bg: 'bg-purple-50' },
          { key: 'interview',    label: 'Interview',    icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
          { key: 'selected',     label: 'Selected',     icon: CheckCircle,   color: 'text-emerald-600',bg: 'bg-emerald-50' },
          { key: 'rejected',     label: 'Rejected',     icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50' },
        ].map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="card p-4 flex flex-col items-center text-center gap-1">
            <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={17} className={color} strokeWidth={1.8} />
            </div>
            <p className="text-xl font-bold text-slate-900">{byStatus[key] ?? 0}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">My Recent Jobs</h2>
            <Link to="/employer/jobs" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="p-10 text-center">
              <Briefcase size={28} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">No jobs posted yet.</p>
              <Link to="/employer/post-job" className="btn-primary btn btn-sm mt-3 inline-flex">Post First Job</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{job.title}</p>
                    <p className="text-xs text-slate-500">{timeAgo(job.created_at)} · {job.applications_count ?? 0} applicants</p>
                  </div>
                  <Badge color={job.status === 'open' ? 'green' : 'gray'} dot>
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
                  <Link to={`/employer/jobs/${job.id}/applicants`} className="btn-ghost btn btn-sm px-2">
                    <Users size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent applications */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <Link to="/employer/applicants" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center">
              <Users size={28} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">No applications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((app) => {
                const sc = getStatusConfig(app.application_status)
                return (
                  <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                      {getInitials(app.candidate_name || 'C')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {app.candidate_name || 'Candidate'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {app.job_title || 'Job'} · {timeAgo(app.applied_at)}
                      </p>
                    </div>
                    <Badge color={sc.color} dot>{sc.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/employer/post-job',    icon: PlusSquare, label: 'Post New Job',      color: 'text-primary-600', bg: 'bg-primary-50' },
            { to: '/employer/jobs',        icon: Briefcase,  label: 'Manage Jobs',        color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { to: '/employer/applicants',  icon: Users,      label: 'Review Applicants',  color: 'text-blue-600',    bg: 'bg-blue-50' },
            { to: '/employer/profile',     icon: Building2,  label: 'Company Profile',    color: 'text-orange-600',  bg: 'bg-orange-50' },
          ].map(({ to, icon: Icon, label, color, bg }) => (
            <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
              <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={color} strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
              <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-500 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard
