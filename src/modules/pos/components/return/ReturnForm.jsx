/**
 * ReturnForm - Tạo đơn đổi trả
 * Flow: nhập mã hóa đơn → tìm hóa đơn → chọn sản phẩm → chọn loại + lý do → tạo
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { apiPosGet } from '../../../../services/apiClient';
import {
  getOrders,
  getReturns,
  createReturn,
  addReturnItem,
  cancelReturn,
  getInvoice,
  getProductCategory,
} from '../../services/posService';

const POLICIES_STORAGE_KEY = 'pos_category_return_policies';

const REFUND_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'TRANSFER', label: 'Chuyển khoản' },
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

  // Hạn mức bảo hành (số lượng có thể BH tối đa) cho từng sản phẩm — fetch từ
  // /api/warranty/{productId}/suggested-suppliers. maxRem = max remainingWarrantyQuantity
  // giữa các NCC (trường hợp tốt nhất). Dùng để hiện limit cho từng dòng khi tạo đơn BH.
  const [warrantyLimitMap, setWarrantyLimitMap] = useState({});

  useEffect(() => {
    if (!invoice?.items?.length) { setWarrantyLimitMap({}); return; }
    let cancelled = false;
    const distinctPids = [...new Set(invoice.items.map((it) => it.productId).filter(Boolean))];
    Promise.all(distinctPids.map(async (pid) => {
      try {
        const res = await apiPosGet(`/warranty/${pid}/suggested-suppliers`);
        const data = res?.data || res;
        const arr = Array.isArray(data) ? data : [];
        const maxRem = arr.reduce((m, s) => Math.max(m, Number(s.remainingWarrantyQuantity ?? 0)), 0);
        const bestName = arr
          .filter((s) => Number(s.remainingWarrantyQuantity ?? 0) === maxRem && maxRem > 0)
          .map((s) => s.supplierName || s.name || '')
          .filter(Boolean)[0] || '';
        return [pid, { maxRem, bestName, suppliers: arr }];
      } catch {
        return [pid, { maxRem: 0, bestName: '', suppliers: [] }];
      }
    })).then((entries) => {
      if (cancelled) return;
      const map = {};
      entries.forEach(([pid, v]) => { map[pid] = v; });
      setWarrantyLimitMap(map);
    });
    return () => { cancelled = true; };
  }, [invoice]);

  // Fetch policies từ backend POS khi mở modal, fallback localStorage
  useEffect(() => {
    if (!isOpen) return;
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

  const isExchange = returnType === 'EXCHANGE';

  // Kiểm tra sản phẩm có được phép đổi/trả theo policy không
  // Trả về { allowed: boolean, reason: string | null }
  const getReturnStatus = (item, type) => {
    const policy = item._policy;
    const catName = item._categoryName || '';
    const isExchange = type === 'EXCHANGE';
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
  const subtotal = selectedProducts.reduce((sum, p) => sum + p.quantity * (p.sellPrice || 0), 0);
  const discountRatio =
    invoice?.discountAmount && invoice?.subtotal ? invoice.discountAmount / invoice.subtotal : 0;
  const discountPortion = subtotal * discountRatio;
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
      const ordersData = await getOrders({ status: 'Completed', pageSize: 200 });
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

    // Bảo hành: KHÔNG cho "BH một phần" — nếu chọn vượt hạn mức (thiếu) thì chặn luôn.
    if (isExchange) {
      const over = selectedProducts.find((sp) => {
        const wl = warrantyLimitMap[sp.productId];
        if (!wl) return true; // hạn mức chưa tải xong → chặn, đợi tải
        const cv = sp.convertValue || sp.conversionRate || 1;
        const selBase = (sp.quantity || 0) * cv;
        return selBase > (wl.maxRem ?? 0);
      });
      if (over) {
        const wl = warrantyLimitMap[over.productId];
        const cv = over.convertValue || over.conversionRate || 1;
        const maxRem = wl?.maxRem ?? 0;
        const selBase = (over.quantity || 0) * cv;
        setSubmitError(
          maxRem <= 0
            ? `Sản phẩm "${over.productName}" đã hết hạn mức bảo hành — không thể bảo hành.`
            : `Sản phẩm "${over.productName}" vượt hạn mức bảo hành: chỉ còn ${maxRem} (đơn vị cơ bản), đang chọn ${selBase} — không đủ để bảo hành. Vui lòng giảm số lượng.`
        );
        setSubmitting(false);
        return;
      }
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
    <Modal
      isOpen={isOpen}
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
            <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={selectedProducts.length === 0}>
              {isExchange ? 'Tạo đơn bảo hành' : 'Tạo đơn trả hàng'}
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setReturnType('REFUND');
                  setSelectedProducts([]); // Clear khi đổi loại để tránh giữ lại SP không hợp lệ
                }}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  returnType === 'REFUND'
                    ? 'border-[#004785] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 dark:border-[#333333] dark:hover:border-[#404040]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    returnType === 'REFUND'
                      ? 'bg-[#004785] text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-[#272727] dark:text-[#999999]'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 15v-1a4 4 0 00-8 0v1m0 0h8m-8 0a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v3a4 4 0 01-4 4m-8 0a4 4 0 004 4h.5M9 19l-1.5 1.5M9 19l1.5-1.5"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">Trả hàng</p>
                  <p className="text-xs text-slate-500 dark:text-[#999999]">Hoàn tiền cho khách</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReturnType('EXCHANGE');
                  setSelectedProducts([]); // Clear khi đổi loại để tránh giữ lại SP không hợp lệ
                }}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  returnType === 'EXCHANGE'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-slate-200 hover:border-slate-300 dark:border-[#333333] dark:hover:border-[#404040]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    returnType === 'EXCHANGE'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">Bảo hành</p>
                  <p className="text-xs text-slate-500 dark:text-[#999999]">Đổi sản phẩm cùng loại, không hoàn tiền</p>
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

                // Hạn mức bảo hành (chỉ dùng khi isExchange). maxRem = đơn vị cơ bản.
                const wl = isExchange ? warrantyLimitMap[item.productId] : undefined;
                const cv = item.convertValue || item.conversionRate || 1;
                const bhMaxRem = wl?.maxRem ?? null; // null = chưa tải xong
                const bhMaxSell = bhMaxRem != null && cv > 0 ? Math.floor(bhMaxRem / cv) : null; // số ĐVT bán tối đa BH được
                const bhSelBase = selected ? (selected.quantity || 0) * cv : 0;
                const bhOver = selected && bhMaxRem != null && bhSelBase > bhMaxRem; // vượt/thiếu → KHÔNG cho BH
                const bhCapReached = bhMaxSell != null && selected && (selected.quantity || 0) >= bhMaxSell; // đạt mức tối đa → chặn +

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
                      disabled={notAllowed || (isExchange && bhMaxRem === 0)}
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
                      {isExchange && (() => {
                        // Hạn mức BH (đơn vị cơ bản). Vượt/thiếu → KHÔNG cho bảo hành.
                        if (bhMaxRem == null) {
                          return <p className="truncate text-[10px] text-slate-300 dark:text-[#555]">Đang tải hạn mức BH…</p>;
                        }
                        const unit = item._displayUnit || '';
                        const color = (bhMaxRem <= 0 || bhOver)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400';
                        return (
                          <p className={`truncate text-[10px] font-semibold ${color}`}>
                            {bhMaxRem <= 0
                              ? '⛔ Hết hạn mức BH — không thể bảo hành'
                              : bhOver
                                ? `⛔ Vượt hạn mức BH: chỉ còn ${bhMaxRem} (đủ ${bhMaxSell} ${unit}) — đang chọn ${bhSelBase}, KHÔNG đủ để bảo hành. Giảm số lượng.`
                                : `✓ Hạn mức BH: ${bhMaxRem}${wl.bestName ? ` · ${wl.bestName}` : ''}`}
                          </p>
                        );
                      })()}
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
                          disabled={notAllowed || (isExchange && !!bhCapReached)}
                          onClick={() => updateQty(itemKey, (selected.quantity || 1) + 1)}
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${(notAllowed || (isExchange && !!bhCapReached)) ? 'border-slate-200 text-slate-300 dark:border-[#333333]' : 'border-slate-200 hover:bg-slate-100 dark:border-[#333333] dark:hover:bg-[#272727]'}`}
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
          {!isExchange && (
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
          )}

          {/* Exchange note */}
          {isExchange && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <div>
                  <p className="text-sm font-bold text-yellow-800">Bảo hành — không hoàn tiền</p>
                  <p className="mt-1 text-xs text-yellow-600">
                    Khách hàng sẽ đổi sản phẩm cùng loại, cùng mẫu mã. Phiếu này ghi nhận việc đổi
                    trả, không phát sinh hoàn tiền.
                  </p>
                </div>
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
  );
};

export default ReturnForm;
