/**
 * Candidate — My Applications page.
 * APIs:
 *   GET    /api/applications/my-applications/
 *   DELETE /api/applications/<id>/withdraw/   (only for applied|under_review)
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Calendar, Eye, Trash2,
  Filter, Search, RefreshCw,
} from 'lucide-react'
import { getMyApplications, withdrawApplication } from '../../api/applicationsApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { timeAgo, formatDate, getStatusConfig } from '../../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_FILTERS = [
  { value: '',             label: 'All' },
  { value: 'applied',      label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted',  label: 'Shortlisted' },
  { value: 'interview',    label: 'Interview' },
  { value: 'selected',     label: 'Selected' },
  { value: 'rejected',     label: 'Rejected' },
]

const MyApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search,       setSearch]       = useState('')
  const [withdrawId,   setWithdrawId]   = useState(null)
  const [withdrawing,  setWithdrawing]  = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyApplications()
      setApplications(res.data?.results ?? res.data ?? [])
    } catch {
      setError('Failed to load your applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleWithdraw = async () => {
    setWithdrawing(true)
    try {
      await withdrawApplication(withdrawId)
      setApplications((prev) => prev.filter((a) => a.id !== withdrawId))
      toast.success('Application withdrawn successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not withdraw application.')
    } finally {
      setWithdrawing(false)
      setWithdrawId(null)
    }
  }

  // Client-side filter
  const filtered = applications.filter((app) => {
    const matchStatus = !statusFilter || app.application_status === statusFilter
    const matchSearch = !search || (
      (app.job_title || app.job?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.employer_name || app.job?.employer?.company_name || '').toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchSearch
  })

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading applications…" /></div>
  if (error)   return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
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
            placeholder="Search by job title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-sm w-full sm:w-48"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Status tabs (pill pills) */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const count = f.value
            ? applications.filter((a) => a.application_status === f.value).length
            : applications.length
          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
              <span className={`h-4 w-4 rounded-full text-xs flex items-center justify-center ${statusFilter === f.value ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={statusFilter ? `No ${STATUS_FILTERS.find(f=>f.value===statusFilter)?.label} applications` : 'No applications yet'}
          description={statusFilter ? 'Try a different status filter.' : 'Start applying to jobs to track your progress here.'}
          action={!statusFilter ? { label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const sc = getStatusConfig(app.application_status)
            const canWithdraw = ['applied', 'under_review'].includes(app.application_status)
            const jobTitle    = app.job_title    || app.job?.title    || 'Job'
            const company     = app.employer_name || app.job?.employer?.company_name || ''
            const location    = app.job?.location || ''
            const jobId       = app.job?.id || (typeof app.job === 'number' ? app.job : null)

            return (
              <div key={app.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Job icon */}
                <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-slate-400" strokeWidth={1.5} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-sm">{jobTitle}</h3>
                    <Badge color={sc.color} dot>{sc.label}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {company && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Briefcase size={11} /> {company}
                      </span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} /> {location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} /> Applied {timeAgo(app.applied_at)}
                    </span>
                  </div>
                  {app.cover_letter && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">"{app.cover_letter}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {jobId && (
                    <Link
                      to={`/jobs/${jobId}`}
                      className="btn-secondary btn btn-sm flex items-center gap-1"
                      title="View job"
                    >
                      <Eye size={13} /> View
                    </Link>
                  )}
                  {canWithdraw && (
                    <button
                      onClick={() => setWithdrawId(app.id)}
                      className="btn-danger btn btn-sm flex items-center gap-1"
                      title="Withdraw application"
                    >
                      <Trash2 size={13} /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm withdraw */}
      <ConfirmDialog
        isOpen={!!withdrawId}
        onClose={() => setWithdrawId(null)}
        onConfirm={handleWithdraw}
        loading={withdrawing}
        title="Withdraw Application?"
        message="This will permanently remove your application. You can re-apply if the job is still open."
        confirmLabel="Withdraw"
      />
    </div>
  )
}

export default MyApplications
