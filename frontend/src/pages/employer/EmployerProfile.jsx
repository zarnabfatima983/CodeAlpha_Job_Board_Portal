/**
 * Employer — Company Profile page.
 * APIs:
 *   GET    /api/employers/profile/   → { owner_info, company_name, ... }
 *   PATCH  /api/employers/profile/   → update (multipart for logo)
 *   PATCH  /api/auth/profile/        → update user name/phone/location/avatar
 *   POST   /api/auth/change-password/
 */

import { useState, useEffect, useRef } from 'react'
import {
  Building2, Globe, Users, MapPin, Mail, Phone,
  User, Edit2, Save, X, Camera, Lock, Eye, EyeOff,
  CheckCircle, Briefcase, Link as LinkIcon,
} from 'lucide-react'
import { getEmployerProfile, updateEmployerProfile } from '../../api/employersApi'
import { updateProfile, changePassword } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'
import { mediaUrl, getInitials, extractErrorMessage, COMPANY_SIZE_LABELS } from '../../utils/helpers'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import toast from 'react-hot-toast'

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+']

const Field = ({ label, value, icon: Icon }) => (
  <div>
    <dt className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-0.5">
      {Icon && <Icon size={12} />} {label}
    </dt>
    <dd className="text-sm text-slate-700 font-medium">{value || <span className="text-slate-400 font-normal italic">Not set</span>}</dd>
  </div>
)

const EmployerProfile = () => {
  const { user, updateUser } = useAuth()

  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving,   setSaving]   = useState(false)

  const [form, setForm] = useState({
    full_name: '', phone: '', location: '',
    company_name: '', company_description: '', website: '',
    industry: '', company_size: '', company_location: '',
  })

  const [logoFile,    setLogoFile]    = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const logoRef = useRef(null)

  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const avatarRef = useRef(null)

  const [pwForm,   setPwForm]   = useState({ old_password: '', new_password: '', new_password_confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwShow,   setPwShow]   = useState({})
  const [pwSaving, setPwSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getEmployerProfile()
      const p = res.data?.data ?? res.data
      setProfile(p)
      populateForm(p)
    } catch {
      setError('Failed to load company profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const populateForm = (p) => {
    setForm({
      full_name:           p.owner_info?.full_name   || user?.full_name   || '',
      phone:               p.owner_info?.phone       || user?.phone       || '',
      location:            p.owner_info?.location    || user?.location    || '',
      company_name:        p.company_name        || '',
      company_description: p.company_description || '',
      website:             p.website             || '',
      industry:            p.industry            || '',
      company_size:        p.company_size        || '',
      company_location:    p.location            || '',
    })
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.company_name.trim()) { toast.error('Company name is required.'); return }
    setSaving(true)
    try {
      // 1. Update user account
      const userFd = new FormData()
      userFd.append('full_name', form.full_name)
      if (form.phone)    userFd.append('phone',    form.phone)
      if (form.location) userFd.append('location', form.location)
      if (avatarFile)    userFd.append('profile_picture', avatarFile)
      const userRes = await updateProfile(userFd)
      updateUser(userRes.data?.data ?? userRes.data)

      // 2. Update employer profile
      const empFd = new FormData()
      empFd.append('company_name',        form.company_name)
      empFd.append('company_description', form.company_description)
      empFd.append('website',             form.website)
      empFd.append('industry',            form.industry)
      empFd.append('company_size',        form.company_size)
      empFd.append('location',            form.company_location)
      if (logoFile) empFd.append('company_logo', logoFile)
      await updateEmployerProfile(empFd)

      toast.success('Profile updated!')
      setEditMode(false)
      setLogoFile(null); setLogoPreview(null)
      setAvatarFile(null); setAvatarPreview(null)
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.old_password) errs.old_password = 'Current password required.'
    if (!pwForm.new_password || pwForm.new_password.length < 8) errs.new_password = 'New password must be ≥ 8 characters.'
    if (pwForm.new_password !== pwForm.new_password_confirm) errs.new_password_confirm = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setPwSaving(true)
    try {
      await changePassword(pwForm)
      toast.success('Password changed!')
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading profile…" /></div>
  if (error)   return <ErrorState message={error} onRetry={load} />

  const ownerInfo  = profile?.owner_info || user || {}
  const logoSrc    = logoPreview || mediaUrl(profile?.company_logo)
  const avatarSrc  = avatarPreview || mediaUrl(ownerInfo.profile_picture)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="btn-primary btn btn-sm flex items-center gap-1.5">
            <Edit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditMode(false); populateForm(profile) }} className="btn-secondary btn btn-sm">
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary btn btn-sm flex items-center gap-1.5">
              {saving ? <><span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : <><Save size={14} />Save</>}
            </button>
          </div>
        )}
      </div>

      {/* Company info */}
      <div className="card p-6 space-y-5">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Company logo */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={32} className="text-slate-300" strokeWidth={1.5} />
              )}
            </div>
            {editMode && (
              <>
                <button
                  onClick={() => logoRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700"
                  title="Change logo"
                >
                  <Camera size={13} />
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files[0]; if (!f) return
                  setLogoFile(f); setLogoPreview(URL.createObjectURL(f))
                }} />
              </>
            )}
          </div>

          {/* Company fields */}
          <div className="flex-1 min-w-0">
            {!editMode ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company Name"  value={profile?.company_name}  icon={Building2} />
                <Field label="Industry"       value={profile?.industry}      icon={Briefcase} />
                <Field label="Company Size"   value={COMPANY_SIZE_LABELS[profile?.company_size]} icon={Users} />
                <Field label="Location"       value={profile?.location}      icon={MapPin} />
                <div className="sm:col-span-2">
                  <Field label="Website" value={profile?.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{profile.website}</a> : null} icon={Globe} />
                </div>
                {profile?.company_description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-400 font-medium mb-1">About Company</dt>
                    <dd className="text-sm text-slate-600 leading-relaxed">{profile.company_description}</dd>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="label text-xs">Company Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.company_name} onChange={set('company_name')} className="input text-sm" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="label text-xs">Industry</label>
                  <input type="text" value={form.industry} onChange={set('industry')} className="input text-sm" placeholder="e.g. Software" />
                </div>
                <div>
                  <label className="label text-xs">Company Size</label>
                  <select value={form.company_size} onChange={set('company_size')} className="input text-sm">
                    <option value="">Select size…</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>{COMPANY_SIZE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Company Location</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" value={form.company_location} onChange={set('company_location')} className="input pl-8 text-sm" placeholder="City, Country" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Website</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="url" value={form.website} onChange={set('website')} className="input pl-8 text-sm" placeholder="https://company.com" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">About Company</label>
                  <textarea rows={3} value={form.company_description} onChange={set('company_description')} className="input resize-none text-sm" placeholder="Brief description of your company…" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <User size={16} className="text-primary-600" /> Account Info
        </h2>
        {!editMode ? (
          <div className="flex items-center gap-4">
            {avatarSrc ? (
              <img src={avatarSrc} alt={ownerInfo.full_name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                {getInitials(ownerInfo.full_name)}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4 flex-1">
              <Field label="Full Name" value={ownerInfo.full_name} icon={User} />
              <Field label="Email"     value={ownerInfo.email}     icon={Mail} />
              <Field label="Phone"     value={ownerInfo.phone}     icon={Phone} />
              <Field label="Location"  value={ownerInfo.location}  icon={MapPin} />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 flex-wrap">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                {avatarSrc ? <img src={avatarSrc} alt="" className="h-full w-full object-cover" /> : <span className="font-bold text-primary-700">{getInitials(form.full_name)}</span>}
              </div>
              <button onClick={() => avatarRef.current?.click()} className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-white flex items-center justify-center shadow">
                <Camera size={10} />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files[0]; if (!f) return
                setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f))
              }} />
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-3">
              <div><label className="label text-xs">Full Name</label><input type="text" value={form.full_name} onChange={set('full_name')} className="input text-sm" /></div>
              <div><label className="label text-xs">Phone</label><input type="tel" value={form.phone} onChange={set('phone')} className="input text-sm" placeholder="+1234567890" /></div>
              <div><label className="label text-xs">Location</label><input type="text" value={form.location} onChange={set('location')} className="input text-sm" /></div>
              <div><label className="label text-xs">Email</label><input type="email" value={ownerInfo.email} className="input text-sm bg-slate-50" disabled /></div>
            </div>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Lock size={16} className="text-primary-600" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
          {[
            { field: 'old_password',         label: 'Current Password' },
            { field: 'new_password',         label: 'New Password' },
            { field: 'new_password_confirm', label: 'Confirm Password' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="label text-xs">{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={pwShow[field] ? 'text' : 'password'}
                  value={pwForm[field]}
                  onChange={(e) => { setPwForm((p) => ({ ...p, [field]: e.target.value })); setPwErrors((p) => ({ ...p, [field]: '' })) }}
                  className={`input pl-8 pr-9 text-sm ${pwErrors[field] ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setPwShow((p) => ({ ...p, [field]: !p[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {pwShow[field] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pwErrors[field] && <p className="error-text">{pwErrors[field]}</p>}
            </div>
          ))}
          <button type="submit" disabled={pwSaving} className="btn-primary btn btn-sm flex items-center gap-1.5">
            {pwSaving ? <><span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : <><CheckCircle size={14} />Update Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmployerProfile
