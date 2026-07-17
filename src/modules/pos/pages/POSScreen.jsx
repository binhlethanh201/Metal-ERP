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
import UnitSelector from '../components/product/UnitSelector';
import PaymentModal from '../components/cart/PaymentModal';
import QRModal from '../components/cart/QRModal';
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
  confirmTransfer,
} from '../services/posService';

const PAYMENT_LABELS = { cash: 'Tiền mặt', transfer: 'Chuyển khoản' };
const newPaymentLine = (method = 'cash') => ({ id: Date.now(), method, amount: 0 });

// Map API product sang format POS cart (có hỗ trợ UOM)
const mapToPosProduct = (p) => {
  console.log('[DEBUG mapToPosProduct] product data:', {
    productId: p.productId || p.productCode || p.id,
    name: p.productName || p.name,
    retailPrice: p.retailPrice,
    floorPrice: p.floorPrice,
    unitPrice: p.unitPrice,
    salePrice: p.salePrice,
    price: p.price,
    unit: p.unit,
    conversionUnits: p.conversionUnits,
  });
  return {
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
    unit: p.unit || 'Cái', // Base unit
    conversionUnits: p.conversionUnits || [], // Các đơn vị quy đổi
    hasMultipleUnits: (p.conversionUnits || []).length > 0, // Có nhiều đơn vị không
  };
};

const POSScreen = () => {
  const { search, setSearch, showNotice, quickAddCust, setDrafts, setFooterInfo } =
    useOutletContext();
  const location = useLocation();
  const draftData = location.state?.draft;
  const preselectedCustomer = location.state?.selectedCustomer;
  const loadedDraft = useRef(null);

  const CUSTOMER_SESSION_KEY = 'pos_selected_customer';
  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist selected customer to sessionStorage (giữ tên KH khi chuyển trang)
  useEffect(() => {
    if (selectedCustomer) {
      sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(selectedCustomer));
    } else {
      sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    }
  }, [selectedCustomer]);
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

  // QR Payment states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // Lưu tạm invoiceId và paymentId để xử lý đơn treo
  const [pendingInvoice, setPendingInvoice] = useState(null);
  // Lưu các dòng thanh toán đã xử lý để dùng khi confirm QR
  const [pendingPayLines, setPendingPayLines] = useState([]);

  // UOM: Unit selector modal
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [selectedProductForUnit, setSelectedProductForUnit] = useState(null);

  // Discount tiers
  const [discountTiers, setDiscountTiers] = useState([]);

  // Fetch discount tiers on mount
  useEffect(() => {
    const fetchDiscountTiers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5100/api/order-discount-tiers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDiscountTiers(data || []);
        }
      } catch (e) {
        console.error('Failed to fetch discount tiers:', e);
      }
    };
    fetchDiscountTiers();
  }, []);

  const prevQuickAdd = useRef(quickAddCust);
  const { user } = useAuth();
  const staffName = user?.fullName || user?.name || user?.userName || user?.email || 'Thu ngân';

  const {
    products: posApiProducts,
    // eslint-disable-next-line no-unused-vars
    loading: productsLoading,
    refetch: refetchProducts,
  } = usePosProductList(search);
  const posProducts = useMemo(() => posApiProducts.map(mapToPosProduct), [posApiProducts]);

  const cart = usePosCart([]);
  const { filteredProducts } = usePosProducts(posProducts, 'Tất cả', search);

  // Calculate discount info based on subtotal
  const discountInfo = useMemo(() => {
    if (!discountTiers || discountTiers.length === 0 || cart.subtotal <= 0) return null;
    const sortedTiers = [...discountTiers].sort((a, b) => b.minOrderValue - a.minOrderValue);
    const applicableTier = sortedTiers.find((t) => cart.subtotal >= t.minOrderValue && t.isActive);
    if (!applicableTier) return null;
    const discountAmount =
      Math.floor((cart.subtotal * (applicableTier.discountPercent / 100)) / 1000) * 1000;
    return {
      discountPercent: applicableTier.discountPercent,
      discountAmount,
      tierName: `Giảm giá ${applicableTier.discountPercent}%`,
    };
  }, [discountTiers, cart.subtotal]);

  const handleAddToCart = useCallback(
    (p, selectedUnit = null) => {
      cart.addToCart(p, selectedUnit);
    },
    [cart]
  );

  // UOM: Mở modal chọn đơn vị
  const handleOpenUnitSelector = useCallback((product) => {
    setSelectedProductForUnit(product);
    setShowUnitSelector(true);
  }, []);

  // UOM: Xử lý khi chọn đơn vị xong
  const handleUnitSelected = useCallback(
    (product, selectedUnit) => {
      cart.addToCart(product, selectedUnit);
      setShowUnitSelector(false);
      setSelectedProductForUnit(null);
      showNotice(`Đã thêm: ${product.name} (${selectedUnit.name})`);
    },
    [cart, showNotice]
  );
  const handleClearCart = useCallback(() => {
    cart.clearCart();
    setSelectedCustomer(null);
  }, [cart]);
  // const handleApplyVoucher = useCallback(() => {}, []);

  // ---- Load draft neu co ----
  useEffect(() => {
    if (draftData && draftData.id !== loadedDraft.current) {
      loadedDraft.current = draftData.id;
      // Nap items vao cart - dùng addToCartWithQuantity để giữ nguyên quantity từ draft
      draftData.items.forEach((item) => {
        const selectedUnit = item.selectedUnit
          ? { name: item.selectedUnit, convertValue: item.convertValue, price: item.price }
          : null;
        cart.addToCartWithQuantity(item, item.quantity, selectedUnit);
      });
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

  // ---- Thanh toán ----
  const finalTotal = Math.max(0, cart.subtotal - (discountInfo?.discountAmount || 0));
  const totalPaid = payLines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const remaining = Math.max(0, finalTotal - totalPaid);
  const isPaymentValid = Math.abs(totalPaid - finalTotal) <= 1 && totalPaid > 0;

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

      // 2. Thêm từng sản phẩm vào hóa đơn (kèm UOM data)
      console.log(
        '[DEBUG] addInvoiceItem payloads:',
        cart.cart.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          selectedUnit: item.selectedUnit,
          convertValue: item.convertValue,
        }))
      );
      await Promise.all(
        cart.cart.map((item) =>
          addInvoiceItem(invoice.invoiceId, {
            productId: item.productId || item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            selectedUnit: item.selectedUnit,
            convertValue: item.convertValue,
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
        console.warn('[DEBUG finalizeInvoice] chi tiết lỗi:', {
          message: finalErr.message,
          data: finalErr.data,
          response: finalErr.response,
          status: finalErr.status,
          errors: finalErr.errors,
        });
      }

      // Cập nhật realtime cho ca đang mở (cộng dồn vào sessionStorage)
      try {
        const shiftData = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
        if (shiftData) {
          shiftData.orderCount = (shiftData.orderCount || 0) + 1;
          shiftData.totalSales = (shiftData.totalSales || 0) + finalTotal;
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
        discount: discountInfo?.discountAmount || 0,

        total: finalTotal,
        payLines: lines.map((l) => ({
          method: PAYMENT_LABELS[l.method.toLowerCase()] || l.method,
          amount: l.amount,
        })),
        totalPaid: totalPaidAmount,
        change: Math.max(0, totalPaidAmount - finalTotal),
        customer: selectedCustomer ? selectedCustomer.name : 'Khách lẻ',
      };
      setLastOrder(order);
      setOrderCounter((c) => c + 1);
      setShowPayModal(false);
      setShowSuccess(true);
      cart.clearCart();
      setSelectedCustomer(null);
      showNotice('Tạo đơn hàng thành công!');
      refetchProducts();
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
        discount: discountInfo?.discountAmount || 0,

        total: finalTotal,
        payLines: lines.map((l) => ({
          method: PAYMENT_LABELS[l.method.toLowerCase()] || l.method,
          amount: l.amount,
        })),
        totalPaid: totalPaidAmount,
        change: Math.max(0, totalPaidAmount - finalTotal),
        customer: selectedCustomer ? selectedCustomer.name : 'Khách lẻ',
      };
      setLastOrder(order);
      setOrderCounter((c) => c + 1);
      setShowPayModal(false);
      setShowSuccess(true);
      cart.clearCart();
      setSelectedCustomer(null);
      refetchProducts();
    } finally {
      setPaying(false);
    }
  };

  const handleOpenPay = async () => {
    if (cart.cart.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }

    // Nếu là Chuyển khoản → Hiển QR luôn (không cần modal)
    if (cart.paymentMethod === 'Chuyển khoản' || cart.paymentMethod === 'Transfer') {
      setPaying(true);
      try {
        const activeShift = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
        const invoice = await createInvoice({
          customerId: selectedCustomer?.customerId || selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || null,
          note: '',
          shiftId: activeShift?.id || undefined,
          cashierName: staffName,
          createdBy: staffName,
        });
        // Thêm sản phẩm (kèm UOM data)
        console.log(
          '[DEBUG handleOpenPay - Transfer] cart items:',
          JSON.stringify(
            cart.cart.map((item) => ({
              productId: item.productId || item.id,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              selectedUnit: item.selectedUnit,
              convertValue: item.convertValue,
              price: item.price,
              retailPrice: item.retailPrice,
              floorPrice: item.floorPrice,
              salePrice: item.salePrice,
              unit: item.unit,
            })),
            null,
            2
          )
        );
        console.log('[DEBUG handleOpenPay - Transfer] invoiceId:', invoice.invoiceId);
        await Promise.all(
          cart.cart.map((item) => {
            console.log('[DEBUG handleOpenPay] gửi item:', {
              productId: item.productId || item.id,
              quantity: item.quantity,
              unitPrice: item.price,
              selectedUnit: item.selectedUnit,
              convertValue: item.convertValue,
            });
            return addInvoiceItem(invoice.invoiceId, {
              productId: item.productId || item.id,
              quantity: item.quantity,
              unitPrice: item.price,
              selectedUnit: item.selectedUnit,
              convertValue: item.convertValue,
            });
          })
        );
        // Lưu tên thu ngân
        const invoiceId = invoice.invoiceId;
        if (invoiceId) {
          const map = JSON.parse(localStorage.getItem('pos_order_cashiers') || '{}');
          map[invoiceId] = staffName;
          localStorage.setItem('pos_order_cashiers', JSON.stringify(map));
        }
        // Tạo payment Transfer và hiển QR
        await handleOpenQRPayment(invoiceId, finalTotal, invoice.invoiceCode);
      } catch (err) {
        console.error('[POS] Quick Transfer error:', err);
        showNotice('Lỗi: ' + (err.message || 'Không thể tạo thanh toán'));
        setPaying(false);
      }
      return;
    }

    // Nếu là Kết hợp → Mở modal với 2 dòng
    if (cart.paymentMethod === 'Kết hợp' || cart.paymentMethod === 'Combined') {
      setPayLines([
        { id: Date.now(), method: 'Cash', amount: 0 },
        { id: Date.now() + 1, method: 'Transfer', amount: 0 },
      ]);
      setShowPayModal(true);
      return;
    }

    // Tiền mặt hoặc mặc định
    if (isSplitPay || cart.paymentMethod === 'Kết hợp') {
      // Mở modal với 2 dòng Tiền mặt + Chuyển khoản
      setPayLines([
        { id: Date.now(), method: 'Cash', amount: 0 },
        { id: Date.now() + 1, method: 'Transfer', amount: 0 },
      ]);
      setShowPayModal(true);
    } else {
      processOrder([{ method: 'Cash', amount: finalTotal }], finalTotal);
    }
  };

  const handleProcessPayment = async () => {
    if (!isPaymentValid) return;
    const lines = payLines.filter((l) => l.amount > 0);
    const hasTransfer = lines.some((l) => l.method === 'Transfer');
    const hasCash = lines.some((l) => l.method === 'Cash');
    const isCombined = hasTransfer && hasCash;

    if (isCombined) {
      // Combined: Tiền mặt + Chuyển khoản
      setPaying(true);
      try {
        const activeShift = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
        const invoice = await createInvoice({
          customerId: selectedCustomer?.customerId || selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || null,
          note: '',
          shiftId: activeShift?.id || undefined,
          cashierName: staffName,
          createdBy: staffName,
        });
        // Lưu tên thu ngân
        const invoiceId = invoice.invoiceId;
        if (invoiceId) {
          const map = JSON.parse(localStorage.getItem('pos_order_cashiers') || '{}');
          map[invoiceId] = staffName;
          localStorage.setItem('pos_order_cashiers', JSON.stringify(map));
        }
        // Thêm sản phẩm (kèm UOM data)
        await Promise.all(
          cart.cart.map((item) =>
            addInvoiceItem(invoice.invoiceId, {
              productId: item.productId || item.id,
              quantity: item.quantity,
              unitPrice: item.price,
              selectedUnit: item.selectedUnit,
              convertValue: item.convertValue,
            })
          )
        );
        // Tạo payment Combined duy nhất
        const validLines = lines.filter((l) => l.amount > 0);
        if (validLines.length === 0) throw new Error('Không có số tiền hợp lệ');

        const paymentRes = await createPayment(invoiceId, {
          method: 'Combined',
          amount: finalTotal,
          paymentLines: validLines.map((l) => ({
            method: l.method,
            amount: l.amount,
            cashReceived: l.method === 'Cash' ? l.amount : null,
          })),
        });

        const payments = paymentRes.data || paymentRes;
        const transferPayment = Array.isArray(payments)
          ? payments.find((p) => p.Method === 'Transfer' || p.method === 'Transfer')
          : null;

        if (transferPayment) {
          setPendingPayLines(lines);
          setQrData({
            paymentId: transferPayment.PaymentId || transferPayment.paymentId,
            qrImageBase64: transferPayment.qrImageBase64 || transferPayment.QRImageBase64,
            transactionContent: transferPayment.transactionContent || transferPayment.VietQRString,
            amount: transferPayment.Amount || transferPayment.amount,
            bankAccountNumber: transferPayment.bankAccountNumber || '0975849675',
            bankName: transferPayment.bankName || 'MB Bank',
          });
          setPendingInvoice({
            invoiceId,
            invoiceCode: invoice.invoiceCode || `INV-${invoiceId.toString().slice(0, 8)}`,
          });
          try {
            const pendingOrders = JSON.parse(localStorage.getItem('pos_pending_orders') || '[]');
            pendingOrders.push({
              invoiceId,
              paymentId: transferPayment.PaymentId || transferPayment.paymentId,
              amount: transferPayment.Amount || transferPayment.amount,
              createdAt: new Date().toISOString(),
              customer: selectedCustomer?.name || 'Khách lẻ',
            });
            localStorage.setItem('pos_pending_orders', JSON.stringify(pendingOrders));
          } catch (_) {}
          try {
            const savedPM = JSON.parse(localStorage.getItem('pos_order_payments') || '{}');
            savedPM[invoiceId] = JSON.stringify([
              { method: 'Chuyển khoản', amount: transferPayment.Amount || transferPayment.amount },
            ]);
            localStorage.setItem('pos_order_payments', JSON.stringify(savedPM));
          } catch (_) {}

          setShowPayModal(false);
          setShowQRModal(true);
          setPaying(false);
        } else {
          await finalizeInvoice(invoiceId);
          showNotice('Thanh toán thành công!');
          setShowPayModal(false);
          setPaying(false);
        }
      } catch (err) {
        console.error('[POS] Process Combined error:', err);
        showNotice('Lỗi: ' + (err.message || 'Không thể tạo thanh toán'));
        setPaying(false);
      }
    } else if (hasTransfer) {
      // Chỉ có Transfer (không có Cash)
      setPaying(true);
      try {
        const activeShift = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
        const invoice = await createInvoice({
          customerId: selectedCustomer?.customerId || selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || null,
          note: '',
          shiftId: activeShift?.id || undefined,
          cashierName: staffName,
          createdBy: staffName,
        });
        // Lưu tên thu ngân
        const invoiceId = invoice.invoiceId;
        if (invoiceId) {
          const map = JSON.parse(localStorage.getItem('pos_order_cashiers') || '{}');
          map[invoiceId] = staffName;
          localStorage.setItem('pos_order_cashiers', JSON.stringify(map));
        }
        // Thêm sản phẩm (kèm UOM data)
        await Promise.all(
          cart.cart.map((item) =>
            addInvoiceItem(invoice.invoiceId, {
              productId: item.productId || item.id,
              quantity: item.quantity,
              unitPrice: item.price,
              selectedUnit: item.selectedUnit,
              convertValue: item.convertValue,
            })
          )
        );
        // Tạo payment và hiển QR
        await handleOpenQRPayment(invoice.invoiceId, finalTotal, invoice.invoiceCode);
      } catch (err) {
        console.error('[POS] Process Transfer error:', err);
        showNotice('Lỗi: ' + (err.message || 'Không thể tạo thanh toán'));
        setPaying(false);
      }
    } else {
      // Thanh toán tiền mặt → xử lý bình thường
      processOrder(lines, totalPaid);
    }
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
        const maxAllowed = Math.max(0, finalTotal - otherTotal);
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

  // ---- QR Payment: Xác nhận chuyển khoản ----
  const handleQRConfirm = async (paymentId) => {
    if (!pendingInvoice) {
      showNotice('Không tìm thấy hóa đơn đang chờ');
      return;
    }
    setConfirmLoading(true);
    try {
      // 1. Xác nhận payment đã chuyển khoản
      await confirmTransfer(paymentId);
      // 2. Finalize hóa đơn (trừ kho)
      await finalizeInvoice(pendingInvoice.invoiceId);
      // 3. Cập nhật realtime ca
      try {
        const shiftData = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
        if (shiftData) {
          shiftData.orderCount = (shiftData.orderCount || 0) + 1;
          shiftData.totalSales = (shiftData.totalSales || 0) + finalTotal;
          shiftData.totalRevenue = shiftData.totalSales;
          sessionStorage.setItem('pos_active_shift', JSON.stringify(shiftData));
        }
      } catch (_) {}
      // 4. Hiển thị thành công
      const payLinesResolved =
        pendingPayLines.length > 0
          ? pendingPayLines.map((l) => ({
              method: PAYMENT_LABELS[l.method.toLowerCase()] || l.method,
              amount: l.amount,
            }))
          : [{ method: 'Chuyển khoản', amount: finalTotal }];
      const totalPaidResolved =
        pendingPayLines.length > 0 ? pendingPayLines.reduce((s, l) => s + l.amount, 0) : finalTotal;
      const order = {
        id: pendingInvoice.invoiceCode || pendingInvoice.invoiceId,
        date: new Date().toISOString(),
        items: [...cart.cart],
        subtotal: cart.subtotal,
        discount: discountInfo?.discountAmount || 0,

        total: finalTotal,
        payLines: payLinesResolved,
        totalPaid: totalPaidResolved,
        change: Math.max(0, totalPaidResolved - finalTotal),
        customer: selectedCustomer ? selectedCustomer.name : 'Khách lẻ',
      };
      setLastOrder(order);
      setShowQRModal(false);
      setQrData(null);
      setPendingInvoice(null);
      setPendingPayLines([]);
      // Xóa khỏi localStorage
      try {
        const pendingOrders = JSON.parse(localStorage.getItem('pos_pending_orders') || '[]');
        const filtered = pendingOrders.filter((o) => o.paymentId !== paymentId);
        localStorage.setItem('pos_pending_orders', JSON.stringify(filtered));
      } catch (_) {}
      // Lưu phương thức thanh toán để OrderHistory hiển thị
      try {
        const savedPM = JSON.parse(localStorage.getItem('pos_order_payments') || '{}');
        savedPM[pendingInvoice.invoiceId] = JSON.stringify(payLinesResolved);
        localStorage.setItem('pos_order_payments', JSON.stringify(savedPM));
      } catch (_) {}
      setShowPayModal(false);
      setShowSuccess(true);
      cart.clearCart();
      setSelectedCustomer(null);
      showNotice('Xác nhận thanh toán thành công!');
      refetchProducts();
    } catch (err) {
      console.error('[POS] QR Confirm error:', err);
      console.warn('[DEBUG QR Confirm] chi tiết lỗi:', {
        message: err.message,
        data: err.data,
        response: err.response,
        status: err.status,
        errors: err.errors,
      });
      showNotice('Lỗi xác nhận: ' + (err.message || 'Không thể xác nhận'));
    } finally {
      setConfirmLoading(false);
    }
  };

  // ---- QR Payment: Mở modal QR ----
  const handleOpenQRPayment = async (invoiceId, amount, realInvoiceCode) => {
    try {
      // Tạo payment Transfer
      const paymentRes = await createPayment(invoiceId, {
        method: 'Transfer',
        amount: amount,
      });
      const payment = paymentRes.data || paymentRes;
      // Lưu thông tin QR để hiển thị
      setQrData({
        paymentId: payment.PaymentId || payment.paymentId, // Backend trả PascalCase
        qrImageBase64: payment.qrImageBase64 || payment.QRImageBase64,
        transactionContent: payment.transactionContent || payment.VietQRString,
        amount: amount,
        bankAccountNumber: payment.bankAccountNumber || '0975849675',
        bankName: payment.bankName || 'MB Bank',
      });
      // Lưu tạm invoice để xử lý đơn treo
      setPendingInvoice({
        invoiceId,
        invoiceCode: realInvoiceCode || `INV-${invoiceId.toString().slice(0, 8)}`,
      });
      // Lưu vào localStorage để có thể resume nếu browser đóng
      try {
        const pendingOrders = JSON.parse(localStorage.getItem('pos_pending_orders') || '[]');
        pendingOrders.push({
          invoiceId,
          paymentId: payment.PaymentId || payment.paymentId, // Backend trả PascalCase
          amount,
          createdAt: new Date().toISOString(),
          customer: selectedCustomer?.name || 'Khách lẻ',
        });
        localStorage.setItem('pos_pending_orders', JSON.stringify(pendingOrders));
      } catch (_) {}
      // Lưu phương thức thanh toán vào localStorage để OrderHistory hiển thị
      try {
        const savedPM = JSON.parse(localStorage.getItem('pos_order_payments') || '{}');
        savedPM[invoiceId] = JSON.stringify([{ method: 'Chuyển khoản', amount: amount }]);
        localStorage.setItem('pos_order_payments', JSON.stringify(savedPM));
      } catch (_) {}
      setShowQRModal(true);
      setShowPayModal(false);
      setPaying(false); // Đã hiển thị QR, tắt loading
    } catch (err) {
      console.error('[POS] Create QR payment error:', err);
      showNotice('Lỗi tạo QR: ' + (err.message || 'Không thể tạo mã QR'));
      setPaying(false);
    }
  };

  return (
    <>
      <div className="flex flex-1 gap-2 overflow-hidden p-3">
        {/* Center: Cart panel */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <CustomerBar
            selectedCustomer={selectedCustomer}
            onOpenPicker={() => setShowCustModal(true)}
            onClearCustomer={() => setSelectedCustomer(null)}
          />
          <div className="flex-1 overflow-hidden">
            <PosCartPanel
              cart={cart.cart}
              subtotal={cart.subtotal}
              discountInfo={discountInfo}
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
                  discount: discountInfo?.discountAmount || 0,

                  total: finalTotal,
                  createdAt: new Date().toISOString(),
                };
                setDrafts((prev) => [draft, ...prev]);
                cart.clearCart();
                setSelectedCustomer(null);
                showNotice('Đã lưu đơn nháp. Vào Đơn hàng để tiếp tục.');
              }}
              onQtyChange={cart.changeQty}
              onRemoveItem={cart.removeItem}
              payMethod={cart.paymentMethod}
              onPayMethodChange={cart.setPaymentMethod}
              isSplitPay={isSplitPay}
              onToggleSplitPay={setIsSplitPay}
              embedded
            />
          </div>
        </div>

        {/* Right: Product panel */}
        <div className="flex w-[500px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-3 py-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <svg
                className="mr-2 h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto px-2 py-2">
            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onOpenUnitSelector={handleOpenUnitSelector}
              singleColumn
            />
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        cart={{ ...cart, discountInfo }}
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
      />

      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrData={qrData}
        onConfirm={handleQRConfirm}
        loading={confirmLoading}
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

      {/* UOM: Unit Selector Modal */}
      <UnitSelector
        isOpen={showUnitSelector}
        onClose={() => {
          setShowUnitSelector(false);
          setSelectedProductForUnit(null);
        }}
        product={selectedProductForUnit}
        onSelect={handleUnitSelected}
      />

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
