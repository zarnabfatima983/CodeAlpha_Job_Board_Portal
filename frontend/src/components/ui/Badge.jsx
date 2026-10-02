/**
 * Badge — status/category label chip.
 * color: blue | green | yellow | red | gray | purple | orange
 */

const COLOR_CLASSES = {
  blue:   'bg-blue-100 text-blue-800 ring-blue-200',
  green:  'bg-green-100 text-green-800 ring-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  red:    'bg-red-100 text-red-800 ring-red-200',
  gray:   'bg-slate-100 text-slate-700 ring-slate-200',
  purple: 'bg-purple-100 text-purple-800 ring-purple-200',
  orange: 'bg-orange-100 text-orange-800 ring-orange-200',
  indigo: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
}

const Badge = ({ color = 'gray', children, className = '', dot = false }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${COLOR_CLASSES[color] || COLOR_CLASSES.gray} ${className}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}

export default Badge
