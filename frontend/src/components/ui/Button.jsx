/**
 * Button — polymorphic button with variants, sizes, and loading state.
 * variant: primary | secondary | danger | ghost | outline
 * size: sm | md | lg
 */

import LoadingSpinner from './LoadingSpinner'

const VARIANT_CLASSES = {
  primary:  'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent',
  secondary:'bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400 border border-slate-300',
  danger:   'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
  ghost:    'text-slate-600 hover:bg-slate-100 focus:ring-slate-400 border border-transparent',
  outline:  'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500 border border-primary-600',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
        ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
