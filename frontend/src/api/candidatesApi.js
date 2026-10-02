/**
 * Candidates API — maps to /api/candidates/ endpoints.
 *
 * Endpoints:
 *   POST   /api/candidates/         — create candidate profile (first time)
 *   GET    /api/candidates/profile/ — get own profile
 *   PATCH  /api/candidates/profile/ — update own profile
 *   GET    /api/candidates/dashboard/ — dashboard stats
 */

import api from './axios'

// ── Create candidate profile (called right after registration) ────────────────
// Fields: title, experience, education, skills (comma-separated), portfolio_link,
//         linkedin, github
export const createCandidateProfile = (data) =>
  api.post('/api/candidates/', data)

// ── Get own candidate profile ─────────────────────────────────────────────────
// Response includes: user_info (nested), skills_list (array), all profile fields
export const getCandidateProfile = () =>
  api.get('/api/candidates/profile/')

// ── Update candidate profile ──────────────────────────────────────────────────
export const updateCandidateProfile = (data) =>
  api.patch('/api/candidates/profile/', data)

// ── Candidate dashboard stats ─────────────────────────────────────────────────
// Response: { total_applications, applications_by_status: {applied, under_review, ...}, total_resumes }
export const getCandidateDashboard = () =>
  api.get('/api/candidates/dashboard/')
