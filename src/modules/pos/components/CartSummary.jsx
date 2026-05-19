/**
 * CartSummary Component - Tóm tắt giỏ hàng
 */

import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { Button } from '../../../shared/components/Button';

export const CartSummary = ({ cart, onCheckout, loading = false }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  const isEmpty = cart.length === 0;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Tổng cộng:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Thuế (10%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-lg font-bold text-gray-900">
          <span>Tổng thanh toán:</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
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
