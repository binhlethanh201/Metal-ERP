/**
 * Hook quản lý giỏ hàng POS - add, changeQty, remove, clearCart, voucher, paymentMethod.
 * Tự tính subtotal, discount, VAT (8%), total. Export toàn bộ state + handlers.
 */
import { useState, useCallback } from 'react';

export const usePosCart = (initialItems = []) => {
  const [cart, setCart] = useState(initialItems);
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existed = prev.find((item) => item.id === product.id);
      if (existed)
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
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
    removeItem,
    clearCart,
    applyVoucher,
    subtotal,
    discount,
    vat,
    total,
  };
};
