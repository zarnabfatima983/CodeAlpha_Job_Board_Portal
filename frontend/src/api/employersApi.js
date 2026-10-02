/**
 * Employers API — maps to /api/employers/ endpoints.
 *
 * Endpoints:
 *   POST   /api/employers/           — create employer profile (first time)
 *   GET    /api/employers/profile/   — get own profile
 *   PATCH  /api/employers/profile/   — update own profile
 *   GET    /api/employers/dashboard/ — dashboard stats
 */

import api from './axios'

// ── Create employer profile (called right after registration if not exists) ───
// Required: company_name
// Optional: company_logo, company_description, website, industry,
//           company_size (choices: 1-10|11-50|51-200|201-1000|1000+), location
export const createEmployerProfile = (formData) =>
  api.post('/api/employers/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Get own employer profile ──────────────────────────────────────────────────
// Response includes: owner_info (nested UserProfile), all company fields
// Uses get_or_create server-side so GET always succeeds even without a profile
export const getEmployerProfile = () =>
  api.get('/api/employers/profile/')

// ── Update employer profile (supports logo upload) ────────────────────────────
export const updateEmployerProfile = (formData) =>
  api.patch('/api/employers/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Employer dashboard stats ──────────────────────────────────────────────────
// Response: { total_jobs, open_jobs, closed_jobs, total_applications,
//             applications_by_status: { applied, under_review, shortlisted,
//             interview, selected, rejected } }
export const getEmployerDashboard = () =>
  api.get('/api/employers/dashboard/')
