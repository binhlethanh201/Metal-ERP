/**
 * Modal Component - Modal dialog tái sử dụng
 * Hỗ trợ header, footer, close callback
 */

import { useState, useEffect } from 'react';

export const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children,
  footer = null,
  size = 'md',
  closeButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    // Khoá scroll body khi modal mở
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-start justify-center px-4 pb-8 pt-16">
        <div
          className={`relative flex max-h-[88vh] flex-col rounded-lg bg-white shadow-xl ${sizes[size]} w-full`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - cố định */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {closeButton && (
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <svg
                  className="pointer-events-none h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Body - scroll được */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer - cố định */}
          {footer && (
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
