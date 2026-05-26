/**
 * Avatar - Hiển thị ảnh đại diện hoặc chữ viết tắt.
 * Props: name, src (url ảnh), size (sm/md/lg).
 * Nếu có src thì hiển thị ảnh, không có thì hiển thị initials từ name.
 */
const getInitials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

const sizeMap = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
};

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  if (src) {
    return (
      <img
        alt={name}
        className={`rounded-full object-cover ${sizeMap[size]} ${className}`}
        src={src}
      />
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#004785] to-[#005296] font-bold text-white ${sizeMap[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
