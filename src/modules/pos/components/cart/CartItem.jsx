/**
 * CartItem Component - Mục trong giỏ hàng
 * Hỗ trợ UOM: hiển thị đơn vị tính với số lượng, stock warning, chiết khấu từng item
 */

import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { useState, useCallback } from 'react';

export const CartItem = ({ item, onQuantityChange, onRemove, onDiscountChange }) => {
  const subtotal = item.price * item.quantity;
  const discountPercent = item.discountPercent || 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const finalSubtotal = subtotal - discountAmount;
  const displayUnit = item.displayUnit || item.selectedUnit || '';

  // Tính stock còn lại sau khi mua
  const baseStock = item.baseStock ?? item.stock ?? 0;
  const actualQtyUsed = item.quantity * (item.convertValue || 1);
  const remainingStock = Math.max(0, baseStock - actualQtyUsed);
  const isLowStock = remainingStock <= 0;

  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState(discountPercent);

  const handleDiscountSubmit = useCallback(() => {
    const val = Math.min(100, Math.max(0, Number(discountInput) || 0));
    onDiscountChange?.(item.id, val);
    setIsEditingDiscount(false);
  }, [discountInput, item.id, onDiscountChange]);

  const handleDiscountKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDiscountSubmit();
    } else if (e.key === 'Escape') {
      setDiscountInput(discountPercent);
      setIsEditingDiscount(false);
    }
  }, [handleDiscountSubmit, discountPercent]);

  return (
    <div className="flex gap-3 rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
      {/* Product Info */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{item.name}</h4>
        <p className="text-xs text-slate-500 dark:text-[#999999]">
          {formatCurrency(item.price)}
          {displayUnit && <span className="ml-1 text-slate-400 dark:text-[#808080]">/ {displayUnit}</span>}
        </p>

        {/* Discount info */}
        {discountPercent > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Chiết khấu: {discountPercent}%
            </span>
            <span className="text-[10px] text-slate-400 dark:text-[#808080] line-through">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <p className="text-xs font-semibold text-[#004785]">
          Thành tiền: {formatCurrency(finalSubtotal)}
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

      {/* Discount Input */}
      <div className="flex w-28 flex-col items-center gap-1">
        {isEditingDiscount ? (
          <>
            <input
              type="number"
              min="0"
              max="100"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              onBlur={handleDiscountSubmit}
              onKeyDown={handleDiscountKeyDown}
              autoFocus
              className="w-full rounded border border-blue-400 bg-white px-1.5 py-0.5 text-center text-sm font-semibold outline-none dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
            />
            <span className="text-[9px] text-slate-400">%</span>
          </>
        ) : (
          <button
            onClick={() => {
              setIsEditingDiscount(true);
              setDiscountInput(discountPercent);
            }}
            className="flex h-7 w-full items-center justify-center rounded border border-dashed border-slate-300 bg-white text-xs font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-[#444] dark:bg-[#0f0f0f] dark:text-[#808080]"
            title="Nhập chiết khấu %"
          >
            {discountPercent > 0 ? `${discountPercent}%` : 'Chiết khấu'}
          </button>
        )}
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
