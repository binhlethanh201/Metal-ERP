/**
 * Input Component - Input field tái sử dụng
 * Hỗ trợ label, error, hint, icon
 */

export const Input = ({
  label,
  placeholder = '',
  type = 'text',
  error = '',
  hint = '',
  icon = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border-2 px-3 py-2 ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 ${className} `}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
};

export default Input;
