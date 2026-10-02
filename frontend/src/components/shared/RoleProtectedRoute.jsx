/**
 * RoleProtectedRoute — guards a route to a specific role.
 *
 * Usage:
 *   <RoleProtectedRoute role="employer">
 *     <EmployerDashboard />
 *   </RoleProtectedRoute>
 *
 * - Unauthenticated → /login
 * - Wrong role      → /unauthorized
 * - Correct role    → renders children
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

const RoleProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Checking permissions…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleProtectedRoute
