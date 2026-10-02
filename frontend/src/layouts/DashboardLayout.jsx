/**
 * DashboardLayout — sidebar + content layout for authenticated pages.
 * Responsive: sidebar collapses to top tabs on mobile.
 */

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText, User, PlusSquare,
  Users, Bell, LogOut, Menu, X, ChevronRight, FileUp
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getInitials, mediaUrl } from '../utils/helpers'
import toast from 'react-hot-toast'

const SidebarLink = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    <Icon size={17} strokeWidth={1.8} />
    <span>{children}</span>
  </NavLink>
)

const candidateLinks = [
  { to: '/candidate/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidate/applications', icon: FileText,        label: 'My Applications' },
  { to: '/candidate/resumes',      icon: FileUp,          label: 'Resumes' },
  { to: '/candidate/profile',      icon: User,            label: 'Profile' },
  { to: '/notifications',          icon: Bell,            label: 'Notifications' },
]

const employerLinks = [
  { to: '/employer/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employer/jobs',       icon: Briefcase,       label: 'My Jobs' },
  { to: '/employer/post-job',   icon: PlusSquare,      label: 'Post a Job' },
  { to: '/employer/applicants', icon: Users,           label: 'Applicants' },
  { to: '/employer/profile',    icon: User,            label: 'Company Profile' },
  { to: '/notifications',       icon: Bell,            label: 'Notifications' },
]

const DashboardLayout = ({ children }) => {
  const { user, logout, isEmployer, isCandidate } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const links = isEmployer ? employerLinks : candidateLinks

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const closeSidebar = () => setSidebarOpen(false)
  const avatarSrc = mediaUrl(user?.profile_picture)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user?.full_name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {getInitials(user?.full_name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon, label }) => (
          <SidebarLink key={to} to={to} icon={icon} onClick={closeSidebar}>
            {label}
          </SidebarLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2 text-primary-700 font-bold text-lg">
            <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Briefcase size={14} className="text-white" strokeWidth={2.5} />
            </div>
            JobBoard
          </NavLink>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <span className="text-primary-700 font-bold text-lg">JobBoard</span>
          <button onClick={closeSidebar} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-primary-700 font-bold text-lg">JobBoard</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-page py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
