/**
 * Candidate Profile page — view and edit personal + professional info.
 * APIs:
 *   GET    /api/candidates/profile/   → { user_info, title, experience, education, skills, skills_list, ... }
 *   PATCH  /api/candidates/profile/   → update candidate fields
 *   PATCH  /api/auth/profile/         → update user fields (name, phone, location, picture)
 *   POST   /api/auth/change-password/
 */

import { useState, useEffect, useRef } from 'react'
import {
  User, Mail, Phone, MapPin, Briefcase, BookOpen,
  Code, Link as LinkIcon, Github, Linkedin, Edit2,
  Save, X, Camera, Lock, Eye, EyeOff, CheckCircle,
} from 'lucide-react'
import { getCandidateProfile, updateCandidateProfile } from '../../api/candidatesApi'
import { updateProfile, changePassword } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'
import { mediaUrl, parseSkills, serializeSkills, extractErrorMessage, getInitials } from '../../utils/helpers'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import toast from 'react-hot-toast'

const Field = ({ label, value, icon: Icon }) => (
  <div>
    <dt className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-0.5">
      {Icon && <Icon size={12} />} {label}
    </dt>
    <dd className="text-sm text-slate-700 font-medium">{value || <span className="text-slate-400 font-normal italic">Not set</span>}</dd>
  </div>
)

const CandidateProfile = () => {
  const { user, updateUser } = useAuth()

  const [profile,   setProfile]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [editMode,  setEditMode]  = useState(false)
  const [saving,    setSaving]    = useState(false)

  // Editable form state
  const [form, setForm] = useState({
    full_name: '', phone: '', location: '',
    title: '', experience: '', education: '',
    skills: '', portfolio_link: '', linkedin: '', github: '',
  })

  // Avatar upload
  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileRef = useRef(null)

  // Password change
  const [pwForm,   setPwForm]   = useState({ old_password: '', new_password: '', new_password_confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwShow,   setPwShow]   = useState({})
  const [pwSaving, setPwSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCandidateProfile()
      const p = res.data?.data ?? res.data
      setProfile(p)
      populateForm(p)
    } catch {
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const populateForm = (p) => {
    setForm({
      full_name:      p.user_info?.full_name   || user?.full_name   || '',
      phone:          p.user_info?.phone       || user?.phone       || '',
      location:       p.user_info?.location    || user?.location    || '',
      title:          p.title          || '',
      experience:     p.experience     || '',
      education:      p.education      || '',
      skills:         p.skills_list ? p.skills_list.join(', ') : (p.skills || ''),
      portfolio_link: p.portfolio_link || '',
      linkedin:       p.linkedin       || '',
      github:         p.github         || '',
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Update user account fields (name, phone, location, avatar)
      const userFd = new FormData()
      userFd.append('full_name', form.full_name)
      userFd.append('phone',     form.phone)
      userFd.append('location',  form.location)
      if (avatarFile) userFd.append('profile_picture', avatarFile)
      const userRes = await updateProfile(userFd)
      const updatedUser = userRes.data?.data ?? userRes.data
      updateUser(updatedUser)

      // 2. Update candidate profile fields
      await updateCandidateProfile({
        title:          form.title,
        experience:     form.experience,
        education:      form.education,
        skills:         form.skills,
        portfolio_link: form.portfolio_link,
        linkedin:       form.linkedin,
        github:         form.github,
      })

      toast.success('Profile updated successfully!')
      setEditMode(false)
      setAvatarFile(null)
      setAvatarPreview(null)
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
    if (!pwForm.old_password) errs.old_password = 'Current password is required.'
    if (!pwForm.new_password || pwForm.new_password.length < 8) errs.new_password = 'New password must be ≥ 8 characters.'
    if (pwForm.new_password !== pwForm.new_password_confirm) errs.new_password_confirm = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setPwSaving(true)
    try {
      await changePassword(pwForm)
      toast.success('Password changed successfully!')
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading profile…" /></div>
  if (error)   return <ErrorState message={error} onRetry={load} />

  const userInfo   = profile?.user_info || user || {}
  const avatarSrc  = avatarPreview || mediaUrl(userInfo.profile_picture)
  const skillsList = profile?.skills_list || parseSkills(profile?.skills)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="btn-primary btn btn-sm flex items-center gap-1.5">
            <Edit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditMode(false); populateForm(profile); setAvatarFile(null); setAvatarPreview(null) }} className="btn-secondary btn btn-sm">
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary btn btn-sm flex items-center gap-1.5">
              {saving ? <><span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : <><Save size={14} /> Save</>}
            </button>
          </div>
        )}
      </div>

      {/* Avatar + personal info */}
      <div className="card p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={userInfo.full_name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-600">{getInitials(userInfo.full_name)}</span>
              )}
            </div>
            {editMode && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700"
                  title="Change photo"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {/* Info fields */}
          <div className="flex-1 min-w-0">
            {!editMode ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name"  value={userInfo.full_name}  icon={User} />
                <Field label="Email"      value={userInfo.email}       icon={Mail} />
                <Field label="Phone"      value={userInfo.phone}       icon={Phone} />
                <Field label="Location"   value={userInfo.location}    icon={MapPin} />
                <Field label="Role"       value={<span className="capitalize">{userInfo.role}</span>} icon={Briefcase} />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { field: 'full_name', label: 'Full Name', icon: User, type: 'text' },
                  { field: 'phone',     label: 'Phone',     icon: Phone, type: 'tel', placeholder: '+1234567890' },
                  { field: 'location',  label: 'Location',  icon: MapPin, type: 'text', placeholder: 'City, Country' },
                ].map(({ field, label, icon: Icon, type, placeholder }) => (
                  <div key={field}>
                    <label className="label text-xs">{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={type}
                        value={form[field]}
                        onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="input pl-8 text-sm"
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="label text-xs">Email</label>
                  <input type="email" value={userInfo.email} className="input text-sm bg-slate-50" disabled title="Email cannot be changed" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Briefcase size={16} className="text-primary-600" /> Professional Info
        </h2>

        {!editMode ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Current Title"    value={profile?.title}      icon={Briefcase} />
            <Field label="Experience"       value={profile?.experience} icon={Briefcase} />
            <div className="sm:col-span-2">
              <Field label="Education" value={profile?.education} icon={BookOpen} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="label text-xs">Current Title / Role</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="input text-sm"
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            <div>
              <label className="label text-xs">Experience</label>
              <textarea
                rows={3}
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                className="input resize-none text-sm"
                placeholder="Describe your work experience…"
              />
            </div>
            <div>
              <label className="label text-xs">Education</label>
              <textarea
                rows={2}
                value={form.education}
                onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))}
                className="input resize-none text-sm"
                placeholder="e.g. BSc Computer Science, MIT 2020"
              />
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Code size={16} className="text-primary-600" /> Skills
        </h2>
        {!editMode ? (
          skillsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillsList.map((s) => (
                <span key={s} className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-lg font-medium border border-primary-100">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No skills added yet.</p>
          )
        ) : (
          <div>
            <label className="label text-xs">Skills <span className="text-slate-400 font-normal">(comma-separated)</span></label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
              className="input text-sm"
              placeholder="React, Python, Node.js, PostgreSQL…"
            />
            {/* Preview */}
            {form.skills && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parseSkills(form.skills).map((s) => (
                  <span key={s} className="inline-flex items-center px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Links */}
      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <LinkIcon size={16} className="text-primary-600" /> Links & Portfolio
        </h2>
        {!editMode ? (
          <div className="space-y-2">
            {[
              { label: 'Portfolio', value: profile?.portfolio_link, icon: LinkIcon },
              { label: 'LinkedIn',  value: profile?.linkedin,       icon: Linkedin },
              { label: 'GitHub',    value: profile?.github,         icon: Github },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} className="text-slate-400" />
                {value ? (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate">{value}</a>
                ) : (
                  <span className="text-sm text-slate-400 italic">Not set</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { field: 'portfolio_link', label: 'Portfolio URL',  icon: LinkIcon, placeholder: 'https://yourportfolio.com' },
              { field: 'linkedin',       label: 'LinkedIn URL',   icon: Linkedin,  placeholder: 'https://linkedin.com/in/yourname' },
              { field: 'github',         label: 'GitHub URL',     icon: Github,    placeholder: 'https://github.com/yourname' },
            ].map(({ field, label, icon: Icon, placeholder }) => (
              <div key={field}>
                <label className="label text-xs">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={form[field]}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="input pl-8 text-sm"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}
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
            { field: 'old_password',          label: 'Current Password',  placeholder: 'Your current password' },
            { field: 'new_password',          label: 'New Password',      placeholder: 'Min. 8 characters' },
            { field: 'new_password_confirm',  label: 'Confirm Password',  placeholder: 'Repeat new password' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="label text-xs">{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={pwShow[field] ? 'text' : 'password'}
                  value={pwForm[field]}
                  onChange={(e) => { setPwForm((p) => ({ ...p, [field]: e.target.value })); setPwErrors((p) => ({ ...p, [field]: '' })) }}
                  className={`input pl-8 pr-9 text-sm ${pwErrors[field] ? 'input-error' : ''}`}
                  placeholder={placeholder}
                />
                <button
                  type="button"
                  onClick={() => setPwShow((p) => ({ ...p, [field]: !p[field] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {pwShow[field] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pwErrors[field] && <p className="error-text">{pwErrors[field]}</p>}
            </div>
          ))}
          <button type="submit" disabled={pwSaving} className="btn-primary btn btn-sm flex items-center gap-1.5">
            {pwSaving ? <><span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : <><CheckCircle size={14} /> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CandidateProfile
