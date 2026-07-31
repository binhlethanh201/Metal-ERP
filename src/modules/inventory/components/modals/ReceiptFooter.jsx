/**
 * ReceiptFooter - Footer Popup Nhập Kho (totals + attach + actions).
 */
import Icon from '../../../../shared/components/Icon';

const fmt = (v) => (v != null ? v.toLocaleString('vi-VN') : '0');

const ReceiptFooter = ({ p, onClose }) => (
  <div className="shrink-0 rounded-b-xl border-t-2 border-slate-200 bg-white px-6 py-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
    {!p.isCustomerReturn && (
      <div className="mb-3 grid grid-cols-2 gap-4 text-right">
        <div>
          <span className="text-xs text-slate-500 dark:text-[#999999]">Tổng tiền hàng</span>
          <div className="text-base font-bold text-slate-800 dark:text-[#e5e5e5]">{fmt(p.totalAmount)}</div>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-[#999999]">Tổng thanh toán</span>
          <div className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">{fmt(p.totalPayment)} VND</div>
        </div>
      </div>
    )}
    <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-[#333333]">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-[#404040] dark:text-[#999999]"
        onClick={p.handleAttach}
      >
        <Icon name="upload_file" className="text-base" /> Chọn tệp
      </button>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#333333]"
          onClick={onClose}
        >
          Hủy
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#004785] px-7 py-2.5 text-sm font-bold text-white hover:bg-[#003566] disabled:opacity-50"
          onClick={p.handleSubmit}
          disabled={!p.isValid || p.saving}
        >
          {p.saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </div>
  </div>
);

export default ReceiptFooter;
