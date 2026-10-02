/**
 * Employer — Applicants management page.
 * APIs:
 *   GET   /api/applications/employer-applications/?job_id=&status=
 *   PATCH /api/applications/<id>/status/   → { application_status }
 *   GET   /api/jobs/my-jobs/               → populate job filter dropdown
 *
 * Valid statuses: applied, under_review, shortlisted, interview, selected, rejected
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Users, Filter, Search, RefreshCw, ChevronDown,
  Mail, Calendar, FileText, Eye, Download,
  User, Briefcase,
} from 'lucide-react'
import { getEmployerApplications, updateApplicationStatus } from '../../api/applicationsApi'
import { getMyJobs } from '../../api/jobsApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { timeAgo, formatDate, getStatusConfig, mediaUrl, getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'applied',      label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted',  label: 'Shortlisted' },
  { value: 'interview',    label: 'Interview' },
  { value: 'selected',     label: 'Selected' },
  { value: 'rejected',     label: 'Rejected' },
]

const Applicants = () => {
  const { jobId: routeJobId } = useParams()   // optional: /employer/jobs/:jobId/applicants

  const [applications, setApplications] = useState([])
  const [jobs,         setJobs]         = useState([])
  const [loading,      setLoading]      = useState(true)
  const [jobFilter,    setJobFilter]    = useState(routeJobId || '')
  const [statusFilter, setStatusFilter] = useState('')
  const [search,       setSearch]       = useState('')
  const [updating,     setUpdating]     = useState(null)
  const [expanded,     setExpanded]     = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (jobFilter)    params.job_id = jobFilter
      if (statusFilter) params.status = statusFilter

      const [appsRes, jobsRes] = await Promise.all([
        getEmployerApplications(params),
        getMyJobs(),
      ])
      setApplications(appsRes.data?.results ?? appsRes.data ?? [])
      setJobs(jobsRes.data?.results ?? jobsRes.data ?? [])
    } catch {
      toast.error('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [jobFilter, statusFilter])

  const handleStatusChange = async (appId, newStatus) => {
    setUpdating(appId)
    try {
      await updateApplicationStatus(appId, newStatus)
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, application_status: newStatus } : a)
      )
      toast.success(`Status updated to "${STATUSES.find(s => s.value === newStatus)?.label}"`)
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = applications.filter((app) => {
    if (!search) return true
    const name  = (app.candidate_name  || '').toLowerCase()
    const email = (app.candidate_email || '').toLowerCase()
    const title = (app.job_title       || '').toLowerCase()
    return name.includes(search.toLowerCase()) ||
           email.includes(search.toLowerCase()) ||
           title.includes(search.toLowerCase())
  })

  const totalCount = filtered.length
  const jobName = routeJobId ? jobs.find((j) => String(j.id) === String(routeJobId))?.title : null

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading applicants…" /></div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {jobName ? `Applicants — ${jobName}` : 'All Applicants'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{totalCount} application{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="btn-secondary btn btn-sm flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or job…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        {!routeJobId && (
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="input text-sm w-full sm:w-52"
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-sm w-full sm:w-44"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !statusFilter ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All
          <span className={`h-4 w-4 rounded-full text-xs flex items-center justify-center ${!statusFilter ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {applications.length}
          </span>
        </button>
        {STATUSES.map((s) => {
          const count = applications.filter((a) => a.application_status === s.value).length
          const isActive = statusFilter === s.value
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.label}
              <span className={`h-4 w-4 rounded-full text-xs flex items-center justify-center ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Applicants list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants found"
          description={statusFilter ? 'No applications with this status.' : 'No one has applied yet. Make sure your jobs are open and visible.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const sc = getStatusConfig(app.application_status)
            const isExpanded = expanded === app.id
            const isUpdating = updating === app.id

            return (
              <div key={app.id} className="card overflow-hidden">
                {/* Main row */}
                <div className="p-4 flex items-center gap-4 flex-wrap">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                    {getInitials(app.candidate_name || 'C')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">
                        {app.candidate_name || 'Candidate'}
                      </p>
                      <Badge color={sc.color} dot>{sc.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {app.candidate_email && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail size={11} /> {app.candidate_email}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Briefcase size={11} /> {app.job_title || 'Job'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={11} /> Applied {timeAgo(app.applied_at)}
                      </span>
                    </div>
                  </div>

                  {/* Status changer */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <select
                        value={app.application_status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={isUpdating}
                        className="input text-xs py-1.5 pl-3 pr-7 w-36 appearance-none cursor-pointer"
                        title="Update status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {isUpdating ? (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border-2 border-primary-400/40 border-t-primary-600 rounded-full animate-spin" />
                      ) : (
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      )}
                    </div>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : app.id)}
                      className="btn-ghost btn btn-sm px-2"
                      title={isExpanded ? 'Collapse' : 'View details'}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50 bg-slate-50/50 animate-fade-in">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Applied For</p>
                        <p className="text-sm text-slate-700">{app.job_title || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Application Date</p>
                        <p className="text-sm text-slate-700">{formatDate(app.applied_at)}</p>
                      </div>
                      {app.cover_letter && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-slate-400 mb-1 font-medium">Cover Letter</p>
                          <p className="text-sm text-slate-600 leading-relaxed bg-white rounded-lg p-3 border border-slate-200 max-h-32 overflow-y-auto">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}
                      {app.resume && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1 font-medium">Resume</p>
                          <a
                            href={mediaUrl(app.resume?.resume_file || app.resume)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            <FileText size={13} /> View Resume
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Quick status buttons */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 w-full font-medium">Quick Update:</p>
                      {STATUSES.map((s) => {
                        const btnSc = getStatusConfig(s.value)
                        const COLOR_BTN = {
                          blue:   'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
                          yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200',
                          purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
                          orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200',
                          green:  'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
                          red:    'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
                          gray:   'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
                        }
                        const isCurrent = app.application_status === s.value
                        return (
                          <button
                            key={s.value}
                            onClick={() => !isCurrent && handleStatusChange(app.id, s.value)}
                            disabled={isCurrent || isUpdating}
                            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                              isCurrent
                                ? `${COLOR_BTN[btnSc.color]} ring-2 ring-offset-1 ring-current opacity-100`
                                : `${COLOR_BTN[btnSc.color]} opacity-70`
                            } disabled:cursor-not-allowed`}
                          >
                            {s.label} {isCurrent && '✓'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Applicants
