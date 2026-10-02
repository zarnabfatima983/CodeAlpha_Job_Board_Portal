/**
 * Notifications page — list, mark read, mark all read, delete.
 * APIs:
 *   GET    /api/notifications/
 *   PATCH  /api/notifications/<id>/read/
 *   POST   /api/notifications/mark-all-read/
 *   DELETE /api/notifications/<id>/delete/
 */

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, RefreshCw, X } from 'lucide-react'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../api/notificationsApi'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [markingAll,    setMarkingAll]    = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getNotifications()
      setNotifications(res.data?.results ?? res.data ?? [])
    } catch {
      toast.error('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch {
      toast.error('Failed to mark as read.')
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read.')
    } catch {
      toast.error('Failed to mark all as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      toast.error('Failed to delete notification.')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading notifications…" />
    </div>
  )

  return (
    <div className="container-page py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell size={22} className="text-primary-600" />
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost btn btn-sm flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="btn-secondary btn btn-sm flex items-center gap-1.5"
            >
              {markingAll ? (
                <span className="h-3.5 w-3.5 border-2 border-slate-400/40 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <CheckCheck size={13} />
              )}
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'unread', 'read'].map((tab) => {
          const count = tab === 'all'
            ? notifications.length
            : tab === 'unread'
            ? notifications.filter((n) => !n.is_read).length
            : notifications.filter((n) => n.is_read).length
          return (
            <span
              key={tab}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600"
            >
              <span className="capitalize">{tab}</span>
              <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center">{count}</span>
            </span>
          )
        })}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You'll see updates here when you apply for jobs or when employers update your application status."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card p-4 flex items-start gap-3 transition-colors ${
                !notif.is_read ? 'bg-primary-50/50 border-primary-100' : 'bg-white'
              }`}
            >
              {/* Unread dot */}
              <div className="flex-shrink-0 mt-1">
                {!notif.is_read ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary-600 mt-0.5" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200 mt-0.5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.created_at)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
