import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import Icon from '../../../../shared/components/Icon';

const HoldNoteModal = ({ isOpen, onClose, onConfirm }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({ holdNote: note.trim() || undefined });
      setNote('');
      onClose();
    } catch {
      // lỗi được xử lý bên ngoài
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Treo hóa đơn"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={loading}>
            Treo đơn
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Icon name="info" size={20} className="flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Hóa đơn sẽ được lưu tạm và có thể khôi phục trong <strong>24 giờ</strong>. Tối đa{' '}
            <strong>10 đơn treo</strong> cùng lúc.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</label>
          <textarea
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#004785]"
            placeholder="VD: Khách hẹn quay lại thanh toán..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default HoldNoteModal;
