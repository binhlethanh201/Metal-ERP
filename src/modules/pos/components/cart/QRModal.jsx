/**
 * QRModal - Hiển thị QR code VietQR cho thanh toán chuyển khoản
 * TODO (FE): Kết nối API GET /pos/payments/{paymentId}/qr khi BE sẵn sàng.
 */
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const QRModal = ({ isOpen, onClose, amount, invoiceCode }) => {
  // TODO (FE): thêm paymentId prop và gọi API khi kết nối BE
  const handleConfirm = () => {
    // TODO (FE): gọi API POST /pos/payments/{paymentId}/confirm-transfer
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán chuyển khoản"
      size="md"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="success" onClick={handleConfirm}>
            Xác nhận đã nhận tiền
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">Số tiền cần chuyển</p>
          <p className="text-3xl font-extrabold text-[#004785]">{formatCurrency(amount)}</p>
          <p className="text-sm text-slate-500">Mã hóa đơn: {invoiceCode}</p>
        </div>

        {/* Placeholder QR — TODO (FE): thay bằng QR thực tế từ API */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <p className="text-4xl">📱</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">QR Code</p>
              <p className="text-[10px] text-slate-300">TODO: gắn API</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Chuyển khoản theo thông tin ngân hàng<br />
            Nội dung: <span className="font-mono font-bold">{invoiceCode}</span>
          </p>
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          <p>1. Mở app ngân hàng</p>
          <p>2. Quét mã QR hoặc chuyển khoản theo nội dung</p>
          <p>3. Sau khi chuyển, bấm "Xác nhận đã nhận tiền"</p>
        </div>
      </div>
    </Modal>
  );
};

export default QRModal;
