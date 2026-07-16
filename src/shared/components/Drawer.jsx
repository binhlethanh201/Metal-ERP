/**
 * Drawer Component - Panel trượt từ cạnh phải
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Drawer = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children,
  footer = null,
  widthClass = 'max-w-md',
  closeButton = true,
}) => {
  // Giữ component mounted trong lúc animation đóng đang chạy,
  // rồi mới thực sự unmount để hiệu ứng trượt ra mượt.
  const [mounted, setMounted] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      const raf = requestAnimationFrame(() => setAnimateIn(true));
      return () => cancelAnimationFrame(raf);
    }
    setAnimateIn(false);
    document.body.style.overflow = 'unset';
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(
    () => () => {
      document.body.style.overflow = 'unset';
    },
    []
  );

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 ${animateIn ? 'bg-opacity-50' : 'bg-opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 flex h-full w-full ${widthClass} flex-col overflow-hidden bg-white shadow-xl transition-transform duration-200 ease-out ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - cố định */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label="Đóng"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Body - scroll riêng */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer - cố định */}
        {footer && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
