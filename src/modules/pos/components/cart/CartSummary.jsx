/**
 * CartSummary Component - Tóm tắt giỏ hàng
 */

import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { Button } from '../../../../shared/components/Button';

export const CartSummary = ({ cart, onCheckout, loading = false }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  const isEmpty = cart.length === 0;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
      <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Tóm tắt đơn hàng</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600 dark:text-[#999999]">
          <span>Tổng cộng:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-[#999999]">
          <span>Thuế (10%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900 dark:border-[#333333] dark:text-[#e5e5e5]">
          <span>Tổng thanh toán:</span>
          <span className="text-[#004785]">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Button
          onClick={onCheckout}
          disabled={isEmpty || loading}
          loading={loading}
          variant="primary"
          className="w-full"
        >
          Thanh toán
        </Button>
        <Button variant="outline" className="w-full">
          Tiếp tục mua
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
