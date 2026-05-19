/**
 * PaymentBox Component - Hộp thanh toán
 */

import { useState } from 'react';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { mockPaymentMethods } from '../data/posMockData';

export const PaymentBox = ({ total, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(total);
  const [loading, setLoading] = useState(false);

  const change = amountPaid - total;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Giả lập gọi API
      setTimeout(() => {
        onPaymentComplete({
          method: selectedMethod,
          amount: amountPaid,
          timestamp: new Date(),
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900">Chọn phương thức thanh toán</h3>

      {/* Payment Methods */}
      <div className="grid grid-cols-3 gap-2">
        {mockPaymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`rounded-lg border-2 p-3 text-center transition-all ${
              selectedMethod === method.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } `}
          >
            <div className="mb-1 text-2xl">{method.icon}</div>
            <p className="text-xs font-medium text-gray-900">{method.name}</p>
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <Input
        label="Số tiền khách trả"
        type="number"
        value={amountPaid}
        onChange={(e) => setAmountPaid(Number(e.target.value))}
        min={total}
      />

      {/* Change */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-blue-900">Tổng cần thanh toán:</span>
          <span className="font-semibold text-blue-900">{formatCurrency(total)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-blue-200 pt-2 text-sm">
          <span className="text-blue-900">Tiền thừa:</span>
          <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(change)}
          </span>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={amountPaid < total || loading}
        loading={loading}
        variant="success"
        className="w-full"
      >
        Thanh toán
      </Button>
    </div>
  );
};

export default PaymentBox;
