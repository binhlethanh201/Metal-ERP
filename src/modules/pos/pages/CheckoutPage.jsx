/**
 * CheckoutPage - Trang thanh toán
 */

import { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { PaymentBox } from '../components/PaymentBox';
import { ReceiptPreview } from '../components/ReceiptPreview';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const CheckoutPage = ({ cartItems = [] }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePaymentComplete = (paymentInfo) => {
    const order = {
      id: 'ORD' + Date.now(),
      items: cartItems,
      subtotal,
      tax,
      total,
      ...paymentInfo,
    };
    setCompletedOrder(order);
    setShowPaymentModal(false);
    setShowReceipt(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        <p className="mt-1 text-gray-600">Kiểm tra và xác nhận đơn hàng</p>
      </div>

      {/* Order Summary */}
      <Card header="Chi tiết đơn hàng">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between rounded bg-gray-50 p-3">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-gray-700">
            <span>Tổng tiền hàng:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Thuế VAT (10%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold text-gray-900">
            <span>TỔNG CỘNG:</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>

      {/* Action */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1">
          Quay lại
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => setShowPaymentModal(true)}>
          Tiến hành thanh toán
        </Button>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Phương thức thanh toán"
        size="md"
      >
        <PaymentBox total={total} onPaymentComplete={handlePaymentComplete} />
      </Modal>

      {/* Receipt Modal */}
      {completedOrder && (
        <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Hóa đơn" size="sm">
          <ReceiptPreview
            order={completedOrder}
            onPrint={handlePrintReceipt}
            onClose={() => setShowReceipt(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CheckoutPage;
