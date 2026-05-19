/**
 * ReceiptPreview Component - Xem trước hóa đơn
 */

import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../shared/utils/formatDate';
import { Button } from '../../../shared/components/Button';

export const ReceiptPreview = ({ order, onPrint, onClose }) => {
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 border-b border-gray-300 pb-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">HÓA ĐƠN BÁN HÀNG</h2>
        <p className="text-sm text-gray-600">Mã: {order.id}</p>
      </div>

      {/* Company Info */}
      <div className="mb-4 text-center text-xs text-gray-600">
        <p className="font-medium">CÔNG TY BÁN LẺ XYZ</p>
        <p>Địa chỉ: 123 Đường ABC, TP HCM</p>
        <p>Điện thoại: 0123-456-789</p>
      </div>

      {/* Items */}
      <div className="mb-4 border-b border-t border-gray-300 py-4">
        <div className="mb-2 grid grid-cols-4 gap-1 text-xs font-semibold text-gray-900">
          <span>Tên hàng</span>
          <span className="text-right">SL</span>
          <span className="text-right">Giá</span>
          <span className="text-right">TT</span>
        </div>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-1 text-xs text-gray-800">
              <span className="truncate">{item.name}</span>
              <span className="text-right">{item.quantity}</span>
              <span className="text-right">{(item.price / 1000).toFixed(0)}K</span>
              <span className="text-right font-medium">
                {((item.price * item.quantity) / 1000).toFixed(0)}K
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Tổng tiền hàng:</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Thuế VAT (10%):</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold text-gray-900">
          <span>TỔNG CỘNG:</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4 rounded bg-gray-50 p-3 text-xs text-gray-700">
        <p>
          <strong>Phương thức TT:</strong> {order.paymentMethod}
        </p>
        <p>
          <strong>Số tiền trả:</strong> {formatCurrency(order.amountPaid)}
        </p>
        <p>
          <strong>Tiền thừa:</strong> {formatCurrency(order.amountPaid - order.total)}
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-600">
        <p>Cảm ơn quý khách!</p>
        <p>{formatDateTime(new Date())}</p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <Button onClick={onPrint} variant="primary" className="flex-1">
          In hóa đơn
        </Button>
        <Button onClick={onClose} variant="secondary" className="flex-1">
          Đóng
        </Button>
      </div>
    </div>
  );
};

export default ReceiptPreview;
