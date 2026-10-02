/**
 * LoadingSpinner — reusable animated spinner with optional text label.
 * Sizes: sm | md | lg | xl
 */

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
  xl: 'h-16 w-16 border-4',
}

const LoadingSpinner = ({ size = 'md', text = '', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${SIZE_CLASSES[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
