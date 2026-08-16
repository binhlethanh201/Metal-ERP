import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const PaymentModal = ({
  isOpen,
  onClose,
  cart,
  selectedCustomer,
  payLines,
  totalPaid,
  remaining,
  isPaymentValid,
  paying,
  onProcessPayment,
  onAddLine,
  onRemoveLine,
  onLineChange,
  onQuickFill,
}) => {
  const discountAmount = cart?.discountInfo?.discountAmount || 0;
  const finalTotal = Math.max(0, (cart?.subtotal || 0) - discountAmount);
  // 2 payment methods: Cash, Transfer
  const allMethods = [
    { id: 'Cash', name: 'Tiền mặt', icon: '💵' },
    { id: 'Transfer', name: 'Chuyển khoản', icon: '📱' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={onProcessPayment}
            disabled={!isPaymentValid}
            loading={paying}
          >
            Xác nhận thanh toán ({formatCurrency(finalTotal)})
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
          <div>
            <span className="text-sm text-slate-500 dark:text-[#999999]">Khách hàng: </span>
            <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
              {selectedCustomer ? selectedCustomer.name : 'Khách lẻ'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm text-slate-500 dark:text-[#999999]">Tổng cộng: </span>
            <span className="block text-xl font-extrabold break-words text-[#004785]">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>

        <details className="rounded-lg border border-slate-200 dark:border-[#333333]">
          <summary className="cursor-pointer px-4 py-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500 hover:text-slate-700 dark:text-[#999999] dark:hover:text-[#b3b3b3]">
            Chi tiết đơn hàng ({cart.cart.length} sản phẩm)
          </summary>
          <div className="max-h-36 space-y-1 overflow-y-auto border-t border-slate-100 px-4 py-2 dark:border-[#333333]">
            {cart.cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="flex-1 truncate text-slate-700 dark:text-[#b3b3b3]">{item.name}</span>
                <span className="mx-2 text-slate-400 dark:text-[#808080]">
                  x{item.quantity}
                  {item.displayUnit || item.selectedUnit || ''}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-[#999999]">
            <span>Tạm tính</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          {cart.discountInfo && cart.discountInfo.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Giảm giá {cart.discountInfo.discountPercent}%</span>
              <span>-{formatCurrency(cart.discountInfo.discountAmount)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-[#333333]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-[#b3b3b3]">Hình thức thanh toán</h3>
            {(cart?.paymentMethod === 'Kết hợp' || cart?.paymentMethod === 'Combined') && payLines.length < 2 && (
              <button
                type="button"
                onClick={onAddLine}
                className="rounded-lg border border-dashed border-[#004785] px-3 py-1.5 text-xs font-medium text-[#004785] hover:bg-blue-50"
              >
                + Thêm hình thức
              </button>
            )}
          </div>

          <div className="space-y-4">
            {payLines.map((line) => {
              const isCombined = cart?.paymentMethod === 'Kết hợp' || cart?.paymentMethod === 'Combined' || payLines.length > 1;
              return (
              <div key={line.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
                <div className="mb-3 flex items-center justify-between">
                  {isCombined ? (
                    <select
                      value={line.method}
                      onChange={(e) => onLineChange(line.id, 'method', e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a]"
                    >
                      {allMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.icon} {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-800 dark:bg-[#272727] dark:text-[#e5e5e5]">
                      <span>{line.method === 'Transfer' ? '📱' : '💵'}</span>
                      <span>{line.method === 'Transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
                    </div>
                  )}
                  {payLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.id)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:text-[#808080] dark:hover:bg-red-900/30"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-[#999999]">{line.method === 'Cash' ? 'Khách trả' : 'Số tiền'}</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={line.amount ? Number(line.amount).toLocaleString('vi-VN') : ''}
                      placeholder="Nhập số tiền..."
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, '');
                        if (raw === '' || /^\d+$/.test(raw))
                          onLineChange(line.id, 'amount', raw === '' ? 0 : Number(raw));
                      }}
                      className="min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 px-4 py-2.5 text-base font-bold focus:border-[#004785] focus:outline-none sm:text-lg dark:border-[#333333] dark:bg-[#1a1a1a]"
                    />
                    {remaining > 0 && line.amount < remaining && (
                      <button
                        type="button"
                        onClick={() => onQuickFill(line.id)}
                        className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#004785] hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60"
                      >
                        Nhập nốt {formatCurrency(remaining)}
                      </button>
                    )}
                    {/* Removed the buggy ✅ Đủ label entirely */}
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-[#1a1a1a]/50">
            <div className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 shrink-0 text-slate-500">Tổng đơn hàng</span>
              <span className="min-w-0 break-words text-right font-bold text-slate-900 dark:text-[#e5e5e5]">{formatCurrency(finalTotal)}</span>
            </div>
            <div className="flex justify-between gap-2 border-t border-slate-200 pt-2 text-sm dark:border-[#333333]">
              <span className="min-w-0 shrink-0 text-slate-500">Đã nhập</span>
              <span className="min-w-0 break-words text-right font-bold text-slate-900">{formatCurrency(totalPaid)}</span>
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
            {totalPaid > finalTotal && (
              <div className="mt-2 flex justify-between gap-2 rounded-lg border-2 border-green-400 bg-green-50 p-3 text-sm dark:border-green-600 dark:bg-green-900/30">
                <span className="min-w-0 shrink-0 font-bold text-green-800 dark:text-green-400">Tiền thừa trả khách</span>
                <span className="min-w-0 break-words text-right font-bold text-green-700">
                  + {formatCurrency(totalPaid - finalTotal)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
