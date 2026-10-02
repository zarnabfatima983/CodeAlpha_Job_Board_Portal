/**
 * Applications API — maps to /api/applications/ endpoints.
 *
 * Endpoints:
 *   POST   /api/applications/apply/                  — candidate: apply for job
 *   GET    /api/applications/my-applications/        — candidate: own applications
 *   GET    /api/applications/employer-applications/  — employer: all applications
 *   DELETE /api/applications/<id>/withdraw/          — candidate: withdraw
 *   PATCH  /api/applications/<id>/status/            — employer: update status
 */

import api from './axios'

// ── Candidate: apply for a job ────────────────────────────────────────────────
// Request: { job: <id>, resume: <id> (optional), cover_letter: "" (optional) }
// Business rules enforced server-side:
//   - job must be open
//   - deadline not passed
//   - no duplicate applications
export const applyForJob = (data) =>
  api.post('/api/applications/apply/', data)

// ── Candidate: list own applications ─────────────────────────────────────────
export const getMyApplications = () =>
  api.get('/api/applications/my-applications/')

// ── Candidate: withdraw application ──────────────────────────────────────────
// Only allowed when status is 'applied' or 'under_review'
export const withdrawApplication = (id) =>
  api.delete(`/api/applications/${id}/withdraw/`)

// ── Employer: all applications for their jobs ─────────────────────────────────
// params: { job_id: <int>, status: 'applied'|'under_review'|'shortlisted'|'interview'|'selected'|'rejected' }
export const getEmployerApplications = (params = {}) =>
  api.get('/api/applications/employer-applications/', { params })

// ── Employer: update application status ──────────────────────────────────────
// Valid statuses: applied, under_review, shortlisted, interview, selected, rejected
export const updateApplicationStatus = (id, application_status) =>
  api.patch(`/api/applications/${id}/status/`, { application_status })
