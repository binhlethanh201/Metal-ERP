/** Panel giỏ hàng POS - Danh sách item + số lượng + chọn khách hàng + tạm tính/giảm giá/tổng + nút Thanh toán/Lưu nháp. */
import Icon from '../../../../shared/components/Icon';
const formatCurrency = (v) => `${Math.max(0, v).toLocaleString('vi-VN')}đ`;

const PosCartPanel = ({
  cart,
  subtotal,
  discountInfo,
  total,
  onClearCart,
  onPay,
  onSaveDraft,
  onQtyChange,
  onRemoveItem,
  payMethod,
  onPayMethodChange,
  isSplitPay,
  onToggleSplitPay,
  onOpenHeldOrders,
  onOpenPriceCheck,
  onOpenStockCheck,
  embedded,
  disabled = false,
}) => {
  const paymentMethods = [
    ['payments', 'Tiền mặt'],
    ['account_balance', 'Chuyển khoản'],
    ['merge', 'Kết hợp'],
  ];
  return (
    <aside
      className={`flex flex-col bg-white ${
        embedded
          ? 'h-full'
          : 'fixed bottom-12 right-0 top-16 z-30 w-[400px] border-l border-slate-200 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Giỏ hàng hiện tại
        </h3>
        <button onClick={onClearCart} className="text-slate-400 hover:text-red-600 active:scale-95">
          <Icon name="delete" />
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="custom-scrollbar flex flex-1 flex-col gap-y-4 overflow-y-auto p-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-x-2">
            <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {item.image ? (
                <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
              ) : (
                <span className="text-xs font-bold text-slate-300">
                  {item.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h5 className="truncate text-sm font-bold text-slate-900">{item.name}</h5>
              <div className="mt-0.5 whitespace-nowrap text-base font-black text-[#004785]">
                {formatCurrency(item.price)}
                <span className="ml-1 text-xs font-medium text-slate-500">
                  / {item.displayUnit || item.selectedUnit || 'Cái'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-1.5">
              {item.quantity > 1 && (
                <span className="ml-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                  Thành tiền:
                  <span className="ml-1 text-sm font-black text-[#004785]">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </span>
              )}
              <button
                onClick={() => onQtyChange(item.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={item.stock || 999999}
                step="1"
                value={item.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) {
                    const maxQty = item.stock || Infinity;
                    const clamped = Math.min(val, maxQty);
                    onQtyChange(item.id, clamped - item.quantity);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === '.') e.preventDefault();
                }}
                className="w-8 text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => onQtyChange(item.id, 1)}
                disabled={item.quantity >= (item.stock || 999999)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-base text-slate-300 hover:text-red-600 active:scale-95"
            >
              <Icon name="close" className="text-base" />
            </button>
          </div>
        ))}
        {cart.length === 0 && (
          <div className="py-16 text-center text-sm font-semibold text-slate-400">
            Giỏ hàng trống
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-6">
        <div className="mb-4 flex flex-col gap-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountInfo && discountInfo.discountAmount > 0 && (
            <div className="flex justify-between text-xs font-medium text-emerald-600">
              <span>Giảm giá {discountInfo.discountPercent}%</span>
              <span>- {formatCurrency(discountInfo.discountAmount)}</span>
            </div>
          )}
          <div className="my-1 h-px bg-slate-200" />
          <div className="flex items-end justify-between">
            <span className="text-xs font-bold uppercase text-slate-900">Tổng cộng</span>
            <span className="text-2xl font-black text-[#004785]">
              {formatCurrency(subtotal - (discountInfo?.discountAmount || 0))}
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {paymentMethods.map(([icon, method]) => (
            <button
              key={method}
              onClick={() => {
                onToggleSplitPay(false);
                onPayMethodChange(method);
              }}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2.5 transition-all active:scale-95 ${
                !isSplitPay && payMethod === method
                  ? 'border-[#004785] bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Icon name={icon} className="text-lg" />
              <span className="text-[10px] font-bold text-slate-600">{method}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-y-2">
          <button
            onClick={onPay}
            disabled={disabled}
            className={`w-full rounded-lg py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 ${
              disabled
                ? 'cursor-not-allowed bg-slate-400 text-slate-200'
                : 'bg-[#004785] text-white hover:opacity-90'
            }`}
          >
            {disabled ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN (F9)'}
          </button>
          <button
            onClick={onSaveDraft}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 transition-all hover:border-[#004785] hover:text-[#004785] active:scale-95"
          >
            Lưu bản nháp
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PosCartPanel;
