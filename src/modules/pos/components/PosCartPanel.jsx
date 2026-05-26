/** Panel giỏ hàng POS - Danh sách item + số lượng + voucher + tạm tính/VAT/tổng + phương thức TT + nút Thanh toán/Lưu nháp. */
import Icon from '../../../shared/components/Icon';
const formatCurrency = (v) => `${Math.max(0, v).toLocaleString('vi-VN')}đ`;

const PosCartPanel = ({
  cart,
  voucher,
  onVoucherChange,
  onApplyVoucher,
  paymentMethod,
  onPaymentMethodChange,
  subtotal,
  discount,
  vat,
  total,
  onClearCart,
  onPay,
  onSaveDraft,
  onQtyChange,
  onRemoveItem,
}) => {
  const paymentMethods = [
    ['payments', 'Tiền mặt'],
    ['account_balance', 'Chuyển khoản'],
    ['qr_code_2', 'QR Code'],
    ['credit_card', 'Thẻ ngân hàng'],
  ];

  return (
    <aside className="fixed bottom-12 right-0 top-16 z-30 flex w-[400px] flex-col border-l border-slate-200 bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Giỏ hàng hiện tại
        </h3>
        <button onClick={onClearCart} className="text-slate-400 hover:text-red-600 active:scale-95">
          <Icon name="delete" />
        </button>
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col gap-y-4 overflow-y-auto p-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-x-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="truncate text-xs font-bold text-slate-900">{item.name}</h5>
              <div className="mt-1 text-xs font-black text-[#004785]">
                {formatCurrency(item.price)}
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <button
                onClick={() => onQtyChange(item.id, -1)}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                -
              </button>
              <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
              <button
                onClick={() => onQtyChange(item.id, 1)}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                +
              </button>
            </div>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="ml-2 text-slate-300 hover:text-red-600 active:scale-95"
            >
              <Icon name="close" className="text-sm" />
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
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Mã giảm giá
          </div>
          <div className="flex gap-x-2">
            <input
              value={voucher}
              onChange={(e) => onVoucherChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onApplyVoucher()}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#004785]"
              placeholder="Nhập mã..."
              type="text"
            />
            <button
              onClick={onApplyVoucher}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase text-slate-700 transition-colors hover:bg-slate-300 active:scale-95"
            >
              Áp dụng
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Giảm giá</span>
            <span className="text-red-600">- {formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Thuế VAT (8%)</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <div className="my-1 h-px bg-slate-200" />
          <div className="flex items-end justify-between">
            <span className="text-xs font-bold uppercase text-slate-900">Tổng cộng</span>
            <span className="text-2xl font-black text-[#004785]">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {paymentMethods.map(([icon, method]) => (
            <button
              key={method}
              onClick={() => onPaymentMethodChange(method)}
              className={`flex items-center gap-x-2 rounded-lg border p-2 transition-colors active:scale-95 ${paymentMethod === method ? 'border-[#004785] bg-[#004785]/5 text-[#004785]' : 'border-slate-200 bg-white text-slate-600 hover:border-[#004785]'}`}
            >
              <Icon name={icon} className="text-sm" />
              <span className="text-[10px] font-bold">{method}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-y-2">
          <button
            onClick={onPay}
            className="w-full rounded-lg bg-[#004785] py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all hover:opacity-90 active:scale-95"
          >
            THANH TOÁN (F9)
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
