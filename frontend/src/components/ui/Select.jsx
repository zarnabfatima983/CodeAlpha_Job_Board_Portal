/**
 * Select — labeled dropdown with error state.
 */

import { forwardRef } from 'react'

const Select = forwardRef(({
  label,
  id,
  error,
  helper,
  children,
  className = '',
  required,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`input appearance-none bg-white cursor-pointer ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="error-text" role="alert">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-slate-500 mt-1">{helper}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
