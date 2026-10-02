/**
 * Job Detail page — full job info + apply modal for candidates.
 *
 * APIs:
 *   GET  /api/jobs/<id>/                  — public, no auth required
 *   GET  /api/resumes/                    — candidate: list resumes for apply modal
 *   POST /api/applications/apply/         — candidate: submit application
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, DollarSign, Briefcase, Clock, Calendar, Building2,
  Globe, Users, CheckCircle, ArrowLeft, Wifi, Tag,
  FileText, ExternalLink, AlertCircle, Send,
} from 'lucide-react'
import { getJobById } from '../../api/jobsApi'
import { applyForJob } from '../../api/applicationsApi'
import { getResumes } from '../../api/resumesApi'
import { useAuth } from '../../context/AuthContext'
import {
  formatSalary, getEmploymentLabel, timeAgo, formatDate,
  isDeadlinePassed, mediaUrl, extractErrorMessage,
} from '../../utils/helpers'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import toast from 'react-hot-toast'

const EMPLOYMENT_COLOR = {
  full_time: 'blue', part_time: 'green', contract: 'orange',
  freelance: 'purple', internship: 'indigo',
}

// ── Section block ─────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div>
    <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
      <span className="h-1 w-4 rounded-full bg-primary-600 inline-block" />
      {title}
    </h3>
    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{children}</div>
  </div>
)

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isCandidate } = useAuth()

  const [job,     setJob]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Apply modal state
  const [applyOpen,    setApplyOpen]    = useState(false)
  const [resumes,      setResumes]      = useState([])
  const [resumeId,     setResumeId]     = useState('')
  const [coverLetter,  setCoverLetter]  = useState('')
  const [applying,     setApplying]     = useState(false)
  const [applied,      setApplied]      = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getJobById(id)
        setJob(res.data)
      } catch {
        setError('Job not found or has been removed.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  // Load resumes when candidate opens apply modal
  const handleOpenApply = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } }); return }
    setApplyOpen(true)
    try {
      const res = await getResumes()
      setResumes(res.data.results ?? res.data)
    } catch {}
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    try {
      const payload = { job: Number(id) }
      if (resumeId)     payload.resume = Number(resumeId)
      if (coverLetter.trim()) payload.cover_letter = coverLetter.trim()

      await applyForJob(payload)
      setApplied(true)
      setApplyOpen(false)
      toast.success('Application submitted successfully! 🎉')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading job details…" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <ErrorState title="Job not found" message={error} />
      </div>
    )
  }

  const deadlinePassed = isDeadlinePassed(job.application_deadline)
  const isClosed = job.status === 'closed'
  const canApply = isCandidate && !isClosed && !deadlinePassed && !applied
  const logoSrc = mediaUrl(job.employer?.company_logo)
  const companyName = job.employer?.company_name || 'Company'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-page py-8">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job header card */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {logoSrc ? (
                    <img src={logoSrc} alt={companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 size={28} className="text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
                      <p className="text-slate-500 text-sm mt-0.5">{companyName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isClosed && <Badge color="red" dot>Closed</Badge>}
                      {deadlinePassed && !isClosed && <Badge color="red" dot>Deadline Passed</Badge>}
                      {!isClosed && !deadlinePassed && <Badge color="green" dot>Open</Badge>}
                      {job.remote_option && (
                        <Badge color="indigo">
                          <Wifi size={11} /> Remote
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-4 mt-3">
                    {job.location && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={13} className="text-slate-400" /> {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <Badge color={EMPLOYMENT_COLOR[job.employment_type] || 'gray'}>
                        {getEmploymentLabel(job.employment_type)}
                      </Badge>
                    )}
                    {job.category?.category_name && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Tag size={12} /> {job.category.category_name}
                      </span>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <DollarSign size={13} /> {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply button (mobile) */}
              <div className="mt-5 lg:hidden">
                <ApplyButton
                  canApply={canApply}
                  applied={applied}
                  isClosed={isClosed}
                  deadlinePassed={deadlinePassed}
                  isCandidate={isCandidate}
                  isAuthenticated={isAuthenticated}
                  onApply={handleOpenApply}
                />
              </div>
            </div>

            {/* Description */}
            <div className="card p-6 space-y-6">
              {job.description && (
                <Section title="Job Description">{job.description}</Section>
              )}
              {job.requirements && (
                <Section title="Requirements">{job.requirements}</Section>
              )}
              {job.responsibilities && (
                <Section title="Responsibilities">{job.responsibilities}</Section>
              )}
              {job.experience_required && (
                <Section title="Experience Required">{job.experience_required}</Section>
              )}
            </div>

            {/* Applications count */}
            {job.applications_count > 0 && (
              <p className="text-sm text-slate-400 px-1">
                <Users size={13} className="inline mr-1" />
                {job.applications_count} applicant{job.applications_count !== 1 ? 's' : ''} so far
              </p>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Apply card */}
            <div className="card p-5 space-y-4">
              <ApplyButton
                canApply={canApply}
                applied={applied}
                isClosed={isClosed}
                deadlinePassed={deadlinePassed}
                isCandidate={isCandidate}
                isAuthenticated={isAuthenticated}
                onApply={handleOpenApply}
              />

              {!isAuthenticated && (
                <p className="text-xs text-slate-500 text-center">
                  <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
                  {' '}or{' '}
                  <Link to="/register" className="text-primary-600 hover:underline">register</Link>
                  {' '}as a candidate to apply.
                </p>
              )}
            </div>

            {/* Job details card */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">Job Details</h3>
              <div className="space-y-3">
                {[
                  { icon: Briefcase, label: 'Job Type',  value: getEmploymentLabel(job.employment_type) },
                  { icon: MapPin,    label: 'Location',  value: job.location || 'Not specified' },
                  { icon: DollarSign,label: 'Salary',    value: formatSalary(job.salary_min, job.salary_max) },
                  { icon: Tag,       label: 'Category',  value: job.category?.category_name || 'Not specified' },
                  { icon: Clock,     label: 'Posted',    value: timeAgo(job.created_at) },
                  { icon: Calendar,  label: 'Deadline',  value: job.application_deadline ? formatDate(job.application_deadline) : 'No deadline' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-medium text-slate-700">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company card */}
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">About the Company</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {logoSrc ? (
                    <img src={logoSrc} alt={companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 size={18} className="text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{companyName}</p>
                  {job.employer?.industry && (
                    <p className="text-xs text-slate-500">{job.employer.industry}</p>
                  )}
                </div>
              </div>

              {job.employer?.company_description && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                  {job.employer.company_description}
                </p>
              )}

              <div className="space-y-2">
                {job.employer?.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} /> {job.employer.location}
                  </div>
                )}
                {job.employer?.company_size && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} /> {job.employer.company_size} employees
                  </div>
                )}
                {job.employer?.website && (
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    <Globe size={12} /> Visit website <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`Apply for: ${job.title}`}
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <span className="font-medium">{companyName}</span>
            {job.location && ` · ${job.location}`}
          </div>

          {/* Resume selector */}
          <div>
            <label className="label">Select Resume <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
            {resumes.length > 0 ? (
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="input"
              >
                <option value="">No resume (apply without resume)</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} — {r.file_size}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <AlertCircle size={15} />
                No resumes uploaded.{' '}
                <Link to="/candidate/resumes" className="underline font-medium" onClick={() => setApplyOpen(false)}>
                  Upload one first
                </Link>
              </div>
            )}
          </div>

          {/* Cover letter */}
          <div>
            <label className="label">
              Cover Letter <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              rows={4}
              className="input resize-none"
              placeholder="Tell the employer why you're a great fit for this role…"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={applying}>
              <Send size={14} /> Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Apply button component ────────────────────────────────────────────────────
const ApplyButton = ({ canApply, applied, isClosed, deadlinePassed, isCandidate, isAuthenticated, onApply }) => {
  if (applied) {
    return (
      <div className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
        <CheckCircle size={16} /> Application Submitted
      </div>
    )
  }
  if (isClosed || deadlinePassed) {
    return (
      <div className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-lg bg-slate-100 text-slate-500 text-sm font-medium">
        <AlertCircle size={16} /> {isClosed ? 'Job Closed' : 'Deadline Passed'}
      </div>
    )
  }
  if (!isAuthenticated) {
    return (
      <Link to="/login" className="btn-primary btn w-full justify-center">
        <Send size={15} /> Log in to Apply
      </Link>
    )
  }
  if (!isCandidate) {
    return (
      <div className="text-xs text-slate-500 text-center py-2">
        Only candidates can apply for jobs.
      </div>
    )
  }
  return (
    <Button variant="primary" className="w-full" onClick={onApply}>
      <Send size={15} /> Apply Now
    </Button>
  )
}

export default JobDetail
