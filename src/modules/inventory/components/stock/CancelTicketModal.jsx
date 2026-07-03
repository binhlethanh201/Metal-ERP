import { useState, useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

export const CancelTicketModal = ({
  isOpen,
  onClose,
  onConfirm,
  ticketCode,
  ticketStatus,
  isSubmitting,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Reset form mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy phiếu (bắt buộc theo quy định kho)');
      return;
    }
    onConfirm(reason.trim());
  };

  const isCompleted = ticketStatus === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={20} />
            <h3 className="text-lg font-bold">Xác nhận hủy phiếu</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-slate-600">
            Bạn đang yêu cầu hủy phiếu mã:{' '}
            <strong className="font-bold text-slate-900">{ticketCode || 'N/A'}</strong>
          </p>

          {/* Banner thông báo nghiệp vụ Rollback kho */}
          {isCompleted ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
              <div className="mb-1 flex items-start gap-2 font-semibold text-amber-900">
                <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Lưu ý: Rollback tồn kho tự động</span>
              </div>
              Phiếu này đã ở trạng thái <strong>COMPLETED</strong>. Khi hủy, hệ thống sẽ tự động{' '}
              <strong>cập nhật lại (hoàn lại) số lượng tồn kho thực tế</strong>.
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 p-3.5 text-xs text-sky-800">
              <Info size={15} className="mt-0.5 flex-shrink-0 text-sky-600" />
              <div>
                Phiếu đang ở trạng thái <strong>PENDING</strong> (chưa xác nhận vào kho). Hủy phiếu
                sẽ không làm ảnh hưởng đến số lượng tồn kho.
              </div>
            </div>
          )}

          {/* Nhập lý do */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Lý do hủy phiếu <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="VD: Sai số lượng hàng thực tế, NCC đổi lại lô khác..."
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 disabled:bg-slate-50"
            />
            {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
