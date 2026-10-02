/**
 * Jobs API — maps to /api/jobs/ endpoints.
 *
 * Endpoints:
 *   GET    /api/jobs/list/             — public, filterable list
 *   GET    /api/jobs/open/             — public, open jobs only
 *   GET    /api/jobs/<id>/             — public, job detail
 *   GET    /api/jobs/my-jobs/          — employer: own jobs
 *   POST   /api/jobs/                  — employer: create job
 *   PATCH  /api/jobs/<id>/             — employer/owner: update job
 *   DELETE /api/jobs/<id>/             — employer/owner: delete job
 *   GET    /api/jobs/categories/       — public: all categories
 *   POST   /api/jobs/categories/create/ — employer: create category
 */

import api from './axios'

// ── Public job listing with full filter support ───────────────────────────────
// params: { search, title, location, category, employment_type, remote_option,
//           salary_min_gte, salary_max_lte, status, skill, ordering,
//           page, page_size }
export const getJobs = (params = {}) =>
  api.get('/api/jobs/list/', { params })

// ── Open jobs only (for public browse) ───────────────────────────────────────
export const getOpenJobs = (params = {}) =>
  api.get('/api/jobs/open/', { params })

// ── Single job detail ─────────────────────────────────────────────────────────
export const getJobById = (id) =>
  api.get(`/api/jobs/${id}/`)

// ── Employer: own jobs ────────────────────────────────────────────────────────
export const getMyJobs = () =>
  api.get('/api/jobs/my-jobs/')

// ── Employer: create job ──────────────────────────────────────────────────────
// Required: title, description
// Optional: category, requirements, responsibilities, salary_min, salary_max,
//           experience_required, employment_type, location, remote_option,
//           application_deadline, status
export const createJob = (data) =>
  api.post('/api/jobs/', data)

// ── Employer/owner: update job ────────────────────────────────────────────────
export const updateJob = (id, data) =>
  api.patch(`/api/jobs/${id}/`, data)

// ── Employer/owner: delete job ────────────────────────────────────────────────
export const deleteJob = (id) =>
  api.delete(`/api/jobs/${id}/`)

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () =>
  api.get('/api/jobs/categories/')

export const createCategory = (data) =>
  api.post('/api/jobs/categories/create/', data)
