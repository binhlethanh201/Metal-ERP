import { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Textarea } from '../../../../shared/components/Textarea';

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

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy phiếu (bắt buộc theo quy định kho)');
      return;
    }
    onConfirm(reason.trim());
  };

  const isCompleted = ticketStatus === 'COMPLETED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButton={!isSubmitting}
      size="md"
      title={
        <span className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={20} /> Xác nhận hủy phiếu
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Quay lại
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Bạn đang yêu cầu hủy phiếu mã:{' '}
          <strong className="font-bold text-slate-900">{ticketCode || 'N/A'}</strong>
        </p>

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
          <div className="flex items-start gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-800">
            <Info size={15} className="mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              Phiếu đang ở trạng thái <strong>PENDING</strong> (chưa xác nhận vào kho). Hủy phiếu sẽ
              không làm ảnh hưởng đến số lượng tồn kho.
            </div>
          </div>
        )}

        <Textarea
          label="Lý do hủy phiếu"
          required
          rows={3}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
          placeholder="VD: Sai số lượng hàng thực tế, NCC đổi lại lô khác..."
          disabled={isSubmitting}
          error={error}
        />
      </div>
    </Modal>
  );
};

export default CancelTicketModal;
