import React from 'react';
import Icon from '../../../shared/components/Icon';

const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningNote,
  confirmText = 'Xác nhận',
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md scale-100 rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl transition-transform">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500' : 'bg-secondary-container text-on-secondary-container'}`}
          >
            <Icon name={isDanger ? 'alert_triangle' : 'info'} size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-[#999999]">{message}</p>

            {warningNote && (
              <div className="mt-4 rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-3 text-xs font-semibold text-slate-500 dark:text-[#999999]">
                <span className="mr-1 text-red-600 dark:text-red-500">* Lưu ý hệ thống:</span>
                {warningNote}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-slate-500 dark:text-[#999999] transition-colors hover:bg-slate-100 dark:bg-[#272727]"
          >
            Há»§y bá»
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors ${isDanger ? 'bg-error hover:bg-on-error-container' : 'bg-[#004785] dark:bg-blue-600 hover:bg-on-primary-fixed-variant'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;

