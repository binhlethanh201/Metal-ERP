/**
 * Hook quản lý giỏ hàng POS - add, changeQty, remove, clearCart, voucher, paymentMethod.
 * Tự tính subtotal, discount, VAT (8%), total. Export toàn bộ state + handlers.
 * Hỗ trợ UOM (Unit of Measurement) - đơn vị quy đổi với số lẻ.
 */
import { useState, useCallback } from 'react';

export const usePosCart = (initialItems = []) => {
  const [cart, setCart] = useState(initialItems);
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  /**
   * Thêm sản phẩm vào giỏ hàng với hỗ trợ UOM
   * @param {Object} product - Sản phẩm
   * @param {Object|null} selectedUnit - Đơn vị đã chọn { convertValue, price, name }
   */
  const addToCart = useCallback((product, selectedUnit = null) => {
    setCart((prev) => {
      // Tạo ID riêng nếu có đơn vị quy đổi (để cùng sản phẩm khác đơn vị vẫn thêm riêng)
      const itemId = selectedUnit ? `${product.id}-${selectedUnit.name}` : product.id;

      const existed = prev.find((item) => item.id === itemId);

      // Xác định đơn vị và giá
      const unitName = selectedUnit?.name || product.unit || 'Cái';
      const convertValue = selectedUnit?.convertValue || 1;
      const price = selectedUnit?.price ?? product.price;

      // Tạo displayUnit string
      const baseUnit = product.unit || 'Cái';
      const displayUnit = convertValue === 1 ? unitName : `${unitName} (×${convertValue})`;

      if (existed) {
        const maxQty = existed.stock || Infinity;
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.min(maxQty, item.quantity + 1) } : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          id: itemId,
          quantity: 1,
          price, // Giá theo đơn vị đã chọn
          selectedUnit: unitName,
          convertValue,
          displayUnit,
          baseUnit,
          stock: product.stock || 0,
        },
      ];
    });
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = Math.round(item.quantity + delta);
          const maxQty = item.stock || Infinity;
          return { ...item, quantity: Math.max(1, Math.min(maxQty, newQty)) };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  /**
   * Set số lượng trực tiếp (cho input)
   */
  const setItemQuantity = useCallback((id, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const maxQty = item.stock || Infinity;
          return { ...item, quantity: Math.max(1, Math.min(maxQty, Math.round(quantity))) };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedVoucher('');
    setVoucher('');
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const voucherDiscount = appliedVoucher ? 50000 : 0;
  const discount = cart.length > 0 ? voucherDiscount : 0;
  const vat = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + vat;

  const applyVoucher = useCallback(() => {
    if (!voucher.trim()) return false;
    setAppliedVoucher(voucher.trim().toUpperCase());
    return true;
  }, [voucher]);

  return {
    cart,
    voucher,
    setVoucher,
    appliedVoucher,
    paymentMethod,
    setPaymentMethod,
    addToCart,
    changeQty,
    setItemQuantity,
    removeItem,
    clearCart,
    applyVoucher,
    subtotal,
    discount,
    vat,
    total,
  };
};
