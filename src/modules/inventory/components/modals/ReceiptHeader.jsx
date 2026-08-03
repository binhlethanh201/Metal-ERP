/**
 * ReceiptHeader - Header của Popup Nhập Kho.
 */
import Icon from '../../../../shared/components/Icon';

const ReceiptHeader = ({ receiptType, onTypeChange, onClose }) => (
  <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-slate-200 bg-white px-6 py-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-[#e5e5e5]">THÊM MỚI PHIẾU NHẬP KHO</h1>
      <select
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
        value={receiptType}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="purchase">Mua hàng</option>
        <option value="customer_return">Khách hàng trả lại</option>
        <option value="other">Khác</option>
      </select>
    </div>
    <button
      type="button"
      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
      onClick={onClose}
    >
      <Icon name="close" size={24} />
    </button>
  </div>
);

export default ReceiptHeader;
