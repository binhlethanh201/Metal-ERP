/**
 * ExchangeCashModal - Popup nhập tiền mặt khi thanh toán chênh lệch đổi hàng (delta>0, CASH).
 * Tối giản cho 1 khoản delta (không phải cart nhiều dòng như PaymentModal POS).
 * Props:
 *  - isOpen, onClose, loading
 *  - amount: số tiền khách phải trả thêm (delta)
 *  - onConfirm(cashReceived): gọi khi bấm "Xác nhận thanh toán"
 */
import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const ExchangeCashModal = ({ isOpen, onClose, amount = 0, loading = false, error = '', onConfirm }) => {
  const [cashReceived, setCashReceived] = useState('');

  // Reset input mỗi lần mở (amount có thể đổi).
  useEffect(() => {
    if (isOpen) setCashReceived(String(amount || ''));
  }, [isOpen, amount]);

  const cash = Number(cashReceived) || 0;
  const change = Math.max(0, cash - amount);
  const valid = cash >= amount && amount > 0;

  const handleConfirm = () => {
    if (!valid || loading) return;
    onConfirm?.(cash);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán tiền mặt — đổi chênh lệch"
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#1f1f1f]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!valid || loading}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-[#1a1a1a]">
          <span className="text-sm text-slate-500 dark:text-[#999999]">Số tiền phải trả thêm</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(amount)}
          </span>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-[#b3b3b3]">
            Khách trả
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-right text-base font-semibold outline-none focus:border-[#004785] disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
            <button
              type="button"
              onClick={() => setCashReceived(String(amount))}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#1f1f1f]"
            >
              Bằng đúng
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-[#333333]">
          <span className="text-sm font-medium text-slate-600 dark:text-[#cccccc]">Tiền thừa trả khách</span>
          <span className="text-base font-bold text-slate-700 dark:text-[#e5e5e5]">
            {formatCurrency(change)}
          </span>
        </div>

        {!valid && amount > 0 && cash > 0 && (
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            Khách trả chưa đủ số tiền phải trả thêm.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ExchangeCashModal;
