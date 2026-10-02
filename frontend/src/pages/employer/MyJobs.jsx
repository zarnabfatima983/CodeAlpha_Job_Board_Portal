/**
 * Employer — My Jobs page.
 * APIs:
 *   GET    /api/jobs/my-jobs/
 *   DELETE /api/jobs/<id>/
 *   PATCH  /api/jobs/<id>/   (toggle status open/closed)
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase, Edit2, Trash2, Users, Eye,
  PlusSquare, Search, RefreshCw, ToggleLeft,
  ToggleRight, MapPin, Clock, DollarSign,
} from 'lucide-react'
import { getMyJobs, deleteJob, updateJob } from '../../api/jobsApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { timeAgo, formatSalary, getEmploymentLabel } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MyJobs = () => {
  const navigate = useNavigate()
  const [jobs,      setJobs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId,  setDeleteId]  = useState(null)
  const [deleting,  setDeleting]  = useState(false)
  const [toggling,  setToggling]  = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyJobs()
      setJobs(res.data?.results ?? res.data ?? [])
    } catch {
      toast.error('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteJob(deleteId)
      setJobs((prev) => prev.filter((j) => j.id !== deleteId))
      toast.success('Job deleted.')
    } catch {
      toast.error('Failed to delete job.')
    } finally {
      setDeleting(false); setDeleteId(null)
    }
  }

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open'
    setToggling(job.id)
    try {
      await updateJob(job.id, { status: newStatus })
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: newStatus } : j))
      toast.success(`Job marked as ${newStatus}.`)
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setToggling(null)
    }
  }

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || j.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading jobs…" /></div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary btn btn-sm flex items-center gap-1.5">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/employer/post-job" className="btn-primary btn btn-sm flex items-center gap-1.5">
            <PlusSquare size={14} /> Post New Job
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search job title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-sm w-full sm:w-40"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2">
        {[
          { value: '',       label: 'All',    count: jobs.length },
          { value: 'open',   label: 'Open',   count: jobs.filter((j) => j.status === 'open').length },
          { value: 'closed', label: 'Closed', count: jobs.filter((j) => j.status === 'closed').length },
        ].map((f) => (
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
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={jobs.length === 0 ? 'No jobs posted yet' : 'No matching jobs'}
          description={jobs.length === 0 ? 'Post your first job to start receiving applications.' : 'Try clearing your filters.'}
          action={jobs.length === 0 ? { label: 'Post First Job', onClick: () => navigate('/employer/post-job') } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job.id} className="card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <Badge color={job.status === 'open' ? 'green' : 'gray'} dot>
                      {job.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                    {job.remote_option && <Badge color="indigo">Remote</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} /> {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="text-xs text-slate-500">{getEmploymentLabel(job.employment_type)}</span>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DollarSign size={11} /> {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} /> {timeAgo(job.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <Users size={13} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">
                      {job.applications_count ?? 0} applicant{(job.applications_count ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn-secondary btn btn-sm flex items-center gap-1"
                    title="Preview job"
                  >
                    <Eye size={13} /> Preview
                  </Link>
                  <Link
                    to={`/employer/jobs/${job.id}/applicants`}
                    className="btn-secondary btn btn-sm flex items-center gap-1"
                    title="View applicants"
                  >
                    <Users size={13} /> Applicants
                  </Link>
                  <Link
                    to={`/employer/jobs/${job.id}/edit`}
                    className="btn-secondary btn btn-sm flex items-center gap-1"
                    title="Edit job"
                  >
                    <Edit2 size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(job)}
                    disabled={toggling === job.id}
                    className="btn-ghost btn btn-sm flex items-center gap-1 text-slate-600"
                    title={job.status === 'open' ? 'Close job' : 'Reopen job'}
                  >
                    {toggling === job.id ? (
                      <span className="h-3.5 w-3.5 border-2 border-slate-400/40 border-t-slate-600 rounded-full animate-spin" />
                    ) : job.status === 'open' ? (
                      <ToggleRight size={15} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={15} className="text-slate-400" />
                    )}
                    {job.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => setDeleteId(job.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete job"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Job Posting?"
        message="This will permanently delete the job and all associated applications. This cannot be undone."
        confirmLabel="Delete Job"
      />
    </div>
  )
}

export default MyJobs
