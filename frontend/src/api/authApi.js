/**
 * Auth API — maps to /api/auth/ endpoints.
 *
 * Endpoints used:
 *   POST /api/auth/register/
 *   POST /api/auth/login/
 *   POST /api/auth/logout/
 *   POST /api/auth/token/refresh/
 *   GET  /api/auth/profile/
 *   PATCH /api/auth/profile/
 *   POST /api/auth/change-password/
 */

import api from './axios'

// ── Registration ─────────────────────────────────────────────────────────────
// roles: 'employer' | 'candidate'
// Supports multipart for profile_picture upload
export const register = (formData) =>
  api.post('/api/auth/register/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Login ─────────────────────────────────────────────────────────────────────
// Request: { email, password }
// Response: { success, data: { user, tokens: { access, refresh } } }
export const login = (credentials) =>
  api.post('/api/auth/login/', credentials)

// ── Logout ────────────────────────────────────────────────────────────────────
// Request: { refresh }  — blacklists the token on the server
export const logout = (refreshToken) =>
  api.post('/api/auth/logout/', { refresh: refreshToken })

// ── Token refresh ─────────────────────────────────────────────────────────────
export const refreshToken = (refresh) =>
  api.post('/api/auth/token/refresh/', { refresh })

// ── Profile ───────────────────────────────────────────────────────────────────
export const getProfile = () =>
  api.get('/api/auth/profile/')

// Supports multipart for profile_picture upload
export const updateProfile = (formData) =>
  api.patch('/api/auth/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Change password ───────────────────────────────────────────────────────────
// Request: { old_password, new_password, new_password_confirm }
export const changePassword = (data) =>
  api.post('/api/auth/change-password/', data)
