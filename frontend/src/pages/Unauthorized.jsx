import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
      <ShieldX size={40} className="text-red-500" strokeWidth={1.5} />
    </div>
    <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
    <p className="text-slate-500 mb-6 max-w-sm">
      You don't have permission to view this page. Please log in with the correct account type.
    </p>
    <div className="flex gap-3">
      <Link to="/" className="btn-secondary btn">Go Home</Link>
      <Link to="/login" className="btn-primary btn">Log In</Link>
    </div>
  </div>
)

export default Unauthorized
