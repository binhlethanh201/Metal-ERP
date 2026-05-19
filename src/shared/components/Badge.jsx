/**
 * Badge Component - Badge/Label tái sử dụng
 * Hỗ trợ nhiều variant và size
 */

export const Badge = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-block rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className} `}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
