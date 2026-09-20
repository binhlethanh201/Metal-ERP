/**
 * CartItem Component - Mục trong giỏ hàng
 * Hỗ trợ UOM: hiển thị đơn vị tính với số lượng, stock warning, chiết khấu từng item
 */

import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { useState, useCallback, useEffect, useRef } from 'react';

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
  const rawValueRef = useRef(subtotal.toString());

  // Reset rawValueRef when item price/qty change externally
  useEffect(() => {
    rawValueRef.current = subtotal.toString();
  }, [item.price, item.quantity]);

  const handleDiscountSubmit = useCallback(() => {
    const val = Math.min(100, Math.max(0, Number(discountInput) || 0));
    // Calculate new customTotal based on PREVIOUS effective total
    const prevCustomTotal = item.customTotal || 0;
    const prevDiscountPercent = item.discountPercent || 0;
    const lineTotal = item.price * item.quantity;
    let newCustomTotal;
    if (val === 0) {
      // Discount = 0%, reset to base price × qty
      newCustomTotal = lineTotal;
    } else if (prevCustomTotal > 0 && prevDiscountPercent > 0) {
      // Scale from previous effective total
      const basePrice = prevCustomTotal / Math.max(0.001, 1 - prevDiscountPercent / 100);
      newCustomTotal = Math.round(basePrice * (1 - val / 100));
    } else {
      newCustomTotal = Math.round(lineTotal * (1 - val / 100));
    }
    onDiscountChange?.(item.id, val, newCustomTotal);
    setIsEditingDiscount(false);
  }, [discountInput, item.id, item.price, item.quantity, item.customTotal]);

  const handleDiscountKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDiscountSubmit();
    } else if (e.key === 'Escape') {
      setDiscountInput(discountPercent);
      setIsEditingDiscount(false);
    }
  }, [handleDiscountSubmit, discountPercent]);

  const handleTotalChange = (newTotalRaw, newTotalVal) => {
    const lineTotal = item.price * item.quantity;
    const newTotal = Math.max(0, parseFloat(newTotalRaw) || 0);
    const customTotal = newTotalVal != null ? newTotalVal : newTotal;

    let calculatedDiscountPercent = 0;
    if (newTotal < lineTotal) {
      calculatedDiscountPercent = ((lineTotal - newTotal) / lineTotal) * 100;
    } else {
      // newTotal >= lineTotal → no discount, set to 0
      calculatedDiscountPercent = 0;
    }

    const roundedDiscount = Math.round(calculatedDiscountPercent * 100) / 100;
    onDiscountChange?.(item.id, roundedDiscount, customTotal);
  };

  return (
    <div className="flex gap-3 rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
      {/* Product Info */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{item.name}</h4>

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

        {/* Thành tiền - Editable */}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[9px] font-medium text-slate-400 dark:text-[#666]">Thành tiền</span>
          <input
            type="text"
            defaultValue={subtotal.toLocaleString('vi-VN')}
            onChange={(e) => {
              const selEnd = e.target.selectionEnd;
              const numStr = e.target.value.replace(/[^0-9]/g, '');
              rawValueRef.current = numStr;
              e.target.value = parseInt(numStr || 0).toLocaleString('vi-VN');
              if (!numStr) return;
              const numVal = parseInt(numStr, 10);
              handleTotalChange(numStr, numVal);
              setTimeout(() => {
                e.target.setSelectionRange(selEnd || numStr.length, selEnd || numStr.length);
              }, 0);
            }}
            onFocus={(e) => {
              e.target.select();
              rawValueRef.current = e.target.value.replace(/[^0-9]/g, '');
            }}
            onBlur={(e) => {
              const numStr = e.target.value.replace(/[^0-9]/g, '');
              const val = parseInt(numStr || subtotal, 10);
              if (isNaN(val) || val <= 0) {
                rawValueRef.current = subtotal.toString();
              }
              e.target.value = parseInt(rawValueRef.current).toLocaleString('vi-VN');
              // When blurred back to default, clear customTotal from state
              const diff = Math.abs(parseInt(rawValueRef.current || 0) - parseInt(subtotal));
              if (diff < 1) {
                onDiscountChange?.(item.id, 0, 0);
              }
            }}
            className="w-32 rounded border border-transparent bg-transparent px-1 py-0.5 text-left text-xs font-semibold text-[#004785] outline-none transition-colors hover:border-slate-200 focus:border-blue-400 focus:bg-white dark:hover:border-[#333] dark:focus:border-blue-500 dark:focus:bg-[#0f0f0f] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {discountPercent > 0 && (
            <span className="text-[9px] text-slate-400 line-through">
              ({formatCurrency(subtotal)})
            </span>
          )}
        </div>

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
          {(displayUnit || item.baseUnit) && item.convertValue !== 1 && (
            <span className="text-[10px] text-slate-400 dark:text-[#808080]">{displayUnit || item.baseUnit}</span>
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
