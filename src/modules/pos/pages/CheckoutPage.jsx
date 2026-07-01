/**
 * CheckoutPage - Trang thanh toán (Đã tích hợp với POSScreen)
 * NOTE: Trang này hiện không được sử dụng vì POSScreen xử lý thanh toán trực tiếp
 * Giữ lại cho trường hợp cần flow riêng
 */
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const CheckoutPage = ({ cartItems = [], customer = null, onBack }) => {
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const discount = 0;
  const vat = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + vat;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/pos');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-[#004785]"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Thanh toán</h1>
          <p className="mt-1 text-sm text-slate-500">
            {customer ? `Khách hàng: ${customer.name}` : 'Khách lẻ'}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <Card header="Chi tiết đơn hàng">
        <div className="space-y-3">
          {cartItems.length === 0 ? (
            <p className="py-4 text-center text-slate-400">Giỏ hàng trống</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id || item.productId}
                className="flex justify-between rounded-lg bg-slate-50 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity || 1} x {formatCurrency(item.price || 0)}
                  </p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-slate-600">
            <span>Tổng tiền hàng:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Thuế VAT (8%):</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
            <span>TỔNG CỘNG:</span>
            <span className="text-[#004785]">{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>

      {/* Action */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={handleBack}>
          Quay lại
        </Button>
        <Button variant="primary" className="flex-1" disabled={cartItems.length === 0}>
          Thanh toán
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
