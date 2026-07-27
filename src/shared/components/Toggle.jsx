/**
 * Toggle - Công tắc bật/tắt dùng chung toàn hệ thống.
 * Thay thế các mẫu toggle inline trùng lặp.
 */
import React from 'react';

const Toggle = ({ checked, onChange, size = 'md', disabled = false }) => {
  const sizeClass = size === 'sm' ? 'scale-75' : '';

  return (
    <label
      className={`relative inline-flex ${sizeClass} cursor-pointer items-center ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        className="peer sr-only"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full dark:bg-[#333333] dark:after:bg-[#b3b3b3]" />
    </label>
  );
};

export default Toggle;
