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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md scale-100 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl transition-transform">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-error-container text-error' : 'bg-secondary-container text-on-secondary-container'}`}
          >
            <Icon name={isDanger ? 'alert_triangle' : 'info'} size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{message}</p>

            {warningNote && (
              <div className="mt-4 rounded-md border border-outline-variant bg-surface-container-low p-3 text-xs font-semibold text-on-surface-variant">
                <span className="mr-1 text-error">* Lưu ý hệ thống:</span>
                {warningNote}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-surface-container-high pt-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors ${isDanger ? 'bg-error hover:bg-on-error-container' : 'bg-primary hover:bg-on-primary-fixed-variant'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
