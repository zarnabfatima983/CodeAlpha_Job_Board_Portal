/**
 * Resumes API — maps to /api/resumes/ endpoints.
 * Candidate-only endpoints.
 *
 * Endpoints:
 *   GET    /api/resumes/              — list own resumes
 *   POST   /api/resumes/upload/       — upload resume (PDF, max 5MB)
 *   GET    /api/resumes/<id>/         — get single resume
 *   PUT    /api/resumes/<id>/         — update resume title
 *   DELETE /api/resumes/<id>/         — delete resume (removes file from storage)
 *   GET    /api/resumes/<id>/download/ — download resume as PDF
 */

import api from './axios'

// ── List own resumes ──────────────────────────────────────────────────────────
// Response: paginated list with id, title, resume_file (URL), uploaded_at, file_size ("1.23 MB")
export const getResumes = () =>
  api.get('/api/resumes/')

// ── Upload a new resume ───────────────────────────────────────────────────────
// FormData: { resume_file: <File PDF max 5MB>, title: "My Resume" (optional) }
export const uploadResume = (formData) =>
  api.post('/api/resumes/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Get single resume ─────────────────────────────────────────────────────────
export const getResumeById = (id) =>
  api.get(`/api/resumes/${id}/`)

// ── Update resume title ───────────────────────────────────────────────────────
export const updateResume = (id, data) =>
  api.put(`/api/resumes/${id}/`, data)

// ── Delete resume ─────────────────────────────────────────────────────────────
export const deleteResume = (id) =>
  api.delete(`/api/resumes/${id}/`)

// ── Download resume as PDF ────────────────────────────────────────────────────
// Returns a blob/file response — use with URL.createObjectURL
export const downloadResume = (id) =>
  api.get(`/api/resumes/${id}/download/`, { responseType: 'blob' })
