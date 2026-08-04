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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isDanger
                ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-500'
                : 'bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            <Icon name={isDanger ? 'warning' : 'info'} size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-[#999999]">{message}</p>

            {warningNote && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                <span className="mr-1 text-red-600 dark:text-red-500">* Lưu ý:</span>
                {warningNote}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-[#004785] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;