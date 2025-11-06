import { SelectHTMLAttributes, forwardRef, ForwardedRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function Select(
  { className = '', label, error, required, options, placeholder, ...props }: SelectProps,
  ref: ForwardedRef<HTMLSelectElement>
) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100
  disabled:cursor-not-allowed ${
    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
  } ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-1.5 flex items-center gap-1 text-red-600 text-sm" role="alert">
          <span className="bi bi-exclamation-triangle-fill"></span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default forwardRef(Select);
