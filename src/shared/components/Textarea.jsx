/**
 * Textarea Component - Textarea tái sử dụng, đồng bộ style với Input.jsx
 */
export const Textarea = ({
  label,
  placeholder = '',
  error = '',
  hint = '',
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#004785]'
        } transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
};

export default Textarea;
