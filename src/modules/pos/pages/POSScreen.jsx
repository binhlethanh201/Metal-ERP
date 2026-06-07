/**
 * Trang Máy bán hàng chinh - Container ben trong PosLayout.
 * Su dung cac component con: CustomerBar, PaymentModal, SuccessModal, ReceiptModal, CustomerPickerModal.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import PosCartPanel from '../components/cart/PosCartPanel';
import ProductGrid from '../components/product/ProductGrid';
import CustomerBar from '../components/customer/CustomerBar';
import PaymentModal from '../components/cart/PaymentModal';
import SuccessModal from '../components/order/SuccessModal';
import ReceiptModal from '../components/order/ReceiptModal';
import CustomerPickerModal from '../components/customer/CustomerPickerModal';
import QuickAddCustomerModal from '../components/customer/QuickAddCustomerModal';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { usePosCart } from '../hooks/usePosCart';
import { usePosProducts } from '../hooks/usePosProducts';
import { useProductList } from '../../inventory/hooks/useProductList';
import { initialCart, mockCustomers } from '../data/posMockData';

const PAYMENT_LABELS = { cash: 'Tiền mặt', card: 'Thẻ', transfer: 'Chuyển khoản' };
const newPaymentLine = (method = 'cash') => ({ id: Date.now(), method, amount: 0 });

const mapToPosProduct = (p) => ({
  id: p.productCode || p.id || '',
  name: p.name || '',
  price: p.salePrice ?? p.price ?? 0,
  sku: p.productCode || p.barcode || p.id || '',
  stock: p.stock ?? 0,
  category: p.group || p.category || '',
  status: p.status || (p.stock > 0 ? 'Còn hàng' : 'Hết hàng'),
  image: p.image || '',
});

const POSScreen = () => {
  const { search, setSearch, showNotice, quickAddCust, drafts, setDrafts, setFooterInfo } =
    useOutletContext();
  const location = useLocation();
  const draftData = location.state?.draft;
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
  const prevQuickAdd = useRef(0);

  const { products: inventoryProducts } = useProductList();
  const posProducts = useMemo(() => inventoryProducts.map(mapToPosProduct), [inventoryProducts]);

  const cart = usePosCart(initialCart);
  const { filteredProducts } = usePosProducts(posProducts, 'Tất cả', search);

  const handleAddToCart = useCallback((p) => cart.addToCart(p), [cart]);
  const handleClearCart = useCallback(() => {
    cart.clearCart();
    setSelectedCustomer(null);
  }, [cart]);
  const handleApplyVoucher = useCallback(() => {
    showNotice(cart.applyVoucher() ? 'Đã áp dụng mã giảm giá' : 'Vui lòng nhập mã giảm giá');
  }, [cart, showNotice]);

  // ---- Thanh toán ----
  const totalPaid = payLines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const remaining = Math.max(0, cart.total - totalPaid);
  const isPaymentValid = Math.abs(totalPaid - cart.total) <= 1 && totalPaid > 0;

  const processOrder = (lines, totalPaidAmount) => {
    setPaying(true);
    setTimeout(() => {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const order = {
        id: 'POS-' + dateStr + '-' + String(orderCounter).padStart(3, '0'),
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
      setPaying(false);
      setShowPayModal(false);
      setShowSuccess(true);
      cart.clearCart();
      setSelectedCustomer(null);
    }, 600);
  };

  const handleOpenPay = () => {
    if (cart.cart.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    if (isSplitPay) {
      const m =
        cart.paymentMethod === 'Tiền mặt'
          ? 'cash'
          : cart.paymentMethod === 'Thẻ'
            ? 'card'
            : 'transfer';
      setPayLines([{ ...newPaymentLine(m), amount: 0 }]);
      setShowPayModal(true);
    } else {
      const m =
        cart.paymentMethod === 'Tiền mặt'
          ? 'cash'
          : cart.paymentMethod === 'Thẻ'
            ? 'card'
            : 'transfer';
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
  const handleAddPayLine = () => setPayLines((prev) => [...prev, newPaymentLine('transfer')]);
  const handleRemovePayLine = (id) =>
    setPayLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const handlePayLineChange = (id, field, value) => {
    setPayLines((prev) =>
      prev.map((l) =>
        l.id !== id
          ? l
          : field === 'method'
            ? { ...l, method: value, amount: 0 }
            : { ...l, amount: Number(value) }
      )
    );
  };
  const handleQuickFill = (id) =>
    setPayLines((prev) => prev.map((l) => (l.id === id ? { ...l, amount: remaining } : l)));

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
  }, [draftData]);

  // ---- Thêm nhanh khách hàng ----
  useEffect(() => {
    if (quickAddCust > prevQuickAdd.current) {
      prevQuickAdd.current = quickAddCust;
      setShowQuickAddCust(true);
    }
  }, [quickAddCust]);

  const handleQuickAddCustomer = (newCust) => {
    mockCustomers.unshift(newCust);
    setSelectedCustomer(newCust);
    showNotice('Đã thêm khách: ' + newCust.name);
  };

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
