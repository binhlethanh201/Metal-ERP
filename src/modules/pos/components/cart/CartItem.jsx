/**
 * CartItem Component - Mục trong giỏ hàng
 * Hỗ trợ UOM: hiển thị đơn vị tính với số lượng, stock warning
 */

import { formatCurrency } from '../../../../shared/utils/formatCurrency';

export const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const subtotal = item.price * item.quantity;
  const displayUnit = item.displayUnit || item.selectedUnit || '';

  // Tính stock còn lại sau khi mua
  const baseStock = item.baseStock ?? item.stock ?? 0;
  const actualQtyUsed = item.quantity * (item.convertValue || 1);
  const remainingStock = Math.max(0, baseStock - actualQtyUsed);
  const isLowStock = remainingStock <= 0;

  return (
    <div className="flex gap-3 rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
      {/* Product Info */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{item.name}</h4>
        <p className="text-xs text-slate-500 dark:text-[#999999]">
          {formatCurrency(item.price)}
          {displayUnit && <span className="ml-1 text-slate-400 dark:text-[#808080]">/ {displayUnit}</span>}
        </p>
        {/* Stock warning */}
        {item.convertValue !== 1 && (
          <p
            className={`text-[10px] ${isLowStock ? 'font-semibold text-red-500' : 'text-slate-400 dark:text-[#808080]'}`}
          >
            Còn {remainingStock.toFixed(2)} {item.baseUnit || ''}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm hover:bg-slate-100 dark:border-[#333333] dark:bg-[#0f0f0f] dark:hover:bg-[#272727]"
        >
          −
        </button>
        <div className="flex flex-col items-center">
          <span className="w-12 text-center text-sm font-semibold">{item.quantity}</span>
          {displayUnit && item.convertValue !== 1 && (
            <span className="text-[10px] text-slate-400 dark:text-[#808080]">{displayUnit}</span>
          )}
          {displayUnit && item.convertValue !== 1 && (
            <span
              className="text-[10px] text-slate-400 dark:text-[#808080]"
              title={`Tương đương ${(item.quantity * item.convertValue).toFixed(2)} ${item.baseUnit || ''}`}
            >
              (≈ {(item.quantity * item.convertValue).toFixed(2)} {item.baseUnit || ''})
            </span>
          )}
        </div>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm hover:bg-slate-100 dark:border-[#333333] dark:bg-[#0f0f0f] dark:hover:bg-[#272727]"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="w-20 text-right">
        <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{formatCurrency(subtotal)}</p>
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
