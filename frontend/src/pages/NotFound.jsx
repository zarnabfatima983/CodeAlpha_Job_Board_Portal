import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
      <SearchX size={40} className="text-slate-400" strokeWidth={1.5} />
    </div>
    <h1 className="text-5xl font-bold text-slate-900 mb-2">404</h1>
    <p className="text-lg font-medium text-slate-700 mb-2">Page not found</p>
    <p className="text-slate-500 mb-6 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary btn">Back to Home</Link>
  </div>
)

export default NotFound
