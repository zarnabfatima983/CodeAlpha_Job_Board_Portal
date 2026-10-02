/**
 * Notifications API — maps to /api/notifications/ endpoints.
 *
 * Endpoints:
 *   GET    /api/notifications/                   — list own notifications
 *   PATCH  /api/notifications/<id>/read/         — mark one as read
 *   POST   /api/notifications/mark-all-read/     — mark all as read
 *   DELETE /api/notifications/<id>/delete/       — delete notification
 */

import api from './axios'

// ── List notifications for the authenticated user ─────────────────────────────
// Returns notifications where user is employer OR candidate
// Response: paginated list with id, title, message, is_read, created_at
export const getNotifications = () =>
  api.get('/api/notifications/')

// ── Mark a single notification as read ───────────────────────────────────────
export const markNotificationRead = (id) =>
  api.patch(`/api/notifications/${id}/read/`)

// ── Mark all notifications as read ────────────────────────────────────────────
export const markAllNotificationsRead = () =>
  api.post('/api/notifications/mark-all-read/')

// ── Delete a notification ─────────────────────────────────────────────────────
export const deleteNotification = (id) =>
  api.delete(`/api/notifications/${id}/delete/`)
