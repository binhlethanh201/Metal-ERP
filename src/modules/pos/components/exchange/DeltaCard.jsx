/**
 * DeltaCard - Hiển thị tiền chênh lệch khi đổi hàng.
 *  Delta > 0 → khách trả thêm (emerald)
 *  Delta < 0 → hoàn lại khách (red)
 *  Delta = 0 → đổi ngang giá (slate)
 */
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const DeltaCard = ({ quote, paymentMethod, onPaymentMethodChange, disabled }) => {
  if (!quote) return null;

  const delta = Number(quote.deltaAmount ?? 0);
  const isPay = delta > 0;
  const isRefund = delta < 0;

  const color = isPay
    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
    : isRefund
      ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
      : 'border-slate-300 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]';
  const textColor = isPay
    ? 'text-emerald-700 dark:text-emerald-400'
    : isRefund
      ? 'text-red-600 dark:text-red-400'
      : 'text-slate-600 dark:text-[#cccccc]';

  return (
    <div className={`rounded-xl border-2 p-4 ${color}`}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-[#999999]">Giá hàng cũ (SP A)</span>
          <span className="font-semibold text-slate-700 dark:text-[#e5e5e5]">
            {formatCurrency(quote.oldValue || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-[#999999]">Giá hàng mới (SP B)</span>
          <span className="font-semibold text-slate-700 dark:text-[#e5e5e5]">
            {formatCurrency(quote.newValue || 0)}
          </span>
        </div>
        <div className="my-2 border-t border-current opacity-20" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600 dark:text-[#cccccc]">
            {quote.deltaLabel || (isPay ? 'Thu thêm' : isRefund ? 'Hoàn lại' : 'Đổi ngang giá')}
          </span>
          <span className={`text-lg font-extrabold ${textColor}`}>
            {isPay ? '+' : isRefund ? '-' : ''}
            {formatCurrency(Math.abs(delta))}
          </span>
        </div>

        {delta !== 0 && (
          <div className="flex items-center gap-2 pt-2">
            <label className="text-xs font-medium text-slate-600 dark:text-[#b3b3b3]">
              Thanh toán
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange?.(e.target.value)}
              disabled={disabled}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#004785] disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            >
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">Chuyển khoản</option>
            </select>
          </div>
        )}

        {!quote.eligible && quote.restrictionReason && (
          <p className="pt-1 text-xs font-semibold text-red-600 dark:text-red-400">
            ❌ {quote.restrictionReason}
          </p>
        )}

        {quote.stockCheck?.some((s) => !s.sufficient) && (
          <div className="pt-1 text-xs text-amber-600 dark:text-amber-400">
            ⚠ Một số SP mới không đủ tồn khả dụng:
            {quote.stockCheck
              .filter((s) => !s.sufficient)
              .map((s) => (
                <span key={s.branchProductId} className="ml-1">
                  {s.productName || s.productCode} (cần {s.requestedBase}, còn {s.availableBase});
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeltaCard;
