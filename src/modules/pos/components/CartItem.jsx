/**
 * CartItem Component - Mục trong giỏ hàng
 */

import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-3 rounded-lg bg-gray-50 p-3">
      {/* Product Info */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
        <p className="text-xs text-gray-600">{formatCurrency(item.price)}</p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-100"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="w-20 text-right">
        <p className="text-sm font-semibold text-gray-900">{formatCurrency(subtotal)}</p>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-sm font-medium text-red-600 hover:text-red-800"
      >
        ✕
      </button>
    </div>
  );
};

export default CartItem;
