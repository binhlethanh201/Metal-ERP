/**
 * Trang Máy bán hàng chinh - Container ben trong PosLayout.
 * Su dung cac component con: CustomerBar, PaymentModal, SuccessModal, ReceiptModal, CustomerPickerModal.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import PosCartPanel from '../components/cart/PosCartPanel';
import ProductGrid from '../components/product/ProductGrid';
import CustomerBar from '../components/customer/CustomerBar';
import PaymentModal from '../components/cart/PaymentModal';
import SuccessModal from '../components/order/SuccessModal';
import ReceiptModal from '../components/order/ReceiptModal';
import CustomerPickerModal from '../components/customer/CustomerPickerModal';
import QuickAddCustomerModal from '../components/customer/QuickAddCustomerModal';
import { usePosCart } from '../hooks/usePosCart';
import { usePosProducts } from '../hooks/usePosProducts';
import { usePosProductList } from '../hooks/usePosProductList';
import {
  createInvoice,
  addInvoiceItem,
  createPayment,
  finalizeInvoice,
} from '../services/posService';

const PAYMENT_LABELS = { cash: 'Tiền mặt', transfer: 'Chuyển khoản' };
const newPaymentLine = (method = 'cash') => ({ id: Date.now(), method, amount: 0 });

// Map API product sang format POS cart
const mapToPosProduct = (p) => ({
  id: p.productId || p.productCode || p.id || '',
  name: p.productName || p.name || '',
  price: p.retailPrice ?? p.unitPrice ?? p.salePrice ?? p.price ?? 0,
  sku: p.productCode || p.barcode || '',
  stock: p.availableStock ?? p.quantity ?? p.stock ?? 0,
  category: p.categoryName || p.group || p.category || '',
  status: (p.availableStock ?? p.quantity ?? p.stock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng',
  image: p.image || '',
  productId: p.productId || p.id || '',
  barcode: p.barcode || '',
  unit: p.unit || 'Cái',
});

const POSScreen = () => {
  const { search, showNotice, quickAddCust, setDrafts, setFooterInfo } = useOutletContext();
  const location = useLocation();
  const draftData = location.state?.draft;
  const preselectedCustomer = location.state?.selectedCustomer;
  const loadedDraft = useRef(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [payLines, setPayLines] = useState([newPaymentLine('cash')]);
  const [paying, setPaying] = useState(false);
  const [orderCounter, setOrderCounter] = useState(1);
  const [showCustModal, setShowCustModal] = useState(false);
  const [showQuickAddCust, setShowQuickAddCust] = useState(false);
  const [isSplitPay, setIsSplitPay] = useState(false);
  const prevQuickAdd = useRef(quickAddCust);
  const { user } = useAuth();
  const staffName = user?.fullName || user?.name || user?.userName || user?.email || 'Thu ngân';

  const { products: posApiProducts, loading: productsLoading } = usePosProductList();
  const posProducts = useMemo(() => posApiProducts.map(mapToPosProduct), [posApiProducts]);

  const cart = usePosCart([]);
  const { filteredProducts } = usePosProducts(posProducts, 'Tất cả', search);

  const handleAddToCart = useCallback((p) => cart.addToCart(p), [cart]);
  const handleClearCart = useCallback(() => {
    cart.clearCart();
    setSelectedCustomer(null);
  }, [cart]);
  const handleApplyVoucher = useCallback(() => {
    showNotice(cart.applyVoucher() ? 'Đã áp dụng mã giảm giá' : 'Vui lòng nhập mã giảm giá');
  }, [cart, showNotice]);

  // ---- Load draft neu co ----
  useEffect(() => {
    if (draftData && draftData.id !== loadedDraft.current) {
      loadedDraft.current = draftData.id;
      // Nap items vao cart
      draftData.items.forEach((item) => cart.addToCart(item));
      setSelectedCustomer(draftData.customer);
      // Xoa draft khoi danh sach
      setDrafts((prev) => prev.filter((d) => d.id !== draftData.id));
    }
  }, [draftData, cart, setDrafts]);

  // ---- Chon khach hang tu trang Khach hang ----
  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      showNotice('Đã chọn: ' + preselectedCustomer.name);
      // Clear state để không chọn lại nếu người dùng tự đổi
      window.history.replaceState({}, document.title);
    }
  }, [preselectedCustomer, showNotice]);

  // ---- Thêm nhanh khách hàng ----
  useEffect(() => {
    if (quickAddCust > prevQuickAdd.current) {
      prevQuickAdd.current = quickAddCust;
      setShowQuickAddCust(true);
    }
  }, [quickAddCust]);

  // ---- Cap nhat footer ----
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const currentOrderCode = 'POS-' + dateStr + '-' + String(orderCounter).padStart(3, '0');

  useEffect(() => {
    setFooterInfo({
      orderCode: currentOrderCode,
      customer: selectedCustomer ? selectedCustomer.name : 'Khách lẻ',
      points: selectedCustomer
        ? Math.floor(selectedCustomer.totalSpent / 100000) + ' pts'
        : '0 pts',
    });
  }, [currentOrderCode, selectedCustomer, setFooterInfo]);

  // Loading indicator (after all hooks - OK)
  if (productsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#004785]" />
          <p className="text-sm font-semibold text-slate-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // ---- Thanh toán ----
  const totalPaid = payLines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const remaining = Math.max(0, cart.total - totalPaid);
  const isPaymentValid = Math.abs(totalPaid - cart.total) <= 1 && totalPaid > 0;

  const processOrder = async (lines, totalPaidAmount) => {
    setPaying(true);
    try {
      // 1. Tạo hóa đơn — kèm shiftId nếu có ca đang mở
      const activeShift = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
      const invoice = await createInvoice({
        customerId: selectedCustomer?.customerId || selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || null,
        note: '',
        shiftId: activeShift?.id || undefined,
        cashierName: staffName,
        createdBy: staffName,
      });

      // Lưu tên thu ngân cho đơn hàng này
      const invoiceId = invoice.invoiceCode || invoice.invoiceId || invoice.id;
      if (invoiceId) {
        const map = JSON.parse(localStorage.getItem('pos_order_cashiers') || '{}');
        map[invoiceId] = staffName;
        localStorage.setItem('pos_order_cashiers', JSON.stringify(map));
      }

      // 2. Thêm từng sản phẩm vào hóa đơn
      await Promise.all(
        cart.cart.map((item) =>
          addInvoiceItem(invoice.invoiceId, {
            productId: item.productId || item.id,
            quantity: item.quantity,
            unitPrice: item.price,
          })
        )
      );

      // 3. Tạo thanh toán
      // Backend C# expect: Cash, Transfer, Card (PascalCase)
      const PAYMENT_LABELS_VN = { cash: 'Tiền mặt', transfer: 'Chuyển khoản' };
      const paymentMethods = { cash: 'Cash', transfer: 'Transfer' };
      const payMethodsVN = [];
      for (const line of lines) {
        const method = paymentMethods[line.method] || 'Cash';
        const vnMethod = PAYMENT_LABELS_VN[line.method] || method;
        console.log('[POS] Creating payment:', {
          invoiceId: invoice.invoiceId,
          method,
          vnMethod,
          amount: line.amount,
        });
        payMethodsVN.push({ method: vnMethod, amount: line.amount });
        const pmBody = { method, amount: line.amount };
        try {
          await createPayment(invoice.invoiceId, pmBody);
        } catch (pmErr) {
          console.warn('[POS] createPayment error:', pmErr.data || pmErr.message);
          // Thử các format khác nhau
          const attempts = [
            { paymentMethod: method, amount: line.amount },
            { method: method.toLowerCase(), amount: line.amount },
            { Method: method, Amount: line.amount },
          ];
          let lastErr = pmErr;
          for (const attempt of attempts) {
            try {
              console.log('[POS] Retry payment with:', attempt);
              await createPayment(invoice.invoiceId, attempt);
              lastErr = null;
              break;
            } catch (e) {
              lastErr = e;
              console.warn('[POS] Retry failed:', e.data || e.message);
            }
          }
          if (lastErr) {
            // Vẫn lưu thông tin thanh toán để hiển thị trong order history
            console.warn('[POS] All payment attempts failed, saving to localStorage only');
          }
        }
      }

      // Lưu phương thức thanh toán vào localStorage (tiếng Việt kèm số tiền)
      if (invoiceId) {
        console.log('[POS] Saving payment to localStorage:', invoiceId, payMethodsVN);
        const savedPM = JSON.parse(localStorage.getItem('pos_order_payments') || '{}');
        savedPM[invoiceId] = JSON.stringify(payMethodsVN);
        localStorage.setItem('pos_order_payments', JSON.stringify(savedPM));
      }

      // 4. Finalize hóa đơn (chuyển sang Completed, trừ kho)
      try {
        await finalizeInvoice(invoice.invoiceId);
      } catch (finalErr) {
        console.warn('[POS] finalizeInvoice error:', finalErr);
      }

      // Cập nhật realtime cho ca đang mở (cộng dồn vào sessionStorage)
      try {
        const shiftData = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
        if (shiftData) {
          shiftData.orderCount = (shiftData.orderCount || 0) + 1;
          shiftData.totalSales = (shiftData.totalSales || 0) + cart.total;
          shiftData.totalRevenue = shiftData.totalSales;
          sessionStorage.setItem('pos_active_shift', JSON.stringify(shiftData));
        }
      } catch (_) {}

      // Hiển thị thành công
      const order = {
        id: invoice.invoiceCode || invoice.invoiceId,
        date: new Date().toISOString(),
        items: [...cart.cart],
        subtotal: cart.subtotal,
        discount: cart.discount,
        vat: cart.vat,
        total: cart.total,
        payLines: lines.map((l) => ({ method: PAYMENT_LABELS[l.method], amount: l.amount })),
        totalPaid: totalPaidAmount,
        change: Math.max(0, totalPaidAmount - cart.total),
        customer: selectedCustomer ? selectedCustomer.name : 'Khách lẻ',
      };
      setLastOrder(order);
      setOrderCounter((c) => c + 1);
      setShowPayModal(false);
      setShowSuccess(true);
      cart.clearCart();
      setSelectedCustomer(null);
      showNotice('Tạo đơn hàng thành công!');
    } catch (err) {
      console.error('Lỗi tạo đơn:', err);
      showNotice('Lỗi: ' + (err.message || 'Không thể tạo đơn hàng'));
      // Fallback: vẫn hiển thị mock nếu API lỗi
      const order = {
        id:
          'POS-' +
          new Date().toISOString().slice(0, 10).replace(/-/g, '') +
          '-' +
          String(orderCounter).padStart(3, '0'),
        date: new Date().toISOString(),
        items: [...cart.cart],
        subtotal: cart.subtotal,
        discount: cart.discount,
        vat: cart.vat,
        total: cart.total,
        payLines: lines.map((l) => ({ method: PAYMENT_LABELS[l.method], amount: l.amount })),
        totalPaid: totalPaidAmount,
        change: Math.max(0, totalPaidAmount - cart.total),
        customer: selectedCustomer ? selectedCustomer.name : 'Khách lẻ',
      };
      setLastOrder(order);
      setOrderCounter((c) => c + 1);
      setShowPayModal(false);
      setShowSuccess(true);
      cart.clearCart();
      setSelectedCustomer(null);
    } finally {
      setPaying(false);
    }
  };

  const handleOpenPay = () => {
    if (cart.cart.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    if (isSplitPay) {
      const m = cart.paymentMethod === 'Tiền mặt' ? 'cash' : 'transfer';
      setPayLines([{ ...newPaymentLine(m), amount: 0 }]);
      setShowPayModal(true);
    } else {
      const m = cart.paymentMethod === 'Tiền mặt' ? 'cash' : 'transfer';
      processOrder([{ method: m, amount: cart.total }], cart.total);
    }
  };

  const handleProcessPayment = () => {
    if (!isPaymentValid) return;
    processOrder(
      payLines.filter((l) => l.amount > 0),
      totalPaid
    );
  };

  // ---- Pay lines ----
  const handleAddPayLine = () =>
    setPayLines((prev) => (prev.length >= 2 ? prev : [...prev, newPaymentLine('transfer')]));
  const handleRemovePayLine = (id) =>
    setPayLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const handlePayLineChange = (id, field, value) => {
    setPayLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === 'method') return { ...l, method: value, amount: 0 };
        // Không cho nhập vượt quá số tiền còn thiếu + dòng hiện tại
        const otherTotal = prev
          .filter((o) => o.id !== id)
          .reduce((s, o) => s + (Number(o.amount) || 0), 0);
        const maxAllowed = Math.max(0, cart.total - otherTotal);
        const newAmount = Math.min(Number(value) || 0, maxAllowed);
        return { ...l, amount: newAmount };
      })
    );
  };
  const handleQuickFill = (id) =>
    setPayLines((prev) => prev.map((l) => (l.id === id ? { ...l, amount: remaining } : l)));

  const handleQuickAddCustomer = (newCust) => {
    setSelectedCustomer(newCust);
    showNotice('Đã thêm khách: ' + newCust.name);
  };

  // ---- Receipt ----
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setLastOrder(null);
  };

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <CustomerBar
          selectedCustomer={selectedCustomer}
          onOpenPicker={() => setShowCustModal(true)}
          onClearCustomer={() => setSelectedCustomer(null)}
        />
        <div className="custom-scrollbar flex-1 overflow-y-auto pb-4">
          <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
        </div>
      </div>

      <PosCartPanel
        cart={cart.cart}
        voucher={cart.voucher}
        onVoucherChange={cart.setVoucher}
        onApplyVoucher={handleApplyVoucher}
        subtotal={cart.subtotal}
        discount={cart.discount}
        vat={cart.vat}
        total={cart.total}
        onClearCart={handleClearCart}
        onPay={handleOpenPay}
        onSaveDraft={() => {
          if (cart.cart.length === 0) {
            showNotice('Giỏ hàng trống, không có gì để lưu');
            return;
          }
          const draft = {
            id: 'draft-' + Date.now(),
            items: [...cart.cart],
            customer: selectedCustomer,
            subtotal: cart.subtotal,
            discount: cart.discount,
            vat: cart.vat,
            total: cart.total,
            createdAt: new Date().toISOString(),
          };
          setDrafts((prev) => [draft, ...prev]);
          cart.clearCart();
          setSelectedCustomer(null);
          showNotice('Đã lưu đơn nháp. Vào Đơn hàng để tiếp tục.');
        }}
        onQtyChange={cart.changeQty}
        onRemoveItem={cart.removeItem}
        selectedCustomer={selectedCustomer}
        onOpenCustomerPicker={() => setShowCustModal(true)}
        payMethod={cart.paymentMethod}
        onPayMethodChange={cart.setPaymentMethod}
        isSplitPay={isSplitPay}
        onToggleSplitPay={setIsSplitPay}
      />

      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        cart={cart}
        selectedCustomer={selectedCustomer}
        payLines={payLines}
        totalPaid={totalPaid}
        remaining={remaining}
        isPaymentValid={isPaymentValid}
        paying={paying}
        onProcessPayment={handleProcessPayment}
        onAddLine={handleAddPayLine}
        onRemoveLine={handleRemovePayLine}
        onLineChange={handlePayLineChange}
        onQuickFill={handleQuickFill}
        onSelectMethod={(method) => showNotice('Đã chọn: ' + method)}
        onOpenQR={() => showNotice('Tính năng đang phát triển')}
        onOpenDebt={() => showNotice('Tính năng đang phát triển')}
      />

      <SuccessModal
        isOpen={showSuccess}
        lastOrder={lastOrder}
        onViewReceipt={() => {
          setShowSuccess(false);
          setShowReceipt(true);
        }}
        onContinue={() => {
          setShowSuccess(false);
          showNotice('Đã tạo đơn hàng thành công!');
        }}
      />

      <ReceiptModal isOpen={showReceipt} onClose={handleCloseReceipt} lastOrder={lastOrder} />

      <CustomerPickerModal
        isOpen={showCustModal}
        onClose={() => setShowCustModal(false)}
        selectedCustomer={selectedCustomer}
        onSelect={setSelectedCustomer}
      />

      <QuickAddCustomerModal
        isOpen={showQuickAddCust}
        onClose={() => setShowQuickAddCust(false)}
        onAdd={handleQuickAddCustomer}
      />
    </>
  );
};

export default POSScreen;
