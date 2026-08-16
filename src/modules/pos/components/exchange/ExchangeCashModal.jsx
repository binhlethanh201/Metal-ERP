/**
 * ExchangeCashModal - Popup thanh toán tiền mặt khi đổi chênh lệch (delta>0, CASH).
 * Giao diện mirror y hệt dòng "Tiền mặt" trong PaymentModal (máy bán hàng POS).
 * Props:
 *  - isOpen, onClose, loading
 *  - amount: số tiền khách phải trả thêm (delta)
 *  - error: chuỗi lỗi backend (nếu có)
 *  - onConfirm(cashReceived: number): gọi khi bấm "Xác nhận thanh toán"
 */
import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const ExchangeCashModal = ({ isOpen, onClose, amount = 0, loading = false, error = '', onConfirm }) => {
  const [cashReceived, setCashReceived] = useState('');

  // Reset input mỗi lần mở (amount có thể đổi giữa các đơn).
  useEffect(() => {
    if (isOpen) setCashReceived('');
  }, [isOpen, amount]);

  const finalTotal = Number(amount) || 0;
  // Parse bỏ dấu chấm phân cách hàng nghìn trước khi tính.
  const numericReceived = Number((cashReceived || '').toString().replace(/\./g, '')) || 0;
  const remaining = Math.max(0, finalTotal - numericReceived);
  const overpaid = Math.max(0, numericReceived - finalTotal);
  const isValid = numericReceived >= finalTotal && finalTotal > 0;

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\./g, '');
    if (raw === '' || /^\d+$/.test(raw)) {
      setCashReceived(raw === '' ? '' : Number(raw).toLocaleString('vi-VN'));
    }
  };

  const handleQuickFill = () => {
    setCashReceived(finalTotal > 0 ? finalTotal.toLocaleString('vi-VN') : '');
  };

  const handleConfirm = () => {
    if (!isValid || loading) return;
    onConfirm?.(numericReceived);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="success" onClick={handleConfirm} disabled={!isValid} loading={loading}>
            Xác nhận thanh toán ({formatCurrency(finalTotal)})
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
          <div>
            <span className="text-sm text-slate-500 dark:text-[#999999]">Đổi chênh lệch giá</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-slate-500 dark:text-[#999999]">Tổng cộng: </span>
            <span className="block text-xl font-extrabold break-words text-[#004785]">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-[#333333]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-[#b3b3b3]">Hình thức thanh toán</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-800 dark:bg-[#272727] dark:text-[#e5e5e5]">
                  <span>💵</span>
                  <span>Tiền mặt</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-[#999999]">Khách trả</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cashReceived}
                    placeholder="Nhập số tiền..."
                    onChange={handleChange}
                    className="min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 px-4 py-2.5 text-base font-bold focus:border-[#004785] focus:outline-none sm:text-lg dark:border-[#333333] dark:bg-[#1a1a1a]"
                  />
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#004785] hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60"
                    >
                      Nhập nốt {formatCurrency(remaining)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-[#1a1a1a]/50">
            <div className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 shrink-0 text-slate-500">Tổng đơn hàng</span>
              <span className="min-w-0 break-words text-right font-bold text-slate-900 dark:text-[#e5e5e5]">{formatCurrency(finalTotal)}</span>
            </div>
            <div className="flex justify-between gap-2 border-t border-slate-200 pt-2 text-sm dark:border-[#333333]">
              <span className="min-w-0 shrink-0 text-slate-500">Đã nhập</span>
              <span className="min-w-0 break-words text-right font-bold text-slate-900">{formatCurrency(numericReceived)}</span>
            </div>
            {remaining > 0 ? (
              <div className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 shrink-0 font-medium text-red-500">Còn thiếu</span>
                <span className="min-w-0 break-words text-right font-bold text-red-600">{formatCurrency(remaining)}</span>
              </div>
            ) : (
              <div className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 shrink-0 font-medium text-green-600">Đã nhập đủ</span>
                <span className="font-bold text-green-600">✔</span>
              </div>
            )}
            {overpaid > 0 && (
              <div className="mt-2 flex justify-between gap-2 rounded-lg border-2 border-green-400 bg-green-50 p-3 text-sm dark:border-green-600 dark:bg-green-900/30">
                <span className="min-w-0 shrink-0 font-bold text-green-800 dark:text-green-400">Tiền thừa trả khách</span>
                <span className="min-w-0 break-words text-right font-bold text-green-700">+ {formatCurrency(overpaid)}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExchangeCashModal;
