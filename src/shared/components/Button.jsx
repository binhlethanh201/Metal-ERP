/**
 * Button Component - Nút bấm tái sử dụng
 * Hỗ trợ nhiều variant, size, state
 */

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#004785] hover:brightness-90 text-white focus:ring-blue-500 disabled:bg-blue-400',
    secondary:
      'bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400 disabled:bg-slate-100 dark:bg-[#272727] dark:hover:bg-[#404040] dark:text-[#d4d4d4] dark:disabled:bg-[#404040]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-400',
    success:
      'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:bg-green-400',
    outline:
      'border border-[#004785] text-[#004785] hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-400 disabled:text-blue-400 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Đang tải...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
