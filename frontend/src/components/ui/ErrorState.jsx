/**
 * ErrorState — shown when an API call fails.
 */

import { AlertCircle } from 'lucide-react'
import Button from './Button'

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export default ErrorState
