/**
 * Trang Máy bán hàng chính - Container bên trong PosLayout.
 * Chỉ kết nối API thực tế cho: GET danh sách sản phẩm.
 * Các tính năng còn lại (giỏ hàng, thanh toán, treo đơn, khách hàng) chạy local state.
 * TODO (FE): gán API cho từng nghiệp vụ khi BE sẵn sàng.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

import PosCartPanel from '../components/cart/PosCartPanel';
import ProductGrid from '../components/product/ProductGrid';
import CustomerBar from '../components/customer/CustomerBar';
import PaymentModal from '../components/cart/PaymentModal';
import SuccessModal from '../components/order/SuccessModal';
import ReceiptModal from '../components/order/ReceiptModal';
import CustomerPickerModal from '../components/customer/CustomerPickerModal';
import QuickAddCustomerModal from '../components/customer/QuickAddCustomerModal';
import CheckPriceTool from '../components/product/CheckPriceTool';
import CheckStockTool from '../components/product/CheckStockTool';
import HoldNoteModal from '../components/hold/HoldNoteModal';
import HeldOrdersDrawer from '../components/hold/HeldOrdersDrawer';
import ScanModal from '../components/cart/ScanModal';
import PromoModal from '../components/cart/PromoModal';
import QRModal from '../components/cart/QRModal';
import DebtModal from '../components/cart/DebtModal';

import { getPosProducts } from '../services/posService';
import { mockCustomers } from '../data/posMockData';

const PAYMENT_LABELS = { cash: 'Tiền mặt', card: 'Thẻ', transfer: 'Chuyển khoản' };
const newPaymentLine = (method = 'cash') => ({ id: Date.now(), method, amount: 0 });

const mapToPosProduct = (p) => ({
  id: p.productId || p.id || '',
  name: p.productName || p.name || '',
  price: p.retailPrice ?? p.salePrice ?? p.price ?? 0,
  sku: p.productCode || p.barcode || p.id || '',
  stock: p.availableStock ?? p.stock ?? 0,
  category: p.categoryName || p.group || p.category || '',
  status: (p.availableStock ?? p.stock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng',
  image: p.imageUrl || p.image || '',
  productId: p.productId || p.id,
  productName: p.productName || p.name,
  productCode: p.productCode || p.sku,
  barcode: p.barcode || '',
});

const POSScreen = () => {
  const { search, setSearch, showNotice, quickAddCust, setFooterInfo } = useOutletContext();

  // ── Products (kết nối API thực tế) ─────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    const load = async () => {
      setProductsLoading(true);
      setProductsError('');
      try {
        const res = await getPosProducts({ search: search || undefined });
        const items = res?.items || res?.data?.items || res || [];
        setProducts(items.map(mapToPosProduct));
      } catch {
        setProductsError('Không thể tải danh sách sản phẩm.');
      } finally {
        setProductsLoading(false);
      }
    };
    load();
  }, [search]);

  // ── Cart (local state) ──────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const key = product.productId || product.id;
      const existed = prev.find((item) => (item.productId || item.id) === key);
      if (existed) {
        return prev.map((item) =>
          (item.productId || item.id) === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          (item.productId || item.id) === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => (item.productId || item.id) !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedVoucher('');
    setPaymentMethod('Tiền mặt');
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const discount = cartItems.length > 0 && appliedVoucher ? 50000 : 0;
  const vat = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + vat;

  const applyVoucher = useCallback(() => {
    if (!appliedVoucher.trim()) return;
    showNotice('Đã áp dụng mã giảm giá');
  }, [appliedVoucher, showNotice]);

  // ── Customer (local state — TODO: kết nối API) ──────────────
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustModal, setShowCustModal] = useState(false);
  const [showQuickAddCust, setShowQuickAddCust] = useState(false);
  const prevQuickAdd = useRef(quickAddCust);

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

  // ── Payment (local state — TODO: kết nối API) ──────────────
  const [showPayModal, setShowPayModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [payLines, setPayLines] = useState([newPaymentLine('cash')]);
  const [paying, setPaying] = useState(false);
  const [orderCounter, setOrderCounter] = useState(1);
  const [isSplitPay, setIsSplitPay] = useState(false);

  const totalPaid = payLines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const remaining = Math.max(0, total - totalPaid);
  const isPaymentValid = Math.abs(totalPaid - total) <= 1 && totalPaid > 0;

  // ── Hold Invoice (local state — TODO: kết nối API) ─────────
  const [showHoldNote, setShowHoldNote] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [heldOrders, setHeldOrders] = useState([]);

  const handleHold = ({ holdNote } = {}) => {
    if (cartItems.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const held = {
      id: 'HOLD-' + dateStr + '-' + String(heldOrders.length + 1).padStart(3, '0'),
      holdNote: holdNote || '',
      customerName: selectedCustomer ? selectedCustomer.name || selectedCustomer.customerName : '',
      cartItems: [...cartItems],
      appliedVoucher,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
    setHeldOrders((prev) => [held, ...prev]);
    setShowHoldNote(false);
    clearCart();
    showNotice('Đã treo hóa đơn. Có thể khôi phục trong phiên làm việc.');
  };

  const handleResume = (invoice) => {
    clearCart();
    if (invoice.cartItems) {
      setCartItems(invoice.cartItems);
      setAppliedVoucher(invoice.appliedVoucher || '');
      setPaymentMethod(invoice.paymentMethod || 'Tiền mặt');
    }
    setSelectedCustomer(invoice.customerName ? { name: invoice.customerName } : null);
    setHeldOrders((prev) => prev.filter((o) => o.id !== invoice.id));
    showNotice(`Đã khôi phục đơn treo #${invoice.id}`);
  };

  // ── Process order (local — TODO: kết nối API finalize) ─────
  const processOrder = async (lines, totalPaidAmount) => {
    setPaying(true);
    try {
      // TODO: gọi API tạo đơn hàng / finalize invoice ở đây
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const order = {
        id: 'POS-' + dateStr + '-' + String(orderCounter).padStart(3, '0'),
        date: new Date().toISOString(),
        items: [...cartItems],
        subtotal,
        discount,
        vat,
        total,
        payLines: lines.map((l) => ({
          method: PAYMENT_LABELS[l.method] || l.method,
          amount: l.amount,
        })),
        totalPaid: totalPaidAmount,
        change: Math.max(0, totalPaidAmount - total),
        customer: selectedCustomer
          ? selectedCustomer.name || selectedCustomer.customerName
          : 'Khách lẻ',
      };
      setLastOrder(order);
      setOrderCounter((c) => c + 1);
      setShowPayModal(false);
      setShowSuccess(true);
      clearCart();
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Payment error:', err);
      showNotice('Lỗi thanh toán. Vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  const handleOpenPay = () => {
    if (cartItems.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    if (isSplitPay) {
      setPayLines([{ ...newPaymentLine('transfer'), amount: 0 }]);
      setShowPayModal(true);
    } else {
      const m =
        paymentMethod === 'Tiền mặt' ? 'cash' : paymentMethod === 'Thẻ' ? 'card' : 'transfer';
      processOrder([{ method: m, amount: total }], total);
    }
  };

  const handleProcessPayment = () => {
    if (!isPaymentValid) return;
    processOrder(
      payLines.filter((l) => l.amount > 0),
      totalPaid
    );
  };

  // Pay lines
  const handleAddPayLine = () => setPayLines((prev) => [...prev, newPaymentLine('transfer')]);
  const handleRemovePayLine = (id) =>
    setPayLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const handlePayLineChange = (id, field, value) => {
    setPayLines((prev) =>
      prev.map((l) =>
        l.id !== id
          ? field === 'method'
            ? { ...l, method: value, amount: 0 }
            : { ...l, amount: Number(value) }
          : l
      )
    );
  };
  const handleQuickFill = (id) =>
    setPayLines((prev) => prev.map((l) => (l.id === id ? { ...l, amount: remaining } : l)));

  // ── Tool Modals ─────────────────────────────────────────────
  const [showPriceTool, setShowPriceTool] = useState(false);
  const [showStockTool, setShowStockTool] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);

  // ── Footer info ─────────────────────────────────────────────
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const currentOrderCode = 'POS-' + dateStr + '-' + String(orderCounter).padStart(3, '0');

  useEffect(() => {
    setFooterInfo({
      orderCode: currentOrderCode,
      customer: selectedCustomer
        ? selectedCustomer.name || selectedCustomer.customerName || 'Khách lẻ'
        : 'Khách lẻ',
      points: selectedCustomer
        ? Math.floor((selectedCustomer.totalSpent || 0) / 100000) + ' pts'
        : '0 pts',
    });
  }, [currentOrderCode, selectedCustomer, setFooterInfo]);

  const handleApplyVoucher = () => {
    if (!appliedVoucher.trim()) {
      showNotice('Vui lòng nhập mã giảm giá');
      return;
    }
    applyVoucher();
  };

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
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            loading={productsLoading}
            error={productsError}
          />
        </div>
      </div>

      <PosCartPanel
        cart={cartItems}
        voucher={appliedVoucher}
        onVoucherChange={setAppliedVoucher}
        onApplyVoucher={handleApplyVoucher}
        subtotal={subtotal}
        discount={discount}
        vat={vat}
        total={total}
        onClearCart={clearCart}
        onPay={handleOpenPay}
        onSaveDraft={() => setShowHoldNote(true)}
        onQtyChange={changeQty}
        onRemoveItem={removeItem}
        selectedCustomer={selectedCustomer}
        onOpenCustomerPicker={() => setShowCustModal(true)}
        payMethod={paymentMethod}
        onPayMethodChange={setPaymentMethod}
        isSplitPay={isSplitPay}
        onToggleSplitPay={setIsSplitPay}
        onOpenHeldOrders={() => setShowHeldOrders(true)}
        onOpenPriceCheck={() => setShowPriceTool(true)}
        onOpenStockCheck={() => setShowStockTool(true)}
      />

      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        cart={{ cart: cartItems, subtotal, discount, vat, total }}
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

      {/* Hold Invoice */}
      <HoldNoteModal
        isOpen={showHoldNote}
        onClose={() => setShowHoldNote(false)}
        onConfirm={handleHold}
      />

      <HeldOrdersDrawer
        isOpen={showHeldOrders}
        onClose={() => setShowHeldOrders(false)}
        onResume={handleResume}
        heldOrders={heldOrders}
      />

      {/* Tool Modals */}
      <CheckPriceTool isOpen={showPriceTool} onClose={() => setShowPriceTool(false)} />
      <CheckStockTool isOpen={showStockTool} onClose={() => setShowStockTool(false)} />

      {/* New Modals */}
      <ScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onItemAdded={(product) => {
          if (product) addToCart(product);
          setShowScanModal(false);
          showNotice('Đã thêm sản phẩm');
        }}
      />

      <PromoModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        currentPromo={appliedVoucher}
        onPromoApplied={(promo) => {
          setAppliedVoucher(promo);
          setShowPromoModal(false);
          showNotice('Đã áp dụng khuyến mãi');
        }}
        onPromoRemoved={() => {
          setAppliedVoucher('');
          showNotice('Đã bỏ khuyến mãi');
        }}
      />

      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={total}
        invoiceCode={currentOrderCode}
      />

      <DebtModal
        isOpen={showDebtModal}
        onClose={() => setShowDebtModal(false)}
        customer={selectedCustomer}
        amount={total}
        onDebtRecorded={() => {
          showNotice('Đã ghi nợ');
          setShowDebtModal(false);
        }}
      />
    </>
  );
};

export default POSScreen;
