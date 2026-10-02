/**
 * Register page.
 * POST /api/auth/register/
 * Fields: email, full_name, password, password_confirm, role (employer|candidate),
 *         phone (optional), location (optional)
 * On success: auto-creates role profile, redirects to dashboard.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin,
  Briefcase, ArrowRight, Users, Building2, CheckCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { extractErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ROLES = [
  {
    value: 'candidate',
    label: 'Job Seeker',
    desc: 'Find jobs, upload resume, track applications.',
    icon: Users,
    color: 'border-primary-500 bg-primary-50 text-primary-700',
    check: 'bg-primary-600',
  },
  {
    value: 'employer',
    label: 'Recruiter',
    desc: 'Post jobs, manage applications, hire talent.',
    icon: Building2,
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    check: 'bg-emerald-600',
  },
]

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '', full_name: '', password: '', password_confirm: '',
    role: 'candidate', phone: '', location: '',
  })
  const [showPass,     setShowPass]     = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [errors,       setErrors]       = useState({})

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.email.trim())
      errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email.'
    if (!form.full_name.trim())
      errs.full_name = 'Full name is required.'
    if (!form.password)
      errs.password = 'Password is required.'
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'
    if (!form.password_confirm)
      errs.password_confirm = 'Please confirm your password.'
    else if (form.password !== form.password_confirm)
      errs.password_confirm = 'Passwords do not match.'
    if (form.phone && !/^\+?1?\d{9,15}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid phone number.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('email',            form.email.trim())
      fd.append('full_name',        form.full_name.trim())
      fd.append('password',         form.password)
      fd.append('password_confirm', form.password_confirm)
      fd.append('role',             form.role)
      if (form.phone.trim())    fd.append('phone',    form.phone.trim())
      if (form.location.trim()) fd.append('location', form.location.trim())

      const user = await register(fd)
      toast.success(`Account created! Welcome, ${user.full_name.split(' ')[0]}!`)
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard', { replace: true })
    } catch (err) {
      const msg = extractErrorMessage(err)
      toast.error(msg)
      // Map field errors from DRF response
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const mapped = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : v
        }
        setErrors(mapped)
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (p) => {
    if (!p) return null
    if (p.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (p.length < 10 || !/[0-9]/.test(p)) return { level: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (!/[A-Z]/.test(p) || !/[^a-zA-Z0-9]/.test(p)) return { level: 3, label: 'Good', color: 'bg-blue-500' }
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = passwordStrength(form.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-700 font-bold text-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Briefcase size={20} className="text-white" strokeWidth={2.5} />
            </div>
            JobBoard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-5 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Join thousands of professionals and companies</p>
        </div>

        <div className="card p-7 shadow-lg">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="label">I am a… <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, desc, icon: Icon, color, check }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: value }))}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                      form.role === value
                        ? color
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs opacity-70 leading-tight mt-0.5">{desc}</p>
                    </div>
                    {form.role === value && (
                      <span className={`absolute top-2 right-2 h-5 w-5 rounded-full ${check} flex items-center justify-center`}>
                        <CheckCircle size={12} className="text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="label" htmlFor="full_name">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={form.full_name}
                  onChange={set('full_name')}
                  className={`input pl-9 ${errors.full_name ? 'input-error' : ''}`}
                />
              </div>
              {errors.full_name && <p className="error-text">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Phone + Location in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="phone">Phone <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1234567890"
                    value={form.phone}
                    onChange={set('phone')}
                    className={`input pl-9 ${errors.phone ? 'input-error' : ''}`}
                  />
                </div>
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>
              <div>
                <label className="label" htmlFor="location">Location <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="location"
                    type="text"
                    placeholder="New York, NY"
                    value={form.location}
                    onChange={set('location')}
                    className="input pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? 'Hide' : 'Show'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
              {/* Password strength indicator */}
              {form.password && strength && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${n <= strength.level ? strength.color : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label" htmlFor="confirm-password">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.password_confirm}
                  onChange={set('password_confirm')}
                  className={`input pl-9 pr-10 ${errors.password_confirm ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirm ? 'Hide' : 'Show'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password_confirm && <p className="error-text">{errors.password_confirm}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn w-full btn-lg mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          By registering you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  )
}

export default Register
