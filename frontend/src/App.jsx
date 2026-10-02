/**
 * App.jsx — root router.
 *
 * Route structure:
 *   Public  (PublicLayout):
 *     /                       Home
 *     /jobs                   Jobs listing
 *     /jobs/:id               Job detail
 *     /login                  Login
 *     /register               Register
 *     /notifications          Notifications (authenticated)
 *     /unauthorized           Unauthorized
 *     *                       404 Not Found
 *
 *   Candidate (DashboardLayout, role=candidate):
 *     /candidate/dashboard    Overview
 *     /candidate/applications My applications
 *     /candidate/resumes      Resume manager
 *     /candidate/profile      Profile editor
 *
 *   Employer (DashboardLayout, role=employer):
 *     /employer/dashboard     Overview
 *     /employer/jobs          My jobs
 *     /employer/post-job      Post new job
 *     /employer/jobs/:id/edit Edit job
 *     /employer/jobs/:id/applicants   Applicants for a specific job
 *     /employer/applicants    All applicants
 *     /employer/profile       Company profile
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import RoleProtectedRoute from './components/shared/RoleProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Public pages
import Home         from './pages/public/Home'
import Jobs         from './pages/public/Jobs'
import JobDetail    from './pages/public/JobDetail'
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import Notifications from './pages/Notifications'
import Unauthorized from './pages/Unauthorized'
import NotFound     from './pages/NotFound'

// Candidate pages
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import MyApplications     from './pages/candidate/MyApplications'
import Resumes            from './pages/candidate/Resumes'
import CandidateProfile   from './pages/candidate/CandidateProfile'

// Employer pages
import EmployerDashboard from './pages/employer/EmployerDashboard'
import MyJobs            from './pages/employer/MyJobs'
import PostJob           from './pages/employer/PostJob'
import Applicants        from './pages/employer/Applicants'
import EmployerProfile   from './pages/employer/EmployerProfile'

// ── Helpers ───────────────────────────────────────────────────────────────────
const PublicPage = ({ children }) => (
  <PublicLayout>{children}</PublicLayout>
)

const CandidatePage = ({ children }) => (
  <RoleProtectedRoute role="candidate">
    <DashboardLayout>{children}</DashboardLayout>
  </RoleProtectedRoute>
)

const EmployerPage = ({ children }) => (
  <RoleProtectedRoute role="employer">
    <DashboardLayout>{children}</DashboardLayout>
  </RoleProtectedRoute>
)

const App = () => (
  <AuthProvider>
    <Routes>
      {/* ── Public routes ──────────────────────────────────────────── */}
      <Route path="/" element={<PublicPage><Home /></PublicPage>} />
      <Route path="/jobs" element={<PublicPage><Jobs /></PublicPage>} />
      <Route path="/jobs/:id" element={<PublicPage><JobDetail /></PublicPage>} />
      <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
      <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Notifications — accessible from any layout when authenticated */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Notifications />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Candidate routes ───────────────────────────────────────── */}
      <Route path="/candidate/dashboard"    element={<CandidatePage><CandidateDashboard /></CandidatePage>} />
      <Route path="/candidate/applications" element={<CandidatePage><MyApplications /></CandidatePage>} />
      <Route path="/candidate/resumes"      element={<CandidatePage><Resumes /></CandidatePage>} />
      <Route path="/candidate/profile"      element={<CandidatePage><CandidateProfile /></CandidatePage>} />

      {/* ── Employer routes ────────────────────────────────────────── */}
      <Route path="/employer/dashboard"                 element={<EmployerPage><EmployerDashboard /></EmployerPage>} />
      <Route path="/employer/jobs"                      element={<EmployerPage><MyJobs /></EmployerPage>} />
      <Route path="/employer/post-job"                  element={<EmployerPage><PostJob /></EmployerPage>} />
      <Route path="/employer/jobs/:id/edit"             element={<EmployerPage><PostJob /></EmployerPage>} />
      <Route path="/employer/jobs/:jobId/applicants"    element={<EmployerPage><Applicants /></EmployerPage>} />
      <Route path="/employer/applicants"                element={<EmployerPage><Applicants /></EmployerPage>} />
      <Route path="/employer/profile"                   element={<EmployerPage><EmployerProfile /></EmployerPage>} />

      {/* ── Fallback ───────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
)

export default App
