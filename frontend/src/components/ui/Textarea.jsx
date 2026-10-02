/**
 * Textarea — labeled multiline input with error state.
 */

import { forwardRef } from 'react'

const Textarea = forwardRef(({
  label,
  id,
  error,
  helper,
  className = '',
  rows = 4,
  required,
  ...props
}, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`input resize-y min-h-[100px] ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className="error-text" role="alert">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-slate-500 mt-1">{helper}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
