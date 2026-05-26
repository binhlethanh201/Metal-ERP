/**
 * src/modules/forum/components/shared/Avatar.jsx
 * Avatar thành viên - Đã chuyển đổi từ dáng tròn sang dáng hộp vuông bo góc rounded-lg đồng bộ.
 */
import React from 'react';

const getInitials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

const sizeMap = {
  sm: 'h-8 w-8 text-[10px] rounded-md',
  md: 'h-10 w-10 text-xs rounded-lg',
  lg: 'h-12 w-12 text-sm rounded-xl',
};

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  if (src) {
    return (
      <img
        alt={name}
        className={`shadow-sm/5 border border-slate-100 object-cover ${sizeMap[size]} ${className}`}
        src={src}
      />
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#004785] to-[#005296] font-black text-white shadow-sm ${sizeMap[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
