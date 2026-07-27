/**
 * QRModal - Hiển thị QR code VietQR cho thanh toán chuyển khoản
 * Props:
 *   - isOpen, onClose: Modal controls
 *   - qrData: { paymentId, qrImageBase64, transactionContent, amount, bankAccountNumber, bankName }
 *   - onConfirm: callback khi nhân viên xác nhận đã nhận tiền
 *   - loading: trạng thái đang xác nhận
 */
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const QRModal = ({ isOpen, onClose, qrData, onConfirm, onRefresh, loading }) => {
  if (!qrData) return null;

  const { qrImageBase64, transactionContent, amount, bankAccountNumber, bankName, paymentId } =
    qrData;

  const handleConfirm = () => {
    if (window.confirm('Xác nhận khách đã chuyển khoản thành công?')) {
      onConfirm(paymentId);
    }
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
            Đóng/Hủy
          </Button>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} loading={loading}>
              Làm mới mã
            </Button>
          )}
          <Button variant="success" onClick={handleConfirm} loading={loading}>
            Xác nhận đã nhận tiền
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Số tiền */}
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-[#999999]">Số tiền cần chuyển</p>
          <p className="text-3xl font-extrabold text-[#004785]">{formatCurrency(amount)}</p>
        </div>

        {/* QR Code - Hiển thị từ Base64 */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center rounded-lg border-2 border-[#004785] bg-white p-2 dark:bg-[#0f0f0f]">
            {qrImageBase64 ? (
              <img src={qrImageBase64} alt="VietQR" className="h-48 w-48 object-contain" />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center bg-slate-50 dark:bg-[#1a1a1a]/50">
                <p className="text-sm text-slate-400 dark:text-[#808080]">Không có mã QR</p>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin chuyển khoản */}
        <div className="space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-[#1a1a1a]/50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-[#999999]">Ngân hàng:</span>
            <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">{bankName || 'MB Bank'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-[#999999]">Số tài khoản:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-[#e5e5e5]">
              {bankAccountNumber || '0975849675'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-[#999999]">Nội dung:</span>
            <span className="font-mono font-bold text-green-700">{transactionContent}</span>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="space-y-1 text-xs text-slate-500 dark:text-[#999999]">
          <p className="font-medium text-slate-700 dark:text-[#b3b3b3]">Hướng dẫn:</p>
          <p>1. Khách hàng mở app ngân hàng</p>
          <p>2. Quét mã QR hoặc chuyển khoản theo nội dung trên</p>
          <p>3. Sau khi chuyển, bấm "Xác nhận đã nhận tiền"</p>
        </div>

        {/* Cảnh báo */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/30">
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <span className="font-semibold">Lưu ý:</span> Vui lòng kiểm tra điện thoại xác nhận đã
            nhận tiền trước khi bấm xác nhận!
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default QRModal;
