import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const ApprovalActionModal = ({ data, onClose, onConfirm }) => {
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  if (!data) return null;

  const { approval, type } = data;
  const isApprove = type === 'approve';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApprove && !reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    if (!isApprove && reason.length > 500) {
      alert('Lý do từ chối không được vượt quá 500 ký tự.');
      return;
    }
    onConfirm(isApprove ? { notes } : { reason });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-3 ${
            isApprove ? 'border-primary/30' : 'border-error-container'
          }`}
        >
          <div className={`flex items-center gap-2 ${isApprove ? 'text-primary' : 'text-error'}`}>
            <Icon name={isApprove ? 'check' : 'x'} size={20} />
            <h3 className="text-base font-bold">
              {isApprove ? 'Xác nhận Duyệt Hồ sơ' : 'Từ chối Hồ sơ'}
            </h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Approval Info */}
          <div
            className={`rounded-md p-3 text-sm ${
              isApprove ? 'bg-tertiary-container/20' : 'bg-error-container/20'
            }`}
          >
            <p className="font-semibold text-on-surface">
              Cửa hàng:{' '}
              <span className={isApprove ? 'text-primary' : 'text-error'}>
                {approval.storeName}
              </span>
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">Mã hồ sơ: {approval.approvalId}</p>
          </div>

          {isApprove ? (
            /* Approve Form */
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Ghi chú duyệt (không bắt buộc)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-primary"
                placeholder="Nhập ghi chú nếu cần..."
                rows="3"
              />
            </div>
          ) : (
            /* Reject Form */
            <div>
              <div className="mb-1 flex items-end justify-between">
                <label className="block text-xs font-semibold text-on-surface-variant">
                  Lý do từ chối (Bắt buộc)
                </label>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    reason.length > 450 ? 'text-error' : 'text-on-surface-variant'
                  }`}
                >
                  {reason.length} / 500
                </span>
              </div>
              <textarea
                required
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setReason(e.target.value);
                }}
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-error"
                placeholder="Nhập lý do từ chối hồ sơ..."
                rows="4"
              />
            </div>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 rounded-md bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-secondary" />
            <span>
              {isApprove ? (
                <>
                  <strong>Hệ thống sẽ tự động:</strong> Tạo chi nhánh mới (Branch) và set
                  IsVerified=true cho Owner.
                </>
              ) : (
                <>
                  <strong>Lưu ý:</strong> Lý do từ chối sẽ được gửi đến email của Owner. Họ có thể
                  nộp lại hồ sơ mới.
                </>
              )}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`rounded-md px-4 py-2 text-sm font-bold shadow-sm ${
                isApprove
                  ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                  : 'bg-error text-on-error hover:bg-on-error-container'
              }`}
            >
              {isApprove ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalActionModal;
