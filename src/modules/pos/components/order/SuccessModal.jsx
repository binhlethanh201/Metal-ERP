import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';

const SuccessModal = ({ isOpen, onViewReceipt, onContinue, lastOrder }) => (
  <Modal isOpen={isOpen} onClose={onContinue} title="" size="sm" closeButton={false} footer={null}>
    <div className="py-4 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
        <svg
          className="h-9 w-9 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#e5e5e5]">Tạo đơn hàng thành công!</h2>
      {lastOrder && (
        <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
          Mã đơn: <span className="font-bold text-[#004785]">{lastOrder.id}</span>
        </p>
      )}
      <p className="mt-1 text-xs text-slate-400 dark:text-[#808080]">{new Date().toLocaleString('vi-VN')}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button variant="primary" onClick={onViewReceipt}>
          Xem hóa đơn
        </Button>
        <Button variant="secondary" onClick={onContinue}>
          Tiếp tục bán hàng
        </Button>
      </div>
    </div>
  </Modal>
);

export default SuccessModal;
