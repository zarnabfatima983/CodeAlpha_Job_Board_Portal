/**
 * Post / Edit Job form (shared component).
 * Create: POST /api/jobs/
 * Edit:   PATCH /api/jobs/<id>/
 * Also:   GET /api/jobs/categories/
 *
 * Route usage:
 *   /employer/post-job              → create mode
 *   /employer/jobs/:id/edit         → edit mode (loads existing job)
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Briefcase, MapPin, DollarSign, Clock, Calendar,
  AlignLeft, List, ChevronDown, Wifi, Save, X,
} from 'lucide-react'
import { createJob, updateJob, getJobById, getCategories } from '../../api/jobsApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { extractErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const EMPLOYMENT_TYPES = [
  { value: '',           label: 'Select type…' },
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

const EMPTY_FORM = {
  title: '', description: '', requirements: '', responsibilities: '',
  category: '', location: '', employment_type: '', experience_required: '',
  salary_min: '', salary_max: '', remote_option: false,
  application_deadline: '', status: 'open',
}

const FormSection = ({ title, children }) => (
  <div className="card p-6 space-y-4">
    <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">{title}</h2>
    {children}
  </div>
)

const PostJob = () => {
  const navigate = useNavigate()
  const { id } = useParams()          // present only in edit mode
  const isEdit = !!id

  const [form,       setForm]       = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(isEdit)
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState({})

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(r.data?.results ?? r.data ?? []))
      .catch(() => {})

    if (isEdit) {
      getJobById(id)
        .then((r) => {
          const j = r.data
          // Format deadline for datetime-local input
          const deadline = j.application_deadline
            ? new Date(j.application_deadline).toISOString().slice(0, 16)
            : ''
          setForm({
            title:                  j.title || '',
            description:            j.description || '',
            requirements:           j.requirements || '',
            responsibilities:       j.responsibilities || '',
            category:               j.category?.id ? String(j.category.id) : '',
            location:               j.location || '',
            employment_type:        j.employment_type || '',
            experience_required:    j.experience_required || '',
            salary_min:             j.salary_min ? String(j.salary_min) : '',
            salary_max:             j.salary_max ? String(j.salary_max) : '',
            remote_option:          j.remote_option || false,
            application_deadline:   deadline,
            status:                 j.status || 'open',
          })
        })
        .catch(() => toast.error('Failed to load job data.'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [field]: val }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Job title is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (form.salary_min && form.salary_max && Number(form.salary_max) < Number(form.salary_min))
      errs.salary_max = 'Max salary must be ≥ min salary.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)

    try {
      const payload = {
        title:                form.title.trim(),
        description:          form.description.trim(),
        requirements:         form.requirements.trim() || undefined,
        responsibilities:     form.responsibilities.trim() || undefined,
        location:             form.location.trim() || undefined,
        employment_type:      form.employment_type || undefined,
        experience_required:  form.experience_required.trim() || undefined,
        remote_option:        form.remote_option,
        status:               form.status,
      }
      if (form.category)               payload.category = Number(form.category)
      if (form.salary_min)             payload.salary_min = Number(form.salary_min)
      if (form.salary_max)             payload.salary_max = Number(form.salary_max)
      if (form.application_deadline)   payload.application_deadline = new Date(form.application_deadline).toISOString()

      if (isEdit) {
        await updateJob(id, payload)
        toast.success('Job updated successfully!')
      } else {
        await createJob(payload)
        toast.success('Job posted successfully!')
      }
      navigate('/employer/jobs')
    } catch (err) {
      const msg = extractErrorMessage(err)
      toast.error(msg)
      // Map field-level errors
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const mapped = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : v
        }
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading job…" /></div>

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEdit ? 'Update your job posting details.' : 'Fill in the details to attract the right candidates.'}
          </p>
        </div>
        <button onClick={() => navigate('/employer/jobs')} className="btn-ghost btn btn-sm flex items-center gap-1">
          <X size={14} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Basic info */}
        <FormSection title="Basic Information">
          {/* Title */}
          <div>
            <label className="label">Job Title <span className="text-red-500">*</span></label>
            <div className="relative">
              <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Senior React Developer"
                className={`input pl-9 ${errors.title ? 'input-error' : ''}`}
              />
            </div>
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={set('category')} className="input">
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.category_name}</option>
                ))}
              </select>
            </div>

            {/* Employment type */}
            <div>
              <label className="label">Employment Type</label>
              <select value={form.employment_type} onChange={set('employment_type')} className="input">
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="label">Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                  placeholder="City, Country or Remote"
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="label">Experience Required</label>
              <div className="relative">
                <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.experience_required}
                  onChange={set('experience_required')}
                  placeholder="e.g. 3+ years"
                  className="input pl-9"
                />
              </div>
            </div>
          </div>

          {/* Remote toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.remote_option}
                onChange={set('remote_option')}
                className="sr-only"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${form.remote_option ? 'bg-primary-600' : 'bg-slate-300'}`} />
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.remote_option ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Wifi size={14} className={form.remote_option ? 'text-primary-600' : 'text-slate-400'} />
              Remote position
            </span>
          </label>
        </FormSection>

        {/* Salary + Deadline */}
        <FormSection title="Compensation & Deadline">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Min Salary ($)</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  value={form.salary_min}
                  onChange={set('salary_min')}
                  placeholder="50000"
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label">Max Salary ($)</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  value={form.salary_max}
                  onChange={set('salary_max')}
                  placeholder="120000"
                  className={`input pl-9 ${errors.salary_max ? 'input-error' : ''}`}
                />
              </div>
              {errors.salary_max && <p className="error-text">{errors.salary_max}</p>}
            </div>
            <div>
              <label className="label">Application Deadline</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={form.application_deadline}
                  onChange={set('application_deadline')}
                  min={new Date().toISOString().slice(0, 16)}
                  className="input pl-9 text-sm"
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Description */}
        <FormSection title="Job Description">
          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={6}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the role, company culture, and what makes this opportunity exciting…"
              className={`input resize-y ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>

          <div>
            <label className="label">Requirements</label>
            <textarea
              rows={4}
              value={form.requirements}
              onChange={set('requirements')}
              placeholder="List the skills, qualifications, and experience required…"
              className="input resize-y"
            />
          </div>

          <div>
            <label className="label">Responsibilities</label>
            <textarea
              rows={4}
              value={form.responsibilities}
              onChange={set('responsibilities')}
              placeholder="Describe the key responsibilities and day-to-day tasks…"
              className="input resize-y"
            />
          </div>
        </FormSection>

        {/* Status */}
        <FormSection title="Publishing">
          <div>
            <label className="label">Job Status</label>
            <div className="flex gap-3">
              {[
                { value: 'open',   label: 'Open — accepting applications', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
                { value: 'closed', label: 'Closed — not accepting', color: 'border-slate-400 bg-slate-50 text-slate-600' },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: s.value }))}
                  className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.status === s.value ? s.color : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex gap-3 justify-end pb-4">
          <button type="button" onClick={() => navigate('/employer/jobs')} className="btn-secondary btn">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary btn flex items-center gap-2 min-w-[140px] justify-center">
            {saving ? (
              <><span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Save size={15} /> {isEdit ? 'Save Changes' : 'Post Job'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostJob
