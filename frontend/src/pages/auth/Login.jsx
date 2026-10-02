/**
 * Login page.
 * POST /api/auth/login/  →  { email, password }
 * On success: stores tokens, redirects based on role.
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { extractErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})

  const from = location.state?.from?.pathname || null

  const validate = () => {
    const errs = {}
    if (!email.trim())       errs.email    = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email.'
    if (!password)           errs.password = 'Password is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`)
      // Redirect: back to intended page, or role dashboard
      if (from && from !== '/login') {
        navigate(from, { replace: true })
      } else {
        navigate(user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard', { replace: true })
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-700 font-bold text-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Briefcase size={20} className="text-white" strokeWidth={2.5} />
            </div>
            JobBoard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-5 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Log in to your account to continue</p>
        </div>

        <div className="card p-7 shadow-lg">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="label" htmlFor="email">Email address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password">Password <span className="text-red-500">*</span></label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
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
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Sign in <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          By continuing you agree to our{' '}
          <span className="text-slate-500 hover:underline cursor-pointer">Terms</span> &amp;{' '}
          <span className="text-slate-500 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

export default Login
