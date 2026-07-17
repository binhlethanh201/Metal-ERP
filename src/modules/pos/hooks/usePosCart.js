/**
 * Hook quản lý giỏ hàng POS - add, changeQty, remove, clearCart, voucher, paymentMethod.
 * Tự tính subtotal, discount, VAT (8%), total. Export toàn bộ state + handlers.
 * Hỗ trợ UOM (Unit of Measurement) - đơn vị quy đổi với số lẻ.
 */
import { useState, useCallback, useEffect } from 'react';

const CART_STORAGE_KEY = 'pos_cart_items';

/**
 * Helper: Tính productId gốc từ item.id (cắt phần "-unitName" nếu có)
 */
const getProductId = (item) => {
  if (item.productId) return item.productId;
  return item.id.split('-').slice(0, -1).join('-') || item.id;
};

/**
 * Helper: Tính tổng base units đã sử dụng cho 1 productId (loại trừ 1 item nếu specify)
 */
const calcUsedStock = (items, productId, excludeItemId = null) => {
  return items
    .filter((it) => getProductId(it) === productId && it.id !== excludeItemId)
    .reduce((sum, it) => sum + it.quantity * (it.convertValue || 1), 0);
};

export const usePosCart = (initialItems = []) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialItems;
    } catch {
      return initialItems;
    }
  });
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch {}
  }, [cart]);

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
      let displayUnit;
      if (convertValue === 1) displayUnit = unitName;
      else if (convertValue >= 1)
        displayUnit = `${unitName} (×${convertValue})`; // Thùng (×12)
      else displayUnit = `${unitName} (1/${Math.round(1 / convertValue)} ${baseUnit})`; // Mét (1/100 Cuộn)

      // Lấy stock (API trả về đã là base unit)
      const baseStock = product.baseStock ?? product.availableStock ?? product.stock ?? 0;

      // === FIX: Kiểm tra stock overdraw cho cùng productId ===
      // Tính base units đã sử dụng bởi các items khác cùng productId (loại trừ existed)
      const otherUsedStock = calcUsedStock(prev, product.id, existed ? itemId : null);
      const newActualQty = (existed ? existed.quantity + 1 : 1) * convertValue;
      const totalAfterAdd = otherUsedStock + newActualQty;

      if (totalAfterAdd > baseStock) {
        alert(`Tổng số lượng vượt quá tồn kho (${baseStock} ${baseUnit})`);
        return prev;
      }
      // === END FIX ===

      if (existed) {
        // F5 bug fix: không cộng thêm +1 khi sản phẩm đã tồn tại
        // Giữ nguyên quantity hiện tại - user muốn thêm phải dùng nút + trong cart
        return prev;
      }

      return [
        ...prev,
        {
          ...product,
          productId: product.id, // Lưu productId gốc để group
          id: itemId,
          quantity: 1,
          price, // Giá theo đơn vị đã chọn
          selectedUnit: unitName,
          convertValue,
          displayUnit,
          baseUnit,
          baseStock, // Stock gốc (base unit)
          maxQty: Math.floor(Math.max(0, baseStock) / convertValue), // Số lượng max theo đơn vị đã chọn
        },
      ];
    });
  }, []);

  /**
   * Thêm sản phẩm vào giỏ với số lượng cụ thể (không cộng dồn)
   * Dùng cho Resume draft - set quantity chính xác từ DB
   */
  const addToCartWithQuantity = useCallback((product, quantity = 1, selectedUnit = null) => {
    setCart((prev) => {
      const itemId = selectedUnit ? `${product.id}-${selectedUnit.name}` : product.id;

      const existed = prev.find((item) => item.id === itemId);

      const unitName = selectedUnit?.name || product.unit || 'Cái';
      const convertValue = selectedUnit?.convertValue || 1;
      const price = selectedUnit?.price ?? product.price;
      const baseUnit = product.unit || 'Cái';
      const baseStock = product.baseStock ?? product.availableStock ?? product.stock ?? 0;

      if (existed) {
        // Nếu đã tồn tại, cập nhật quantity về giá trị mới (thay vì cộng dồn)
        const otherUsedStock = calcUsedStock(prev, product.id, itemId);
        const remainingStock = Math.max(0, baseStock - otherUsedStock);
        const maxQty = Math.floor(remainingStock / convertValue);
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.min(maxQty, quantity) } : item
        );
      }

      // Tạo mới với quantity được chỉ định
      let displayUnit;
      if (convertValue === 1) displayUnit = unitName;
      else if (convertValue >= 1) displayUnit = `${unitName} (×${convertValue})`;
      else displayUnit = `${unitName} (1/${Math.round(1 / convertValue)} ${baseUnit})`;

      return [
        ...prev,
        {
          ...product,
          productId: product.id,
          id: itemId,
          quantity: quantity,
          price,
          selectedUnit: unitName,
          convertValue,
          displayUnit,
          baseUnit,
          baseStock,
          maxQty: Math.floor(Math.max(0, baseStock) / convertValue),
        },
      ];
    });
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart((prev) => {
      const item = prev.find((it) => it.id === id);
      if (!item) return prev;

      const productId = getProductId(item);
      const baseStock = item.baseStock ?? item.stock ?? 0;
      const convertValue = item.convertValue || 1;

      // === FIX: Kiểm tra stock overdraw cho cùng productId ===
      // Tính base units đã sử dụng bởi các items khác cùng productId (loại trừ item hiện tại)
      const otherUsedStock = calcUsedStock(prev, productId, id);
      const newQty = Math.round(item.quantity + delta);
      const newActualQty = newQty * convertValue;
      const totalAfterChange = otherUsedStock + newActualQty;

      if (totalAfterChange > baseStock) {
        alert(`Tổng số lượng vượt quá tồn kho (${baseStock} ${item.baseUnit || 'Cái'})`);
        return prev;
      }
      // === END FIX ===

      // Tính maxQty = remainingStock / convertValue
      const remainingStock = Math.max(0, baseStock - otherUsedStock);
      const maxQty = Math.floor(remainingStock / convertValue);

      return prev
        .map((it) =>
          it.id === id ? { ...it, quantity: Math.max(1, Math.min(maxQty, newQty)) } : it
        )
        .filter((it) => it.quantity > 0);
    });
  }, []);

  /**
   * Set số lượng trực tiếp (cho input)
   */
  const setItemQuantity = useCallback((id, quantity) => {
    setCart((prev) => {
      const item = prev.find((it) => it.id === id);
      if (!item) return prev;

      const productId = getProductId(item);
      const baseStock = item.baseStock ?? item.stock ?? 0;
      const convertValue = item.convertValue || 1;

      // === FIX: Kiểm tra stock overdraw cho cùng productId ===
      // Tính base units đã sử dụng bởi các items khác cùng productId (loại trừ item hiện tại)
      const otherUsedStock = calcUsedStock(prev, productId, id);
      const newQty = Math.max(1, Math.round(quantity));
      const newActualQty = newQty * convertValue;
      const totalAfterChange = otherUsedStock + newActualQty;

      if (totalAfterChange > baseStock) {
        alert(`Tổng số lượng vượt quá tồn kho (${baseStock} ${item.baseUnit || 'Cái'})`);
        return prev;
      }
      // === END FIX ===

      // Tính maxQty = remainingStock / convertValue
      const remainingStock = Math.max(0, baseStock - otherUsedStock);
      const maxQty = Math.floor(remainingStock / convertValue);

      return prev
        .map((it) =>
          it.id === id ? { ...it, quantity: Math.max(1, Math.min(maxQty, newQty)) } : it
        )
        .filter((it) => it.quantity > 0);
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedVoucher('');
    setVoucher('');
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0; // Voucher removed; tier discount applied separately in PaymentModal
  const total = subtotal;

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
    addToCartWithQuantity,
    changeQty,
    setItemQuantity,
    removeItem,
    clearCart,
    applyVoucher,
    subtotal,
    discount,
    total,
  };
};
