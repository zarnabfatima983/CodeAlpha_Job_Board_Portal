/**
 * Shared utility helpers for the Job Board frontend.
 */

import { formatDistanceToNow, format, parseISO } from 'date-fns'

// ── Date helpers ──────────────────────────────────────────────────────────────
export const timeAgo = (dateStr) => {
  if (!dateStr) return 'Unknown'
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export const formatDate = (dateStr, fmt = 'MMM d, yyyy') => {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export const isDeadlinePassed = (deadlineStr) => {
  if (!deadlineStr) return false
  try {
    return parseISO(deadlineStr) < new Date()
  } catch {
    return false
  }
}

// ── Salary formatting ─────────────────────────────────────────────────────────
export const formatSalary = (min, max) => {
  if (!min && !max) return 'Salary not specified'
  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

// ── Employment type display ───────────────────────────────────────────────────
export const EMPLOYMENT_TYPE_LABELS = {
  full_time:   'Full Time',
  part_time:   'Part Time',
  contract:    'Contract',
  freelance:   'Freelance',
  internship:  'Internship',
}

export const getEmploymentLabel = (type) =>
  EMPLOYMENT_TYPE_LABELS[type] || type || 'Not specified'

// ── Application status config ─────────────────────────────────────────────────
export const APPLICATION_STATUS = {
  applied:      { label: 'Applied',      color: 'blue'   },
  under_review: { label: 'Under Review', color: 'yellow' },
  shortlisted:  { label: 'Shortlisted',  color: 'purple' },
  interview:    { label: 'Interview',    color: 'orange' },
  selected:     { label: 'Selected',     color: 'green'  },
  rejected:     { label: 'Rejected',     color: 'red'    },
}

export const getStatusConfig = (status) =>
  APPLICATION_STATUS[status] || { label: status, color: 'gray' }

// ── Company size display ──────────────────────────────────────────────────────
export const COMPANY_SIZE_LABELS = {
  '1-10':     '1–10 employees',
  '11-50':    '11–50 employees',
  '51-200':   '51–200 employees',
  '201-1000': '201–1000 employees',
  '1000+':    '1000+ employees',
}

// ── Extract error message from API response ────────────────────────────────────
export const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.'

  const data = error.response?.data

  if (!data) {
    if (error.message === 'Network Error') return 'Network error. Please check your connection.'
    return error.message || 'An unexpected error occurred.'
  }

  // Custom error shape: { success: false, error: { message, details } }
  if (data.error?.message) return data.error.message

  // DRF validation errors: { field: ["msg"] } or { non_field_errors: [] }
  if (typeof data === 'object') {
    const messages = []
    for (const key of Object.keys(data)) {
      const val = data[key]
      if (Array.isArray(val)) {
        messages.push(...val)
      } else if (typeof val === 'string') {
        messages.push(val)
      }
    }
    if (messages.length) return messages[0]
  }

  return 'An unexpected error occurred.'
}

// ── Get avatar initials ───────────────────────────────────────────────────────
export const getInitials = (name = '') => {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ── Build full media URL ──────────────────────────────────────────────────────
export const mediaUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${base}${path}`
}

// ── Skills: comma-separated string → array ────────────────────────────────────
export const parseSkills = (skillsStr) => {
  if (!skillsStr) return []
  return skillsStr.split(',').map((s) => s.trim()).filter(Boolean)
}

// ── Skills: array → comma-separated string ────────────────────────────────────
export const serializeSkills = (skillsArr) => {
  if (!Array.isArray(skillsArr)) return skillsArr
  return skillsArr.join(', ')
}
