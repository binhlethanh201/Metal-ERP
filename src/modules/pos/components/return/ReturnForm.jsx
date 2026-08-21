/**
 * ReturnForm - Tạo đơn đổi trả
 * Flow: nhập mã hóa đơn → tìm hóa đơn → chọn sản phẩm → chọn loại + lý do → tạo
 */
import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import { apiPosGet } from '../../../../services/apiClient';
import {
  getOrders,
  getReturns,
  createReturn,
  addReturnItem,
  cancelReturn,
  getInvoice,
  getProductCategory,
  getPosProducts,
} from '../../services/posService';
import { quoteExchange, createExchange, payExchangeDiff, confirmExchangeTransfer, cancelExchangePayment } from '../../services/exchangeService';
import DeltaCard from '../exchange/DeltaCard';
import ExchangeCashModal from '../exchange/ExchangeCashModal';
import QRModal from '../cart/QRModal';

const POLICIES_STORAGE_KEY = 'pos_category_return_policies';

// Trả hàng (REFUND) chỉ cho trả bằng TIỀN MẶT — trừ thẳng tiền mặt trong ca bán.
const REFUND_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
];

const ReturnForm = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [invoiceCode, setInvoiceCode] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnType, setReturnType] = useState('REFUND');
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [returnDiscountPercent, setReturnDiscountPercent] = useState(0);

  // === Đổi hàng chênh lệch (SP B + Delta) — dùng khi returnType = EXCHANGE ===
  const [newItems, setNewItems] = useState([]); // SP B: hàng mới xuất cho khách
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // === Thanh toán chênh lệch (delta>0) sau khi tạo phiếu (Pending) ===
  // pendingExchange: { returnOrderId, delta, method } | null
  const [pendingExchange, setPendingExchange] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  // ---- Tìm SP B (debounced) ----
  const debouncedProductSearch = useDebounce(productSearch, 350);
  useEffect(() => {
    if (!debouncedProductSearch.trim()) { setProductResults([]); return; }
    setProductLoading(true);
    getPosProducts({ search: debouncedProductSearch.trim() })
      .then((res) => {
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data?.items || [];
        setProductResults(list);
      })
      .catch(() => setProductResults([]))
      .finally(() => setProductLoading(false));
  }, [debouncedProductSearch]);

  // ---- Helpers SP B ----
  // Tồn khả dụng (đvt cơ bản) của 1 SP B — ưu tiên stockCheck từ quote (backend authoritative),
  // fallback về sellable lúc chọn sản phẩm.
  const getAvailBase = (n) => {
    if (quote?.stockCheck?.length) {
      const sc = quote.stockCheck.find((s) => String(s.branchProductId) === String(n.branchProductId));
      if (sc && sc.availableBase != null) return sc.availableBase;
    }
    return n.sellable ?? 0;
  };
  // Số lượng tối đa theo ĐVT đang chọn = floor(tồn base / conversionRate).
  const getMaxQty = (n) => {
    const cr = n.conversionRate > 0 ? n.conversionRate : 1;
    const max = Math.floor(getAvailBase(n) / cr);
    return max > 0 ? max : 0;
  };
  const clampQty = (n, qty) => {
    let q = Math.max(1, parseInt(qty, 10) || 1);
    const max = getMaxQty(n);
    if (max > 0 && q > max) q = max;
    return q;
  };
  const addNewItem = (p) => {
    const bpId = p.branchProductId || p.id;
    if (!bpId) return;
    setNewItems((prev) => {
      if (prev.some((x) => x.branchProductId === bpId)) return prev;
      // Giá base (theo ĐVT cơ bản "Cái") — để quy đổi khi chọn ĐVT lớn hơn (Thùng = ×12).
      const baseUnitPrice = parseFloat(p.retailPrice ?? p.unitPrice ?? p.sellPrice ?? p.price ?? 0);
      const sellable = parseFloat(p.sellableQuantity ?? p.availableStock ?? 0);
      const conv = (p.conversionUnits && p.conversionUnits[0]) || null;
      // Đơn giá theo ĐVT đang chọn (per selected unit): nếu ĐVT có giá riêng dùng giá đó,
      // không thì = convertValue * baseUnitPrice (vd 1 Thùng = 12 * giá 1 Cái).
      const convPrice = conv
        ? (conv.price ?? (conv.convertValue * baseUnitPrice))
        : baseUnitPrice;
      return [
        ...prev,
        {
          key: bpId,
          branchProductId: bpId,
          productId: p.productId || p.id,
          productName: p.productName || p.name || '',
          productCode: p.productCode || p.barcode || '',
          quantity: 1,
          conversionRate: conv ? conv.convertValue : 1,
          unitPrice: convPrice,
          baseUnitPrice,
          unitName: conv ? conv.unitName : p.unit || 'Cái',
          sellable,
          conversionUnits: p.conversionUnits || [],
        },
      ];
    });
  };
  const updateNewQty = (key, qty) =>
    setNewItems((prev) => prev.map((p) => (p.key === key ? { ...p, quantity: clampQty(p, qty) } : p)));
  const updateNewUnit = (key, unitName, convertValue, price) =>
    setNewItems((prev) => prev.map((p) => {
      if (p.key !== key) return p;
      const updated = { ...p, conversionRate: convertValue, unitName, unitPrice: price ?? p.unitPrice };
      // Đổi ĐVT → re-clamp số lượng theo max mới.
      updated.quantity = clampQty(updated, p.quantity);
      return updated;
    }));
  const removeNewItem = (key) => setNewItems((prev) => prev.filter((p) => p.key !== key));

  // Fetch policies từ backend POS khi mở modal, fallback localStorage
  useEffect(() => {
    if (!isOpen) return;

    // Fetch discount percent
    apiPosGet('/pos/returns/discount-percent')
      .then((res) => {
        const data = res?.data || res;
        if (data && data.returnDiscountPercent != null) {
          setReturnDiscountPercent(data.returnDiscountPercent);
          try { localStorage.setItem('pos_return_discount_percent', data.returnDiscountPercent); } catch {}
        }
      })
      .catch(() => {
        try {
          const v = localStorage.getItem('pos_return_discount_percent');
          const n = v ? parseFloat(v) : 0;
          setReturnDiscountPercent(!isNaN(n) && n > 0 ? n : 0);
        } catch {}
      });

    apiPosGet('/pos/returns/category-policies')
      .then((res) => {
        const data = res?.data || res;
        const policies = Array.isArray(data) ? data : data?.policies || [];
        const policyMap = {};
        policies.forEach((p) => {
          const key = p.categoryId || p.categoryName || '';
          if (key) {
            policyMap[key] = {
              categoryId: p.categoryId || '',
              categoryName: p.categoryName || '',
              returnDays: p.returnDays ?? '',
              exchangeDays: p.exchangeDays ?? '',
            };
          }
        });
        localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policyMap));
      })
      .catch(() => {
        // Fallback to localStorage
      });
  }, [isOpen]);

  const isExchange = returnType === 'EXCHANGE';            // Bảo hành
  const isExchangeDiff = returnType === 'EXCHANGE_DIFF';   // Đổi hàng lệch giá
  const isRefund = returnType === 'REFUND';

  // ---- Quote đổi chênh lệch (debounced) ----
  const exchangeQuotePayload = useMemo(() => {
    if (!isExchangeDiff || !invoice || selectedProducts.length === 0 || newItems.length === 0) return null;
    return {
      invoiceId: invoice.invoiceId || invoice.invoiceCode || invoice.id,
      returnItems: selectedProducts.map((p) => ({
        invoiceItemId: p.invoiceItemId,
        quantity: p.quantity,
        reason: (reason.trim() || 'DEFECTIVE').toUpperCase(),
      })),
      newItems: newItems.map((n) => ({
        branchProductId: n.branchProductId,
        quantity: n.quantity,
        conversionRate: n.conversionRate,
        unitPrice: n.unitPrice,
      })),
    };
  }, [isExchangeDiff, invoice, selectedProducts, newItems, reason]);

  useEffect(() => {
    if (!exchangeQuotePayload) { setQuote(null); return; }
    let cancelled = false;
    setQuoteLoading(true);
    quoteExchange(exchangeQuotePayload)
      .then((res) => { if (!cancelled) setQuote(res?.data || res); })
      .catch(() => { if (!cancelled) setQuote(null); })
      .finally(() => { if (!cancelled) setQuoteLoading(false); });
    return () => { cancelled = true; };
  }, [exchangeQuotePayload]);

  // Kiểm tra sản phẩm có được phép đổi/trả theo policy không
  // Trả về { allowed: boolean, reason: string | null }
  const getReturnStatus = (item, type) => {
    const policy = item._policy;
    const catName = item._categoryName || '';
    const isExchange = type === 'EXCHANGE' || type === 'EXCHANGE_DIFF';
    const actionLabel = isExchange ? 'đổi' : 'trả';

    let result;
    if (!policy) {
      result = catName
        ? { allowed: false, reason: `Nhóm hàng "${catName}" chưa được cấu hình chính sách ${actionLabel}` }
        : { allowed: false, reason: 'Không xác định được nhóm hàng của sản phẩm' };
    } else {
      const days = isExchange
        ? parseInt(policy.exchangeDays, 10)
        : parseInt(policy.returnDays, 10);
      result = days > 0
        ? { allowed: true, reason: null }
        : { allowed: false, reason: `Nhóm hàng "${catName}" không được phép ${actionLabel}` };
    }

    console.log('[DEBUG] getReturnStatus:', {
      product: item.productName || item.productId,
      categoryId: item._categoryId,
      categoryName: item._categoryName,
      hasPolicy: !!item._policy,
      policyVal: item._policy,
      type,
      result,
    });
    return result;
  };
  // Tổng giá trị SP trả theo GIÁ GỐC (chưa qua CK đơn hàng).
  const grossSubtotal = selectedProducts.reduce((sum, p) => sum + p.quantity * (p.sellPrice || 0), 0);
  // Tỉ lệ CK đơn hàng gốc: dùng Subtotal/TotalAmount để đúng cho cả CK % và CK số tiền.
  const invSubTotal = Number(invoice?.subtotal ?? invoice?.subTotalAmount ?? 0);
  const invTotal = Number(invoice?.totalAmount || 0);
  const invoiceDiscountRatio =
    invSubTotal > 0 ? Math.max(0, 1 - invTotal / invSubTotal) : Number(invoice?.discountPercent || 0) / 100;
  // Giá khách THỰC TRẢ cho các SP được trả (sau CK đơn hàng).
  const subtotal = Math.max(0, grossSubtotal * (1 - invoiceDiscountRatio));
  const invoiceDiscountAmount = grossSubtotal - subtotal;
  const discountPortion = subtotal * (returnDiscountPercent / 100);
  const totalRefund = Math.max(0, subtotal - discountPortion);

  const reset = () => {
    setStep(1);
    setInvoiceCode('');
    setInvoice(null);
    setInvoiceLoading(false);
    setInvoiceError('');
    setSelectedProducts([]);
    setReturnType('REFUND');
    setReason('');
    setRefundMethod('CASH');
    setNotes('');
    setSubmitting(false);
    setSubmitError('');
    setNewItems([]);
    setProductSearch('');
    setProductResults([]);
    setPaymentMethod('CASH');
    setQuote(null);
    setPendingExchange(null);
    setQrData(null);
    setPayLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFindInvoice = async () => {
    if (!invoiceCode.trim()) {
      setInvoiceError('Vui lòng nhập mã hóa đơn');
      return;
    }

    // Đọc policies trực tiếp từ localStorage (tránh stale closure)
    const localPolicies = (() => {
      try {
        const raw = localStorage.getItem(POLICIES_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })();
    // Luôn đồng bộ policies từ localStorage (kể cả khi rỗng)

    setInvoiceLoading(true);
    setInvoiceError('');
    try {
      const ordersData = await getOrders({ status: 'Completed,Cancelled', pageSize: 200 });
      const orders = Array.isArray(ordersData)
        ? ordersData
        : (ordersData?.items ?? ordersData?.data ?? []);
      const kw = invoiceCode.trim().toLowerCase();

      const found = orders.find(
        (o) =>
          (o.invoiceCode || '').toLowerCase() === kw ||
          (o.invoiceId || '').toLowerCase() === kw ||
          (o.id || '').toLowerCase() === kw
      );

      if (found) {
        if (found.status === 'Cancelled') {
          setInvoiceError('Đơn đã bị hủy không thể đổi trả');
          setInvoiceLoading(false);
          return;
        }

        // Fetch full invoice detail to get items (getOrders doesn't include items)
        let fullInvoice = found;
        const invId = found.invoiceId || found.invoiceCode || found.id;
        const orderId = found.orderId || found.order_id || '';
        // invoiceCode dùng để match với return.invoiceCode (không dùng invId vì có thể là UUID)
        const invCode = (found.invoiceCode || found.invoiceId || found.id || '').toLowerCase();
        try {
          const detail = await getInvoice(invId);
          if (detail) {
            fullInvoice = { ...found, ...detail };
          }
        } catch (err) {
          console.warn('[ReturnForm] getInvoice failed:', err);
        }

        console.log(
          '[ReturnForm] Found invoice, invId:',
          invId,
          'orderId:',
          orderId,
          'Full invoice keys:',
          Object.keys(fullInvoice)
        );
        let returnedMap = {};
        try {
          const returnsData = await getReturns({});
          console.log('[ReturnForm] getReturns raw:', returnsData);
          const allReturns = Array.isArray(returnsData)
            ? returnsData
            : (returnsData?.items ?? returnsData?.data ?? []);
          console.log('[ReturnForm] All returns count:', allReturns.length);
          if (allReturns.length > 0) {
            console.log('[ReturnForm] First return keys:', Object.keys(allReturns[0]));
            console.log(
              '[ReturnForm] First return sample:',
              JSON.stringify(allReturns[0], null, 2)
            );
          }
          // Chỉ đếm các phiếu ĐÃ ĐƯỢC DUYỆT (Completed = "được chấp nhận") của hóa đơn này.
          // Phiếu Pending (chưa duyệt) và Cancelled (đã hủy) KHÔNG trừ vào "Còn lại"
          // → đơn bị hủy sẽ không còn bị tính là "đã đổi trả".
          // CHỈ match bằng invoiceCode để tránh sai sót khi orderId bị trùng lặp
          const relatedReturns = allReturns.filter((r) => {
            const rStatus = String(r.status || '').toUpperCase();
            const rInvoiceCode = r.invoiceCode || '';
            const match =
              rStatus === 'COMPLETED' &&
              (rInvoiceCode.toLowerCase() === invCode ||
                rInvoiceCode.toLowerCase() === invId.toLowerCase());
            if (match)
              console.log('[ReturnForm] Matched return:', r.returnCode, 'items:', r.items?.length);
            return match;
          });
          console.log('[ReturnForm] Related returns:', relatedReturns.length);
          // returnedMap API: key bằng productId (tổng số lượng đã trả theo SP)
          relatedReturns.forEach((ret) => {
            const items = ret.items || ret.returnItems || [];
            items.forEach((item) => {
              const pid = item.productId || item.id;
              const qty = parseFloat(item.quantity || 0);
              returnedMap[pid] = (returnedMap[pid] || 0) + qty;
            });
          });
          console.log('[ReturnForm] Returned map (API, Completed only):', returnedMap);
        } catch (err) {
          console.error('[ReturnForm] getReturns failed:', err);
        }

        // Tính số lượng còn lại có thể đổi trả cho từng dòng.
        // Chỉ dựa trên API (phiếu Completed = đã duyệt) — KHÔNG còn dùng localStorage
        // để tránh lỗi đơn bị hủy / chưa duyệt vẫn bị tính là "đã đổi trả".
        const invoiceItems = fullInvoice.items || fullInvoice.invoiceItems || [];

        // ========== DEBUG: Kiểm tra dữ liệu items từ API ==========
        console.log('=== DEBUG ReturnForm ===');
        console.log('[DEBUG] invoiceItems raw:', invoiceItems.map((it) => ({
          productId: it.productId,
          productName: it.productName || it.name,
          productCode: it.productCode || it.code,
          categoryId: it.categoryId || it.CategoryId || it.product?.categoryId || it.product?.category?.id || it.category?.id,
          categoryName: it.categoryName || it.CategoryName || it.product?.categoryName || it.product?.category?.name || it.category?.name,
          quantity: it.quantity,
        })));
        console.log('[DEBUG] localPolicies keys:', Object.keys(localPolicies));
        console.log('[DEBUG] localPolicies:', JSON.stringify(localPolicies));

        // Xác định category cho từng item & kiểm tra policy — mỗi item độc lập
        const norm = (s) => (s || '').trim().normalize('NFC').toLowerCase();
        const itemsWithCategory = invoiceItems.map((item) => {
            // Ưu tiên categoryId, fallback categoryName
            const catId =
              item.categoryId || item.CategoryId ||
              item.product?.categoryId || item.product?.CategoryId ||
              item.product?.category?.id ||
              item.category?.id || '';
            let catName =
              item.categoryName || item.CategoryName ||
              item.product?.categoryName || item.product?.CategoryName ||
              item.product?.category?.name ||
              item.category?.name || '';
            // Chỉ lấy catId/catName từ API fallback nếu cả hai đều rỗng
            // (getProductCategory trả về { id, name })
            // Không fallback product.group — group quá generic, gây sai policy
            // Tìm policy: ưu tiên categoryId, fallback scan categoryName
            let policy = null;
            if (catId && localPolicies[catId]) {
              // Tra cứu bằng categoryId (chính xác nhất, key = id)
              policy = localPolicies[catId];
            } else if (catName) {
              // Tra cứu bằng categoryName:
              // 1. Direct key match (old format: key = name)
              if (localPolicies[catName]) {
                policy = localPolicies[catName];
              } else {
                // 2. Scan values (new format: key = id, value có categoryName field)
                const normCatName = norm(catName);
                const match = Object.values(localPolicies).find(
                  (p) => p.categoryName && norm(p.categoryName) === normCatName
                );
                if (match) policy = match;
              }
            }
            return { ...item, _categoryId: catId || '', _categoryName: catName || '', _policy: policy || null };
          });

        // Tra cứu category từ kho cho các sản phẩm chưa xác định được nhóm hàng
        // (hóa đơn cũ không lưu thông tin nhóm hàng)
        for (const item of itemsWithCategory) {
          if (!item._categoryId && !item._categoryName) {
            const raw = await getProductCategory(
              item.productId || item.id,
              item.productCode || item.code || item.barcode,
              item.productName
            );
            if (raw) {
              // getProductCategory trả về { id, name } hoặc string (backward compatible)
              if (typeof raw === 'object' && raw !== null) {
                item._categoryId = raw.id || '';
                item._categoryName = raw.name || '';
              } else if (typeof raw === 'string') {
                item._categoryName = raw;
              }
              // Gán policy — mỗi item độc lập, ưu tiên categoryId
              let policy = null;
              if (item._categoryId && localPolicies[item._categoryId]) {
                policy = localPolicies[item._categoryId];
              } else if (item._categoryName) {
                if (localPolicies[item._categoryName]) {
                  policy = localPolicies[item._categoryName];
                } else {
                  const normName = norm(item._categoryName);
                  const match = Object.values(localPolicies).find(
                    (p) => p.categoryName && norm(p.categoryName) === normName
                  );
                  if (match) policy = match;
                }
              }
              item._policy = policy || null;
            }
          }
        }

        // ========== DEBUG: Kiểm tra items sau khi gán category & policy ==========
        console.log('[DEBUG] itemsWithCategory after policy assignment:', itemsWithCategory.map((it) => ({
          name: it.productName || it.productId,
          catId: it._categoryId,
          catName: it._categoryName,
          policy: it._policy ? { categoryId: it._policy.categoryId, categoryName: it._policy.categoryName, returnDays: it._policy.returnDays, exchangeDays: it._policy.exchangeDays } : null,
        })));

        const enrichedItems = itemsWithCategory.map((item) => {
          const lineKey = item.invoiceItemId || item.id || item.productId;
          const originalQty = parseFloat(item.quantity || 0);
          // "Đã đổi trả" = tổng qty của các phiếu đã DUYỆT (Completed) cho SP này.
          // Pending (chưa duyệt) và Cancelled (đã hủy) không tính → đơn hủy không trừ "Còn lại".
          const returnedQty = returnedMap[item.productId] || 0;
          const remainingQty = Math.max(0, originalQty - returnedQty);
          const productName =
            item.productName || (item.product && item.product.productName) || item.name || '';
          return {
            ...item,
            _key: lineKey,
            _remainingQty: remainingQty,
            _returnedQty: returnedQty,
            productName,
            _displayUnit: item.displayUnit || item.selectedUnit || item.unit || '',
            _categoryName: item._categoryName,
            _policy: item._policy,
          };
        });

        // Mỗi item tự đánh giá policy riêng — không dùng biến global, không quyết định theo invoice
        const anyItemRemaining = enrichedItems.some((item) => item._remainingQty > 0);
        if (!anyItemRemaining) {
          setInvoiceError('Tất cả sản phẩm trong hóa đơn này đã được đổi trả hết.');
          setInvoiceLoading(false);
          return;
        }

        setInvoice({ ...fullInvoice, items: enrichedItems });
        setStep(2);
      } else {
        setInvoiceError(
          `Không tìm thấy hóa đơn "${invoiceCode}". Kiểm tra lại mã hoặc trạng thái đơn.`
        );
      }
    } catch (err) {
      setInvoiceError('Lỗi tìm hóa đơn: ' + (err.message || 'Không xác định'));
    } finally {
      setInvoiceLoading(false);
    }
  };

  const toggleProduct = (product) => {
    // Kiểm tra policy trước khi cho chọn
    const status = getReturnStatus(product, returnType);
    if (!status.allowed) return;
    setSelectedProducts((prev) => {
      const idx = prev.findIndex((p) => p._key === product._key);
      if (idx >= 0) {
        return prev.filter((p) => p._key !== product._key);
      }
      const remainingQty = product._remainingQty ?? parseFloat(product.quantity || 0);
      return [
        ...prev,
        {
          _key: product._key,
          productId: product.productId,
          // Pin đúng dòng hóa đơn gốc để backend lấy ConvertValue đúng (xử lý cùng SP nhiều ĐVT).
          invoiceItemId: product.invoiceItemId || product.id || null,
          productName: product.productName || product.name,
          productCode: product.productCode || '',
          quantity: 1,
          sellPrice: product.unitPrice || product.retailPrice || 0,
          maxQty: remainingQty,
          // Hệ số quy đổi của dòng hóa đơn gốc (1 Thùng = 20 Cái -> convertValue = 20).
          convertValue: product.convertValue || product.conversionRate || 1,
        },
      ];
    });
  };

  const updateQty = (key, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p._key === key ? { ...p, quantity: Math.max(1, Math.min(qty, p.maxQty)) } : p
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất một sản phẩm để đổi trả');
      return;
    }

    // === Đổi hàng lệch giá: tạo qua createExchange (1 transaction) ===
    if (isExchangeDiff) {
      if (newItems.length === 0) {
        setSubmitError('Vui lòng chọn ít nhất 1 sản phẩm mới (SP B) để đổi.');
        setSubmitting(false);
        return;
      }
      if (quote && !quote.eligible) {
        setSubmitError(quote.restrictionReason || 'Chưa đủ điều kiện đổi hàng.');
        setSubmitting(false);
        return;
      }
      setSubmitting(true);
      setSubmitError('');
      try {
        const payload = {
          invoiceId: invoice.invoiceId || invoice.invoiceCode || invoice.id,
          paymentMethod,
          note: notes.trim() || undefined,
          returnItems: selectedProducts.map((p) => ({
            invoiceItemId: p.invoiceItemId,
            quantity: p.quantity,
            reason: (reason.trim() || 'DEFECTIVE').toUpperCase(),
          })),
          newItems: newItems.map((n) => ({
            branchProductId: n.branchProductId,
            quantity: n.quantity,
            conversionRate: n.conversionRate,
            unitPrice: n.unitPrice,
          })),
        };
        const res = await createExchange(payload);
        const created = res?.data || res;
        const returnOrderId = created?.returnOrderId;
        const delta = Number(quote?.deltaAmount ?? 0);

        // delta > 0 (lệch giá) → mở popup thanh toán (CASH/TRANSFER) → Completed.
        // delta == 0 (ngang giá) → Pending, chờ xác nhận ở detail (như cũ).
        if (delta > 0 && returnOrderId) {
          setSubmitting(false);
          setPendingExchange({ returnOrderId, delta, method: paymentMethod });
          return;
        }
        onSuccess?.(created);
        handleClose();
      } catch (err) {
        const detail = err?.data?.title || err?.data?.message || err?.message || 'Lỗi';
        setSubmitError('Không thể tạo phiếu đổi hàng: ' + detail);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // === Trả hàng (REFUND) ===
    if (!reason.trim()) {
      setSubmitError('Vui lòng nhập lý do đổi trả');
      return;
    }

    // Kiểm tra policy cho tất cả sản phẩm đã chọn
    const blocked = selectedProducts.filter((sp) => {
      const item = invoice.items?.find((i) => i._key === sp._key);
      if (!item) return true;
      const status = getReturnStatus(item, returnType);
      return !status.allowed;
    });
    if (blocked.length > 0) {
      setSubmitError(
        `Sản phẩm "${blocked[0].productName}" không được phép ${isExchange ? 'đổi' : 'trả'}.`
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    let createdReturnId = null;
    try {
      const invId = invoice.invoiceId || invoice.invoiceCode || invoice.id;
      const payload = {
        invoiceId: invId,
        returnType: returnType,
        reason: reason.trim(),
        ...(returnType === 'REFUND' && { refundMethod: refundMethod }),
      };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }
      payload.items = selectedProducts.map((p) => ({
        productId: p.productId,
        invoiceItemId: p.invoiceItemId || undefined,
        quantity: p.quantity,
        // Quy về ĐVT cơ bản: convertValue từ dòng hóa đơn gốc (vd 1 Thùng = 12 Cái).
        conversionRate: p.convertValue || p.conversionRate || 1,
      }));

      console.log('[ReturnForm] Payload:', payload);
      const retData = await createReturn(payload);
      console.log('[ReturnForm] Response:', retData);
      const returnId =
        retData.returnOrderId || retData.returnId || retData.return?.returnId || retData.id;
      createdReturnId = returnId;

      // Nếu backend không nhận items inline thì gọi thêm API addReturnItem
      if (!retData.returnItems || retData.returnItems.length === 0) {
        await Promise.all(
          selectedProducts.map((p) =>
            addReturnItem(returnId, {
              productId: p.productId,
              invoiceItemId: p.invoiceItemId || undefined,
              quantity: p.quantity,
              conversionRate: p.convertValue || p.conversionRate || 1,
            })
          )
        );
      }

      // Không còn lưu tracking localStorage: "đã đổi trả" giờ lấy từ API
      // (chỉ đếm phiếu Completed) nên đơn hủy sẽ không bị tính nữa.

      onSuccess?.(retData);
      handleClose();
    } catch (err) {
      console.error('[ReturnForm] Full error:', err);
      console.error('[ReturnForm] Error data:', err.data);
      if (createdReturnId) {
        try {
          await cancelReturn(createdReturnId);
          console.info('[ReturnForm] Cancelled incomplete return', createdReturnId);
        } catch (cancelErr) {
          console.warn('[ReturnForm] Failed to cancel incomplete return', createdReturnId, cancelErr);
        }
      }
      const detail = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(', ')
        : err?.data?.title || err?.message || 'Lỗi';
      setSubmitError('Không thể tạo phiếu đổi trả: ' + detail);
    } finally {
      setSubmitting(false);
    }
  };

  // === Xử lý thanh toán chênh lệch (delta>0) sau khi tạo phiếu Pending ===

  // CASH: xác nhận tiền mặt → Completed ngay.
  const handleCashPayConfirm = async (cashReceived) => {
    if (!pendingExchange) return;
    setPayLoading(true);
    try {
      const res = await payExchangeDiff(pendingExchange.returnOrderId, {
        method: 'CASH',
        cashReceived,
      });
      const data = res?.data || res;
      onSuccess?.(data?.returnOrder || data);
      setPendingExchange(null);
      setPayLoading(false);
      handleClose();
    } catch (err) {
      setPayLoading(false);
      setSubmitError('Không thể thanh toán: ' + (err?.data?.title || err?.data?.message || err?.message || 'Lỗi'));
    }
  };

  // CASH: bỏ (cash đồng bộ → huỷ luôn RO, restore reserve).
  const handleCashPayClose = async () => {
    if (!pendingExchange) return;
    try {
      await cancelExchangePayment(pendingExchange.returnOrderId);
    } catch (_) {}
    try {
      await cancelReturn(pendingExchange.returnOrderId);
    } catch (_) {}
    setPendingExchange(null);
    setPayLoading(false);
    handleClose();
  };

  // TRANSFER: tạo QR khi pendingExchange bật.
  useEffect(() => {
    if (!pendingExchange || pendingExchange.method !== 'TRANSFER') return;
    let cancelled = false;
    (async () => {
      setPayLoading(true);
      try {
        const res = await payExchangeDiff(pendingExchange.returnOrderId, { method: 'TRANSFER' });
        if (cancelled) return;
        const data = res?.data || res;
        setQrData({
          paymentId: data.paymentId,
          qrImageBase64: data.qrImageBase64,
          transactionContent: data.transactionContent,
          amount: data.amount ?? pendingExchange.delta,
          bankAccountNumber: data.bankAccountNumber || '0975849675',
          bankName: data.bankName || 'MB Bank',
        });
      } catch (err) {
        if (cancelled) return;
        setSubmitError('Không thể tạo QR: ' + (err?.data?.title || err?.data?.message || err?.message || 'Lỗi'));
      } finally {
        if (!cancelled) setPayLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pendingExchange]);

  // TRANSFER: xác nhận đã nhận tiền → Completed.
  const handleQRConfirm = async (paymentId) => {
    if (!pendingExchange) return;
    setPayLoading(true);
    try {
      const res = await confirmExchangeTransfer(pendingExchange.returnOrderId, { paymentId });
      const data = res?.data || res;
      onSuccess?.(data);
      setQrData(null);
      setPendingExchange(null);
      setPayLoading(false);
      handleClose();
    } catch (err) {
      setPayLoading(false);
      setSubmitError('Xác nhận thất bại: ' + (err?.data?.title || err?.data?.message || err?.message || 'Lỗi'));
    }
  };

  // TRANSFER: đóng QR chưa thanh toán → giữ RO Pending (khách trả async), quay về list.
  const handleQRClose = () => {
    setQrData(null);
    setPendingExchange(null);
    setPayLoading(false);
    handleClose();
  };

  const renderStepIndicator = () => (
    <div className="mb-6 flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 1 ? 'bg-[#004785] text-white' : 'bg-green-500 text-white'}`}
      >
        {step === 1 ? '1' : '✓'}
      </div>
      <div className={`h-0.5 w-12 ${step === 2 ? 'bg-green-500' : 'bg-slate-200'}`} />
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 2 ? 'bg-[#004785] text-white' : 'bg-slate-200 text-slate-500'}`}
      >
        2
      </div>
      <span className="ml-2 text-sm text-slate-500">
        {step === 1 ? 'Tìm hóa đơn gốc' : 'Chọn sản phẩm & lý do'}
      </span>
    </div>
  );

  return (
    <>
    <Modal
      isOpen={isOpen && !pendingExchange}
      onClose={handleClose}
      title="Tạo đơn đổi trả"
      size="2xl"
      footer={
        step === 1 ? (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleFindInvoice}
              loading={invoiceLoading}
              disabled={!invoiceCode.trim()}
            >
              Tìm hóa đơn
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}
              disabled={selectedProducts.length === 0 || (isExchangeDiff && (newItems.length === 0 || (quote && !quote.eligible)))}>
              {isExchangeDiff ? 'Tạo đơn đổi hàng' : isExchange ? 'Tạo đơn bảo hành' : 'Tạo đơn trả hàng'}
            </Button>
          </>
        )
      }
    >
      {renderStepIndicator()}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Mã hóa đơn gốc <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập mã hóa đơn (VD: INV-2026-0072)"
              value={invoiceCode}
              onChange={(e) => {
                setInvoiceCode(e.target.value);
                setInvoiceError('');
              }}
              error={invoiceError}
              onKeyDown={(e) => e.key === 'Enter' && handleFindInvoice()}
            />
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-[#1a1a1a]/50 dark:text-[#999999]">
            Nhập mã hóa đơn đã hoàn thành để tạo yêu cầu đổi/trả hàng. Hệ thống sẽ kiểm tra hóa đơn
            và hiển thị danh sách sản phẩm có thể đổi trả.
          </div>
        </div>
      )}

      {step === 2 && invoice && (
        <div className="space-y-4">
          {/* Invoice info */}
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-[#1a1a1a]/50">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 dark:text-[#808080]">Mã hóa đơn</p>
                <p className="mt-0.5 font-mono text-sm font-semibold">
                  {invoice.invoiceCode || invoice.invoiceId}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 dark:text-[#808080]">Khách hàng</p>
                <p className="mt-0.5 font-semibold">{invoice.customerName || 'Khách lẻ'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 dark:text-[#808080]">Ngày mua</p>
                <p className="mt-0.5 text-sm">
                  {invoice.createdAt ? formatDateTime(invoice.createdAt) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 dark:text-[#808080]">Tổng tiền</p>
                <p className="mt-0.5 font-semibold text-green-600">
                  {formatCurrency(invoice.totalAmount || 0)}
                </p>
                {invoice.discountAmount > 0 && (
                  <p className="mt-1 text-xs text-emerald-600">
                    (Đã giảm {invoice.discountPercent || 0}%: -
                    {formatCurrency(invoice.discountAmount)})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Return type selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Loại yêu cầu <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Trả hàng */}
              <button
                type="button"
                onClick={() => {
                  setReturnType('REFUND');
                  setSelectedProducts([]);
                  setNewItems([]);
                }}
                className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  returnType === 'REFUND'
                    ? 'border-[#004785] bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-[#333333] dark:hover:border-[#404040]'
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  returnType === 'REFUND' ? 'bg-[#004785] text-white' : 'bg-slate-100 text-slate-500 dark:bg-[#272727] dark:text-[#999999]'
                }`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-8 0v1m0 0h8m-8 0a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v3a4 4 0 01-4 4m-8 0a4 4 0 004 4h.5M9 19l-1.5 1.5M9 19l1.5-1.5" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-[#e5e5e5]">Trả hàng</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#999999]">Hoàn tiền cho khách</p>
                </div>
              </button>

              

              {/* Đổi hàng lệch giá */}
              <button
                type="button"
                onClick={() => {
                  setReturnType('EXCHANGE_DIFF');
                  setSelectedProducts([]);
                  setNewItems([]);
                }}
                className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  returnType === 'EXCHANGE_DIFF'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-[#333333] dark:hover:border-[#404040]'
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  returnType === 'EXCHANGE_DIFF' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-[#272727] dark:text-[#999999]'
                }`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-[#e5e5e5]">Đổi hàng lệch giá</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#999999]">Đổi SP khác, thu/chi chênh lệch</p>
                </div>
              </button>
            </div>
          </div>

          {/* Product selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sản phẩm đổi trả <span className="text-red-500">*</span>
            </label>
            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 dark:divide-[#333333] dark:border-[#333333]">
              {(invoice.items || []).map((item) => {
                const itemKey = item._key || item.invoiceItemId || item.productId;
                const selected = selectedProducts.find((p) => p._key === itemKey);
                const remainingQty = item._remainingQty ?? parseFloat(item.quantity || 0);
                const returnedQty = item._returnedQty || 0;
                const status = getReturnStatus(item, returnType);
                const notAllowed = !status.allowed;

                // ========== DEBUG: Kiểm tra trạng thái từng item ==========
                console.log('[DEBUG] Item render:', {
                  name: item.productName || item.productId,
                  categoryId: item._categoryId,
                  categoryName: item._categoryName,
                  hasPolicy: !!item._policy,
                  policyKeys: item._policy ? Object.keys(item._policy) : null,
                  policyDays: item._policy ? { returnDays: item._policy.returnDays, exchangeDays: item._policy.exchangeDays } : null,
                  allowed: status.allowed,
                  reason: status.reason,
                });

                // Ẩn sản phẩm đã đổi trả hết
                if (remainingQty <= 0 && !selected) return null;

                return (
                  <div
                    key={itemKey}
                    className={`flex items-center gap-2 px-3 py-2 transition-colors ${selected ? 'bg-blue-50' : notAllowed ? 'bg-slate-100 opacity-50 cursor-not-allowed select-none dark:bg-[#1a1a1a]' : 'hover:bg-slate-50 dark:hover:bg-[#272727]'}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected}
                      disabled={notAllowed}
                      onChange={() =>
                        toggleProduct({ ...item, quantity: remainingQty, _key: itemKey })
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#004785] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-900">{item.productName || item.productId}</p>
                      <p className="truncate text-[10px] text-slate-400">
                        {item.productCode || '-'}
                        {isExchange ? '' : ` · Đơn giá: ${formatCurrency(item.unitPrice || 0)}`} ·
                        Đã mua: {item.quantity}
                        {selected ? ` · Đổi: ${selected.quantity}` : ''}
                        {item._displayUnit ? ` (${item._displayUnit})` : ''}
                      </p>
                      {isExchange && returnedQty > 0 && (
                        <p className="truncate text-[10px] text-amber-500">
                          Đã bảo hành: {returnedQty} · Còn lại:{' '}
                          <span className="font-semibold">{remainingQty}</span>
                        </p>
                      )}
                      {notAllowed && status.reason && (
                        <p className="truncate text-[11px] font-semibold text-red-600">
                          ❌ {status.reason}
                        </p>
                      )}
                    </div>
                    {selected && remainingQty > 0 && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={notAllowed}
                          onClick={() => updateQty(itemKey, (selected.quantity || 1) - 1)}
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${notAllowed ? 'border-slate-200 text-slate-300 dark:border-[#333333]' : 'border-slate-200 hover:bg-slate-100 dark:border-[#333333] dark:hover:bg-[#272727]'}`}
                        >
                          -
                        </button>
                        <span className="min-w-[32px] text-center text-sm font-black text-[#004785] leading-tight">
                          {selected.quantity}/{remainingQty}
                        </span>
                        <button
                          type="button"
                          disabled={notAllowed}
                          onClick={() => updateQty(itemKey, (selected.quantity || 1) + 1)}
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${notAllowed ? 'border-slate-200 text-slate-300 dark:border-[#333333]' : 'border-slate-200 hover:bg-slate-100 dark:border-[#333333] dark:hover:bg-[#272727]'}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                    {remainingQty <= 0 && (
                      <span className="text-xs font-medium text-red-500">Đã đổi trả hết</span>
                    )}
                  </div>
                );
              })}
              {(!invoice.items || invoice.items.length === 0) && (
                <p className="p-4 text-center text-sm text-slate-400 dark:text-[#808080]">Hóa đơn không có sản phẩm</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Lý do đổi trả <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="VD: Sản phẩm bị lỗi kỹ thuật, khách không hài lòng, sai quy cách..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>

          {/* Refund method + amount — chỉ hiển thị khi trả hàng */}
          {isRefund && (
            <div className="space-y-3">
              {/* Phân tích tiền hoàn */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-[#333333] dark:bg-[#1a1a1a]/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-[#999999]">Tổng giá trị SP trả</span>
                  <span className="font-semibold text-slate-700 dark:text-[#e5e5e5]">
                    {formatCurrency(grossSubtotal)}
                  </span>
                </div>
                {invoiceDiscountAmount > 0 && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sky-600 dark:text-sky-400">
                      Chiết khấu đơn hàng
                      {invoice?.discountPercent ? ` (${invoice.discountPercent}%)` : ''}
                    </span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      -{formatCurrency(invoiceDiscountAmount)}
                    </span>
                  </div>
                )}
                {returnDiscountPercent > 0 && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-amber-600 dark:text-amber-400">
                      Tiền phạt trả hàng ({returnDiscountPercent}%)
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      -{formatCurrency(discountPortion)}
                    </span>
                  </div>
                )}
                <div className="mt-1.5 flex items-center justify-between border-t border-slate-200 pt-1.5 dark:border-[#333333]">
                  <span className="font-semibold text-slate-600 dark:text-[#cccccc]">Tiền hoàn</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(totalRefund)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                    Phương thức hoàn tiền
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                  >
                    {REFUND_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                    Số tiền hoàn dự kiến
                  </label>
                  <div className="flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-700 dark:bg-green-900/30">
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(totalRefund)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SP B: hàng mới + Delta (khi Đổi hàng lệch giá) ===== */}
          {isExchangeDiff && (
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-800 dark:bg-blue-900/10">
              <p className="text-sm font-bold text-slate-700 dark:text-[#e5e5e5]">
                Hàng mới (SP B) — xuất cho khách
              </p>

              <Input
                placeholder="Tìm SP mới theo tên / mã..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productLoading && <p className="text-xs text-slate-400">Đang tìm...</p>}
              {!productLoading && productSearch.trim() && productResults.length > 0 && (
                <div className="max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 dark:divide-[#333333] dark:border-[#333333]">
                  {productResults.slice(0, 20).map((p) => {
                    const bpId = p.branchProductId || p.id;
                    const added = newItems.some((x) => x.branchProductId === bpId);
                    return (
                      <button
                        key={bpId}
                        type="button"
                        disabled={added}
                        onClick={() => addNewItem(p)}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-[#272727]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 dark:text-[#e5e5e5]">{p.productName || p.name}</p>
                          <p className="truncate text-[10px] text-slate-400">
                            {p.productCode || p.barcode || '-'} · {formatCurrency(p.retailPrice ?? p.unitPrice ?? 0)} · còn {p.sellableQuantity ?? p.availableStock ?? 0}
                          </p>
                        </div>
                        <span className="ml-2 shrink-0 font-semibold text-[#004785]">{added ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {newItems.length > 0 && (
                <div className="space-y-2">
                  {newItems.map((n) => {
                    const maxQ = getMaxQty(n);
                    const atMax = maxQ > 0 && n.quantity >= maxQ;
                    return (
                    <div key={n.key} className="rounded-lg border border-slate-200 p-2 dark:border-[#333333]">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-900 dark:text-[#e5e5e5]">{n.productName}</p>
                          <p className="truncate text-[10px] text-slate-400">{n.productCode || '-'}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" onClick={() => updateNewQty(n.key, n.quantity - 1)} disabled={n.quantity <= 1}
                            className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-xs font-bold disabled:opacity-40">-</button>
                          <input
                            type="number"
                            min={1}
                            max={maxQ || undefined}
                            value={n.quantity}
                            onChange={(e) => updateNewQty(n.key, e.target.value === '' ? 1 : e.target.value)}
                            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center text-xs outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                          />
                          <button type="button" onClick={() => updateNewQty(n.key, n.quantity + 1)} disabled={atMax}
                            className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-xs font-bold disabled:opacity-40">+</button>
                          <button type="button" onClick={() => removeNewItem(n.key)}
                            className="ml-1 text-xs text-red-500 hover:underline">✕</button>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>ĐVT:</span>
                        <select
                          value={n.unitName}
                          onChange={(e) => {
                            const base = { unitName: 'Cái (đvt cơ bản)', convertValue: 1 };
                            const opt = [base, ...(n.conversionUnits || [])]
                              .find((u) => u.unitName === e.target.value);
                            if (!opt) return;
                            // Đơn giá theo ĐVT chọn: giá riêng của ĐVT nếu có, không thì convertValue * giá base.
                            const price = opt.price ?? (opt.convertValue * (n.baseUnitPrice || 0));
                            updateNewUnit(n.key, opt.unitName, opt.convertValue, price);
                          }}
                          className="flex-1 rounded border border-slate-300 px-1 py-0.5 text-[10px] outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                        >
                          <option value="Cái (đvt cơ bản)">Cái (đvt cơ bản) · ×1</option>
                          {(n.conversionUnits || []).map((u) => (
                            <option key={u.conversionId || u.unitName} value={u.unitName}>
                              {u.unitName} · ×{u.convertValue}
                            </option>
                          ))}
                        </select>
                        <span className="font-semibold text-slate-600 dark:text-[#b3b3b3]">
                          {formatCurrency(n.quantity * n.unitPrice)}
                        </span>
                      </div>
                      {maxQ > 0 && (
                        <p className={`mt-1 text-[10px] ${atMax ? 'font-semibold text-amber-600' : 'text-slate-400'}`}>
                          Tồn khả dụng: {getAvailBase(n)} Cái · tối đa {maxQ} {n.unitName}{atMax ? ' (đạt giới hạn)' : ''}
                        </p>
                      )}
                      {maxQ === 0 && (
                        <p className="mt-1 text-[10px] font-semibold text-red-500">Hết hàng — không thể đổi sản phẩm này</p>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
              {newItems.length === 0 && (
                <p className="text-center text-xs text-slate-400">Chưa chọn SP mới nào</p>
              )}

              {/* Delta card */}
              <div>
                {quoteLoading && <p className="text-xs text-slate-400">Đang tính chênh lệch...</p>}
                {quote && !quoteLoading && (
                  <DeltaCard quote={quote} paymentMethod={paymentMethod} onPaymentMethodChange={setPaymentMethod} />
                )}
                {!quote && !quoteLoading && (
                  <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-[#333333]">
                    Chọn ít nhất 1 SP A và 1 SP B để tính chênh lệch giá.
                  </p>
                )}
              </div>
            </div>
          )}


          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Ghi chú</label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm (không bắt buộc)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          )}
        </div>
      )}
    </Modal>

    {/* Thanh toán tiền mặt — đổi chênh lệch (delta>0, CASH) → Completed */}
    <ExchangeCashModal
      isOpen={!!(pendingExchange && pendingExchange.method === 'CASH')}
      onClose={handleCashPayClose}
      amount={pendingExchange?.delta || 0}
      loading={payLoading}
      error={submitError}
      onConfirm={handleCashPayConfirm}
    />

    {/* Thanh toán chuyển khoản — đổi chênh lệch (delta>0, TRANSFER) → QR → Completed */}
    <QRModal
      isOpen={!!(pendingExchange && pendingExchange.method === 'TRANSFER' && qrData)}
      onClose={handleQRClose}
      qrData={qrData}
      onConfirm={handleQRConfirm}
      loading={payLoading}
    />
    </>
  );
};

export default ReturnForm;
