/**
 * AuthContext — global authentication state.
 *
 * Provides:
 *   user          — current user object (from /api/auth/profile/)
 *   token         — current access token
 *   isAuthenticated — boolean
 *   isLoading     — true while checking persisted session on mount
 *   login(email, password)   — logs in, stores tokens, fetches full profile
 *   register(formData)       — registers, stores tokens, auto-creates profile stub
 *   logout()                 — blacklists refresh token, clears storage
 *   updateUser(partial)      — update local user state after profile edits
 *
 * Token storage: localStorage (access_token, refresh_token, user)
 * Roles from backend: 'employer' | 'candidate'
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import * as authApi from '../api/authApi'
import * as employersApi from '../api/employersApi'
import * as candidatesApi from '../api/candidatesApi'
import { extractErrorMessage } from '../utils/helpers'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null)
  const [token, setToken]             = useState(() => localStorage.getItem('access_token'))
  const [isLoading, setIsLoading]     = useState(true)   // checking persisted session
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ── On mount: restore session from localStorage ─────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('access_token')
      const storedUser  = localStorage.getItem('user')

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      // Optimistically restore from cache first for instant UI
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)
          setToken(storedToken)
          setIsAuthenticated(true)
        } catch {
          // corrupt cache — ignore, will re-fetch below
        }
      }

      // Then re-validate with server to get fresh user data
      try {
        const res = await authApi.getProfile()
        const freshUser = res.data?.data || res.data
        setUser(freshUser)
        setToken(storedToken)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(freshUser))
      } catch {
        // Token is invalid/expired and refresh also failed → axios interceptor
        // already cleared storage and redirected. Just clean up state here.
        clearState()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { user: userData, tokens } = res.data.data

    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(tokens.access)
    setUser(userData)
    setIsAuthenticated(true)

    return userData
  }, [])

  // ── Register ───────────────────────────────────────────────────────────────
  // After registration, auto-create the role-specific profile so downstream
  // APIs (jobs, applications) don't fail with "profile not found".
  const register = useCallback(async (formData) => {
    const res = await authApi.register(formData)
    const { user: userData, tokens } = res.data.data

    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(tokens.access)
    setUser(userData)
    setIsAuthenticated(true)

    // Auto-create a minimal role profile (so profile endpoints don't 404)
    try {
      if (userData.role === 'employer') {
        const company_name = userData.full_name + "'s Company"
        const fd = new FormData()
        fd.append('company_name', company_name)
        await employersApi.createEmployerProfile(fd)
      } else if (userData.role === 'candidate') {
        await candidatesApi.createCandidateProfile({})
      }
    } catch {
      // Profile might already exist or backend rejected empty payload — non-fatal
    }

    return userData
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Server-side blacklist failed — still clear client state
    } finally {
      clearState()
    }
  }, [])

  // ── Update local user state after profile edits ────────────────────────────
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const updated = { ...prev, ...partial }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearState = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    // Convenience role booleans
    isEmployer:  user?.role === 'employer',
    isCandidate: user?.role === 'candidate',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
