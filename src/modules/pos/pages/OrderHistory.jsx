/**
 * OrderHistory Page - Lịch sử đơn hàng POS (bán tại quầy)
 * Dữ liệu từ API: GET /pos/invoices?status=Completed
 */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { Modal } from '../../../shared/components/Modal';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDate } from '../../../shared/utils/formatDate';
import { getOrders, getInvoice, getReturns, getPosProducts } from '../services/posService';
import { getInvoiceTemplate } from '../../owner/services/printTemplateService';
import Icon from '../../../shared/components/Icon';

const VN_TZ = 'Asia/Ho_Chi_Minh';
const formatDateTimeVN = (date) => formatDate(date, 'DD/MM/YYYY HH:mm', { timeZone: VN_TZ });

// Mock data fallback — dùng khi API chưa có dữ liệu
const PAYMENT_VARIANTS = {
  'Tiền mặt': 'warning',
  Thẻ: 'info',
  'Chuyển khoản': 'primary',
  'Kết hợp': 'secondary',
  'Công nợ': 'danger',
  Cash: 'warning',
  Card: 'info',
  Transfer: 'primary',
  Combined: 'secondary',
  Debt: 'danger',
  CASH: 'warning',
  CARD: 'info',
  TRANSFER: 'primary',
  COMBINED: 'secondary',
  DEBT: 'danger',
};
const PAYMENT_LABELS = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ',
  COMBINED: 'Kết hợp',
  DEBT: 'Công nợ',
  Cash: 'Tiền mặt',
  Transfer: 'Chuyển khoản',
  Card: 'Thẻ',
  Combined: 'Kết hợp',
  Debt: 'Công nợ',
};
const translatePayment = (method) => {
  if (method && method.startsWith('[')) {
    try {
      const arr = JSON.parse(method);
      if (Array.isArray(arr)) {
        return arr.map(p => PAYMENT_LABELS[p.method] || p.method).join(', ');
      }
    } catch {}
    return 'Kết hợp';
  }
  return PAYMENT_LABELS[method] || method || '-';
};

// Map API order/invoice sang format chuẩn cho UI
const mapOrder = (o) => {
  // Xử lý paymentMethod: map không phân biệt hoa thường
  let paymentMethod = o.paymentMethod || o.paymentType || '';
  if (!paymentMethod) {
    // Thử từ payments array
    const paymentLines = o.payLines || o.payments || o.paymentLines || [];
    if (paymentLines.length > 0) {
      const pm = paymentLines[0].method || paymentLines[0].paymentMethod || '';
      paymentMethod = pm;
    }
  }
  // Chuẩn hóa: Cash → CASH, card → CARD, Chuyển khoản → giữ nguyên
  const normalizedPM = PAYMENT_LABELS[paymentMethod]
    ? paymentMethod
    : PAYMENT_LABELS[paymentMethod.toUpperCase()]
      ? paymentMethod.toUpperCase()
      : paymentMethod;

  // Tra từ localStorage nếu API không trả về
  const invoiceId = o.invoiceCode || o.invoiceId || o.id;
  const lines = o.payLines || o.payments || o.paymentLines || [];
  if (!normalizedPM && invoiceId) {
    try {
      const savedPM = JSON.parse(localStorage.getItem('pos_order_payments') || '{}');
      const raw = savedPM[invoiceId];
      console.log('[OrderHistory] localStorage payment lookup:', invoiceId, raw);
      if (raw) {
        // Parse: có thể là [{method, amount}] (mới) hoặc ["Tiền mặt"] (cũ)
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) {
            if (typeof arr[0] === 'string') {
              // Legacy: ["Tiền mặt", "Chuyển khoản"]
              paymentMethod = arr.join(', ');
              arr.forEach((m) => {
                if (!lines.some((l) => l.method === m)) lines.push({ method: m, amount: 0 });
              });
            } else if (typeof arr[0] === 'object') {
              // Mới: [{method: "Tiền mặt", amount: 50000}, ...]
              paymentMethod = arr.map((p) => p.method).join(', ');
              arr.forEach((p) => {
                const pMethod = PAYMENT_LABELS[p.method] || p.method; // chuẩn hóa Tiền mặt→Tiền mặt, Cash→Tiền mặt
                const exists = lines.some((l) => {
                  const lMethod = PAYMENT_LABELS[l.method] || l.method;
                  return lMethod === pMethod;
                });
                if (!exists) lines.push(p);
              });
            }
          }
        } catch {
          // Legacy format: raw string "Cash"
          paymentMethod = PAYMENT_LABELS[raw] || raw;
        }
      }
    } catch {}
  }
  console.log('[OrderHistory] mapOrder result:', {
    invoiceId,
    paymentMethod,
    linesCount: lines.length,
  });

  // Xử lý createdBy: có thể là string (ID/name) hoặc object {id, name}
  let cashierName = '-';
  if (o.userName) cashierName = o.userName;
  else if (o.cashier) cashierName = o.cashier;
  else if (o.cashierName) cashierName = o.cashierName;
  else if (typeof o.createdBy === 'string') cashierName = o.createdBy;
  else if (typeof o.createdBy === 'object' && o.createdBy?.name) cashierName = o.createdBy.name;
  else if (typeof o.createdBy === 'object' && o.createdBy?.fullName)
    cashierName = o.createdBy.fullName;
  else {
    // Tra từ localStorage (lưu khi tạo đơn ở POSScreen)
    const invoiceId = o.invoiceCode || o.invoiceId || o.id;
    if (invoiceId) {
      try {
        const saved = JSON.parse(localStorage.getItem('pos_order_cashiers') || '{}');
        cashierName = saved[invoiceId] || '-';
      } catch {}
    }
  }

  return {
    id: o.invoiceCode || o.invoiceId || o.id || '',
    invoiceId: o.invoiceId || o.id || o.invoiceCode || '',
    invoiceCode: o.invoiceCode || o.id || '',
    date: o.createdAt || o.date || o.invoiceDate || '',
    createdAt: o.createdAt || o.date || o.invoiceDate || '',
    customerName: o.customerName || o.customer || 'Khách lẻ',
    customer: o.customerName || o.customer || 'Khách lẻ',
    cashier: cashierName,
    userName: cashierName,
    items: (o.items || o.lineItems || []).map((item) => ({
      productId: item.productId || item.id || '',
      productCode: item.productCode || '',
      productName: item.productName || item.name || item.productName || '',
      name: item.productName || item.name || item.productName || '',
      quantity: item.quantity || 0,
      unitPrice: parseFloat(item.unitPrice || item.price || item.retailPrice || 0),
      price: parseFloat(item.unitPrice || item.price || item.retailPrice || 0),
      totalPrice: parseFloat(
        item.totalPrice ||
          item.lineTotal ||
          (item.unitPrice || item.price || 0) * (item.quantity || 0)
      ),
      unit: item.unit || item.Unit || item.baseUnit || item.BaseUnit || '',
      selectedUnit: item.selectedUnit || item.SelectedUnit || item.unitName || item.UnitName || '',
      displayUnit: item.selectedUnit || item.SelectedUnit || item.unitName || item.UnitName || item.unit || item.Unit || item.baseUnit || item.BaseUnit || '',
    })),
    itemCount: (o.items || o.lineItems || []).length || o.itemCount || 0,
    subtotal: parseFloat(o.subtotal || o.Subtotal || o.subTotal || 0),
    discount: parseFloat(o.discountAmount || o.DiscountAmount || o.discount || 0),
    vat: parseFloat(o.taxAmount || o.TaxAmount || o.vat || o.tax || 0),
    totalAmount: parseFloat(o.totalAmount || o.TotalAmount || o.total || o.grandTotal || 0),
    total: parseFloat(o.totalAmount || o.TotalAmount || o.total || o.grandTotal || 0),
    paymentMethod: normalizedPM || paymentMethod,
    payLines:
      lines.length > 0
        ? lines.map((pl) => ({
            method: pl.method || pl.paymentMethod || pl.paymentType || '',
            amount: parseFloat(pl.amount || 0),
          }))
        : [],
    changeAmount: parseFloat(o.changeAmount || o.change || 0),
    discountAmount: parseFloat(o.discountAmount || o.discount || 0),
    discountPercent: parseFloat(o.discountPercent || o.DiscountPercent || 0),
    taxAmount: parseFloat(o.taxAmount || o.vat || o.tax || 0),
    note: o.note || o.notes || '',
  };
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const { drafts, setDrafts, showNotice } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [returnsData, setReturnsData] = useState([]); // danh sách hoàn trả để tính net revenue
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [backfilling, setBackfilling] = useState(false); // Track backfill state to prevent "0 đ" flash
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, timeFilter]);

  const [latestProductsMap, setLatestProductsMap] = useState({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch orders, returns, và posProducts song song
      const [data, returnsRaw, posProductsRaw] = await Promise.all([
        getOrders({ status: 'Completed', pageSize: 1000 }),
        getReturns({}).catch(() => []),
        getPosProducts({}).catch(() => []),
      ]);
      console.log('[OrderHistory] API response:', data);
      // Backend trả về PageResultDto với Items (capital I) hoặc mảng trực tiếp
      const raw = Array.isArray(data) ? data : (data?.Items ?? data?.items ?? data?.data ?? []);
      const items = Array.isArray(raw) ? raw.map(mapOrder) : [];
      console.log('[OrderHistory] mapped orders:', items.length, items[0]);
      if (items.length > 0)
        console.log(
          '[OrderHistory] raw first item keys:',
          Object.keys(Array.isArray(raw) ? raw[0] : [])
        );
      setOrders(items);
      // Lưu returns để tính net revenue và hiển thị badge
      const allReturns = Array.isArray(returnsRaw)
        ? returnsRaw
        : (returnsRaw?.items ?? returnsRaw?.data ?? []);
      setReturnsData(allReturns);

      // Build product price map for real-time draft total calculation
      const pItems = Array.isArray(posProductsRaw)
        ? posProductsRaw
        : (posProductsRaw?.Items ?? posProductsRaw?.items ?? posProductsRaw?.data ?? []);
      const pMap = {};
      pItems.forEach((p) => {
        const id = String(p.ProductId || p.productId || p.id || p.ProductCode || p.productCode || '');
        const price = parseFloat(p.RetailPrice ?? p.retailPrice ?? p.unitPrice ?? p.salePrice ?? p.price ?? 0);
        if (id) pMap[id] = price;
      });
      setLatestProductsMap(pMap);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setFetchError(err.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Tu dong refresh khi quay lai trang
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible') fetchOrders();
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [fetchOrders]);

  // Fetch chi tiết hóa đơn khi chọn xem
  const [selected, setSelected] = useState(null);
  const [, setSelectedLoading] = useState(false);
  const handleSelectOrder = async (row) => {
    setSelected(row);
    setSelectedLoading(true);
    const invoiceId = row.invoiceId || row.invoiceCode || row.id;
    if (invoiceId) {
      try {
        const detail = await getInvoice(invoiceId);
        if (detail) {
          const mapped = mapOrder(detail);
          // Giữ lại items từ row nếu API detail không trả về items
          if ((!mapped.items || mapped.items.length === 0) && row.items?.length > 0) {
            mapped.items = row.items;
          }
          setSelected((prev) =>
            prev?.id === (row.invoiceCode || row.id) ? { ...prev, ...mapped } : prev
          );
          // Cập nhật luôn vào orders để bảng hiển thị đúng tổng tiền
          setOrders((prev) =>
            prev.map((o) =>
              o.invoiceCode === mapped.invoiceCode || o.id === mapped.id ? { ...o, ...mapped } : o
            )
          );
        }
      } catch (err) {
        console.warn('[OrderHistory] getInvoice failed, using list data:', err?.message);
      }
    }
    setSelectedLoading(false);
  };

  const handlePrintOrder = async (order) => {
    let tpl = {};
    try {
      const res = await getInvoiceTemplate();
      tpl = res?.data || res || {};
    } catch {
      // fallback
    }

    const shopName = tpl.branchName || 'MEP SYSTEM';
    const shopAddress = tpl.branchAddress || '12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM';
    const shopPhone = tpl.phone || '028.3999.8888';
    const shopTaxCode = tpl.taxCode || '0312345678';
    const thankYou = tpl.thankYouMessage || 'Cảm ơn quý khách!';
    const paperSize = tpl.paperSize === 'K58' ? '58mm' : '80mm';
    const fontSize = tpl.fontSize || 13;
    const fontFamily = tpl.fontFamily === 'sans-serif' ? 'Arial, sans-serif' : tpl.fontFamily === 'serif' ? 'Georgia, serif' : "'Courier New', Courier, monospace";
    const showLogo = tpl.showLogo && tpl.logoUrl;
    const logoUrl = tpl.logoUrl || '';
    const showCustomerInfo = tpl.showCustomerInfo !== false;
    const showCashierName = tpl.showCashierName !== false;
    const showBranchInfo = tpl.showBranchInfo !== false;
    const showPaymentMethod = tpl.showPaymentMethod !== false;

    const printWindow = window.open('', '_blank', 'width=420,height=800');
    if (!printWindow) {
      showNotice?.('Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.');
      return;
    }

    const payLines = Array.isArray(order.payLines)
      ? order.payLines
      : Array.isArray(order.payments)
        ? order.payments
        : [];
    const totalPaid = payLines.length > 0
      ? payLines.reduce((s, pl) => s + pl.amount, 0)
      : order.totalAmount || order.total || 0;

    const payLinesHtml = payLines.length > 0
      ? payLines.map((pl) => `<div class="flex-between"><span>${translatePayment(pl.method)}</span><span>${formatCurrency(pl.amount)}</span></div>`).join('')
      : '';

    const itemsHtml = (order.items || [])
      .map((item) => `
      <tr>
        <td class="text-left">${item.productName || item.name || 'SP'}</td>
        <td class="text-center">${item.quantity || 0} ${item.displayUnit || item.selectedUnit || item.unit || ''} x ${formatCurrency(item.unitPrice || item.price || 0)}</td>
        <td class="text-right">${formatCurrency((item.unitPrice || item.price || 0) * (item.quantity || 0))}</td>
      </tr>`)
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><title>In hóa đơn ${order.id}</title>
<style>
  @page { size: ${paperSize} ${paperSize === '58mm' ? 'auto' : '297mm'}; margin: 0; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    width:${paperSize};
    max-width:320px;
    margin:0 auto;
    padding:8px 6px;
    font-family:${fontFamily};
    font-size:${fontSize}px;
    line-height:1.35;
    color:#000;
    background:#fff;
  }
  .text-center{text-align:center}
  .text-left{text-align:left}
  .text-right{text-align:right;white-space:nowrap}
  .bold{font-weight:700}
  .fs-sm{font-size:11px}
  .fs-lg{font-size:15px}
  hr{border:none;border-bottom:1px dashed #000;margin:6px 0}
  .flex-between{display:flex;justify-content:space-between;align-items:center;margin:2px 0}
  table{width:100%;border-collapse:collapse;margin:4px 0}
  th,td{padding:3px 0;vertical-align:top}
  th{font-size:11px;font-weight:700;text-transform:uppercase;border-bottom:1px dashed #000}
  th.w40{width:42%}
  th.w30{width:30%}
  th.w28{width:28%}
  @media print{
    body{max-width:100%;width:100%;padding:8px 10px;font-size:12px}
    td{font-size:12px}
    .fs-lg{font-size:14px}
    .fs-sm{font-size:10px}
    th{font-size:10px}
  }
</style></head>
<body>
<div class="text-center">
  ${showLogo ? `<img src="${logoUrl}" alt="logo" style="max-height:44px;margin-bottom:3px" />` : ''}
  ${showBranchInfo ? `<div class="bold fs-lg">${shopName}</div>
  <div>${shopAddress}</div>
  <div class="fs-sm">ĐT: ${shopPhone} &bull; MST: ${shopTaxCode}</div>` : `<div class="bold fs-lg">${shopName}</div>`}
</div>
<hr>
<div class="text-center">
  <div class="bold fs-lg">HÓA ĐƠN BÁN HÀNG</div>
  ${tpl.headerText ? `<div>${tpl.headerText}</div>` : ''}
  <div>Ma: ${order.id}</div>
  <div class="fs-sm">${formatDateTimeVN(order.date || order.createdAt)}</div>
</div>
<hr>
${showCashierName && (order.cashier || order.userName) ? `<div class="flex-between"><span>Thu ngân:</span><span class="bold">${order.cashier || order.userName}</span></div><hr>` : ''}
${itemsHtml ? `<table><thead><tr><th class="text-left w40">MẶT HÀNG</th><th class="text-center w30">SL x GIÁ</th><th class="text-right w28">T.TIỀN</th></tr></thead><tbody>${itemsHtml}</tbody></table><hr>` : ''}
<div class="flex-between"><span>Tạm tính</span><span>${formatCurrency(order.subtotal)}</span></div>
${order.discount > 0 ? `<div class="flex-between"><span style="color:#c62828;">Giảm giá</span><span style="color:#c62828;">-${formatCurrency(order.discount)}</span></div>` : ''}
<div class="flex-between bold fs-lg"><span>TỔNG CỘNG</span><span>${formatCurrency(order.total)}</span></div>
<hr>
${showCustomerInfo ? `<div class="flex-between"><span>Khách hàng</span><span>${order.customer || 'Khách lẻ'}</span></div>` : ''}
${showPaymentMethod ? payLinesHtml : ''}
<div class="flex-between bold"><span>Đã thanh toán</span><span>${formatCurrency(totalPaid)}</span></div>
${order.change > 0 ? `<div class="flex-between"><span style="color:#e65100;">Tiền thừa</span><span style="color:#e65100;">${formatCurrency(order.change)}</span></div>` : ''}
<hr>
<div class="text-center" style="margin-top:8px">
  <div class="bold">${thankYou}</div>
  ${tpl.footerText ? `<div class="fs-sm" style="margin-top:2px">${tpl.footerText}</div>` : '<div class="fs-sm" style="margin-top:2px">Hẹn gặp lại &#9728;</div>'}
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
    printWindow.document.close();
  };

  const getVNDateStr = (dateStr) => {
    if (!dateStr) return '';
    // Chuẩn hóa ISO: cắt microsecond về millisecond để tránh Invalid Date trên một số browser
    let normalized = typeof dateStr === 'string' ? dateStr.replace(/(\.\d{3})\d+/, '$1') : dateStr;
    if (
      typeof normalized === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(normalized)
    ) {
      normalized += 'Z';
    }
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return '';
    // Convert sang múi giờ Việt Nam (UTC+7) bằng cách dùng Intl với timeZone, không phụ thuộc browser TZ
    const fmt = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(d);
  };

  const todayStr = getVNDateStr(new Date());

  const filtered = useMemo(() => {
    if (!orders.length && !loading) return [];
    let list = orders;
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(
        (o) =>
          (o.invoiceCode || o.id || '').toLowerCase().includes(kw) ||
          (o.customerName || '').toLowerCase().includes(kw)
      );
    }
    if (timeFilter === 'today') {
      list = list.filter((o) => getVNDateStr(o.createdAt || o.date) === todayStr);
    }
    if (timeFilter === 'yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterdayStr = getVNDateStr(d);
      list = list.filter((o) => getVNDateStr(o.createdAt || o.date) === yesterdayStr);
    }
    if (timeFilter === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      list = list.filter((o) => new Date(o.createdAt || o.date) >= w);
    }
    // Sap xep moi nhat len dau
    return [...list].sort(
      (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
    );
  }, [orders, search, timeFilter, loading, todayStr]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Tự động backfill tổng tiền cho các đơn ở trang hiện tại
  const fetchedDetailIds = useRef(new Set());
  useEffect(() => {
    if (!orders.length || loading) return;
    // Chỉ backfill những đơn thực sự thiếu totalAmount (=0) — không backfill khi đã có data
    const needFetch = paginatedData.filter(
      (o) =>
        !fetchedDetailIds.current.has(o.invoiceCode) &&
        (!o.totalAmount || o.totalAmount === 0 || !o.items?.length)
    );
    if (!needFetch.length) return;
    needFetch.forEach((o) => fetchedDetailIds.current.add(o.invoiceCode));
    Promise.allSettled(
      needFetch.map((o) => {
        // Dùng invoiceId (Guid) thay vì invoiceCode
        const id = o.invoiceId || o.id;
        return id ? getInvoice(id) : Promise.reject('no id');
      })
    ).then((results) => {
      setOrders((prev) => {
        const updated = [...prev];
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            const mapped = mapOrder(result.value);
            const code = needFetch[idx].invoiceCode;
            const orderIdx = updated.findIndex((o) => o.invoiceCode === code);
            if (orderIdx === -1) return;
            // Chỉ ghi đè nếu mapped.totalAmount > 0; giữ nguyên nếu detail trả về 0 hoặc thiếu
            if (!mapped.totalAmount || mapped.totalAmount === 0) return;
            updated[orderIdx] = { ...updated[orderIdx], ...mapped };
          }
        });
        return updated;
      });
      setBackfilling(false);
    });
  }, [paginatedData, orders.length, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayOrders = orders.filter((o) => {
    const orderDateVN = getVNDateStr(o.createdAt || o.date);
    return orderDateVN === todayStr;
  });
  const todayGross = todayOrders.reduce((s, o) => s + (o.totalAmount || o.total || 0), 0);
  console.log('[OrderHistory] todayRevenue debug:', {
    browserTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
    todayStr,
    todayOrdersCount: todayOrders.length,
    todayGross,
    todayOrdersSample: todayOrders.slice(0, 3).map((o) => ({
      code: o.invoiceCode,
      createdAt: o.createdAt,
      vnDate: getVNDateStr(o.createdAt),
      totalAmount: o.totalAmount,
    })),
  });

  // Doanh thu thực = Doanh thu bán - Tổng hoàn trả (REFUND) trong ngày hôm nay
  const todayRefunds = returnsData
    .filter((r) => {
      const rStatus = String(r.status || '').toUpperCase();
      const rType = String(r.returnType || r.return_type || '').toUpperCase();
      const rDateVN = getVNDateStr(r.createdAt || r.created_at || '');
      return rStatus !== 'CANCELLED' && rType === 'REFUND' && rDateVN === todayStr;
    })
    .reduce((sum, r) => sum + parseFloat(r.refundAmount || r.refund_amount || 0), 0);
  const todayRevenue = todayGross - todayRefunds;
  const todayCount = todayOrders.length;

  // Build map: invoiceCode -> totalRefundedAmount (để hiển thị badge)
  const refundByInvoice = {};
  const exchangeDiffByInvoice = {};
  const warrantyByInvoice = {};
  returnsData.forEach((r) => {
    const rStatus = String(r.status || '').toUpperCase();
    const rType = String(r.returnType || r.return_type || '').toUpperCase();
    if (rStatus === 'CANCELLED') return;
    const key = r.invoiceCode || r.returnCode || '';
    if (!key) return;
    if (rType === 'REFUND') {
      refundByInvoice[key] =
        (refundByInvoice[key] || 0) + parseFloat(r.refundAmount || r.refund_amount || 0);
    }
    if (rType === 'EXCHANGE') {
      // Phân biệt đổi chênh (có tiền lệch) vs bảo hành (ngang giá) — backend cùng lưu EXCHANGE.
      const num = (v) => parseFloat(v ?? 0) || 0;
      const isDiff = num(r.deltaAmount ?? r.delta_amount) !== 0 || num(r.payAmount ?? r.pay_amount) > 0 || num(r.refundAmountCustomer ?? r.refund_amount_customer) > 0;
      if (isDiff) exchangeDiffByInvoice[key] = true;
      else warrantyByInvoice[key] = true;
    }
  });

  const columns = [
    {
      key: 'invoiceCode',
      header: 'Mã đơn',
      width: '180px',
      render: (v, row) => {
        const code = v || row.id || '-';
        const refunded = refundByInvoice[code];
        const exchangedDiff = exchangeDiffByInvoice[code];
        const warrantied = false;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold text-[#004785] dark:text-blue-300">{code}</span>
            <div className="flex flex-wrap gap-1">
              {refunded > 0 && (
                <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  🔄 Hoàn {formatCurrency(refunded)}
                </span>
              )}
              {exchangedDiff && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  🔄 Đổi chênh
                </span>
              )}
              {warrantied && (
                <span className="inline-flex items-center gap-1 rounded border border-yellow-300 bg-yellow-50 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700">
                  🔄 Bảo hành
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      width: '140px',
      render: (v, row) => (
        <span className="text-xs text-slate-500">
          {v ? formatDateTimeVN(v) : row.date ? formatDateTimeVN(row.date) : '-'}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Khách hàng',
      render: (v, row) => (
        <span className="text-xs font-medium text-slate-900 dark:text-[#e5e5e5]">
          {v || row.customer || 'Khách lẻ'}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Món',
      width: '50px',
      render: (v, row) => (
        <span className="text-slate-600">
          {Array.isArray(v) ? v.length : (row.itemCount ?? v ?? 0)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Thanh toán',
      width: '160px',
      render: (v, row) => {
        // Ưu tiên payLines/payments array từ API
        const lines = row.payLines || row.payments || [];
        if (lines.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {lines.map((pl, i) => (
                <Badge key={i} variant={PAYMENT_VARIANTS[pl.method] || 'secondary'} size="sm">
                  {translatePayment(pl.method)}
                </Badge>
              ))}
            </div>
          );
        }
        // API trả về paymentMethod dạng enum: CASH, TRANSFER, CARD
        const label = translatePayment(v);
        return (
          <Badge variant={PAYMENT_VARIANTS[label] || 'secondary'} size="sm">
            {label}
          </Badge>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Tổng tiền',
      render: (v, row) => (
        <span className="text-xs font-bold text-green-600">
          {formatCurrency(v || row.totalAmount || row.total || 0)}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Thu ngân',
      render: (v, row) => (
        <span className="text-xs text-slate-500">{v || row.cashier || row.createdBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: '90px',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleSelectOrder(row)}
          className="text-xs font-medium text-[#004785] hover:underline"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  const FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: 'week', label: 'Tuần này' },
  ];

  return (
    <div className="flex h-full gap-6">
      {/* LEFT: List */}
      <div
        className={`flex flex-col gap-4 overflow-y-auto ${selected ? 'flex-1 pr-3' : 'flex-1 pr-3'}`}
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">Đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
            Xem lại các đơn đã bán và đơn nháp chưa thanh toán
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{todayCount}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Đơn hôm nay
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">
                {formatCurrency(todayRevenue)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Doanh thu hôm nay
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-purple-600">
                {todayCount > 0 ? formatCurrency(todayRevenue / todayCount) : formatCurrency(0)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Bình quân/đơn
              </p>
            </div>
          </Card>
        </div>

        {drafts.length > 0 && (
          <Card header={`Đơn nháp (${drafts.length})`} padding="p-0">
            <div className="divide-y divide-slate-100 dark:divide-[#333333]">
              {drafts.map((d) => {
                const currentTotal = (d.items || []).reduce((sum, item) => {
                  const itemId = String(item.productId || item.id || item.sku || item.productCode || '');
                  const latestPrice = latestProductsMap[itemId] ?? item.price;
                  return sum + Number(latestPrice || 0) * Number(item.quantity || 1);
                }, 0);
                return (
                  <div key={d.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="warning">Nháp</Badge>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-[#e5e5e5]">
                          {d.customer ? d.customer.name : 'Khách lẻ'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-[#808080]">
                          {d.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} món -{' '}
                          {formatCurrency(currentTotal > 0 ? currentTotal : d.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/pos', { state: { draft: d } })}
                      >
                        Tiếp tục
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDraftToDelete(d)}
                        title="Hủy đơn nháp"
                        className="rounded p-1 text-slate-400 hover:text-red-500 transition-colors dark:text-[#808080]"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {fetchError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <strong>Lỗi:</strong> {fetchError}
          </div>
        )}

        {/* Search + Filter + Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="w-60">
              <Input
                placeholder="Tìm mã đơn hoặc khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-[#333333]">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTimeFilter(f.id)}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${timeFilter === f.id ? 'bg-[#004785] text-white' : 'text-slate-500 hover:text-slate-900 dark:text-[#999999] dark:hover:text-[#e5e5e5]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate('/pos')}>
            + Tạo đơn mới
          </Button>
        </div>

        {/* Table */}
        <Card padding="p-0">
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading || backfilling}
            emptyMessage={fetchError ? `Lỗi: ${fetchError}` : 'Không có đơn hàng nào'}
          />
          {filtered.length > 0 && (
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filtered.length)} trong tổng số{' '}
                  {filtered.length} đơn hàng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                  Trang {currentPage} / {totalPages || 1}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* RIGHT: Detail Panel */}
      {selected && (
        <div className="w-96 shrink-0 space-y-4 overflow-y-auto">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#004785]">{selected.id}</h3>
                  <p className="text-xs text-slate-400 dark:text-[#808080]">{formatDateTimeVN(selected.date)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:text-[#808080] dark:hover:bg-[#272727]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-[#333333]">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-[#999999]">Khách hàng</span>
                  <span className="font-semibold">
                    {selected.customerName || selected.customer || 'Khách lẻ'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Thu ngân</span>
                  <span>{selected.userName || selected.cashier || selected.createdBy || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số món</span>
                  <span className="font-semibold">
                    {selected.items?.length ?? selected.items ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Danh sách sản phẩm đã mua */}
          <Card header={`Sản phẩm (${selected.items?.length || selected.itemCount || 0})`}>
            <div className="space-y-3">
              {selected.items && selected.items.length > 0 ? (
                (() => {
                  const hasValidPrice = selected.items.some(
                    (item) => (item.totalPrice || item.unitPrice || item.price || 0) > 0
                  );
                  return hasValidPrice ? (
                    selected.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {item.productName ||
                              item.name ||
                              item.productCode ||
                              `SP #${item.productId || item.id || ''}`}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-[#808080]">
                            {formatCurrency(item.unitPrice || item.price || 0)} x{' '}
                            {item.quantity || 0} {item.displayUnit || item.selectedUnit || item.unit || ''}
                          </p>
                        </div>
                        <span className="ml-2 shrink-0 text-sm font-bold text-green-600">
                          {formatCurrency(
                            item.totalPrice ||
                              (item.unitPrice || item.price || 0) * (item.quantity || 0)
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      {selected.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-slate-50 pb-2 text-sm last:border-0 last:pb-0"
                        >
                          <span className="truncate text-slate-900">
                            {item.productName ||
                              item.name ||
                              `SP #${item.productId || item.id || ''}`}
                          </span>
                          <span className="shrink-0 text-slate-500">
                            x {item.quantity || 0} {item.displayUnit || item.selectedUnit || item.unit || ''}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-[#004785]">
                        <span>Tổng tiền hàng</span>
                        <span>{formatCurrency(selected.totalAmount || selected.total || 0)}</span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-slate-400 dark:text-[#808080]">Không có chi tiết sản phẩm</p>
              )}
            </div>
          </Card>

          <Card header="Chi tiết thanh toán">
            <div className="space-y-3">
              {/* payLines từ mock | payments từ API | paymentMethod string */}
              {(() => {
                const payLines = selected.payLines || selected.payments || [];
                if (payLines.length > 0) {
                  return payLines.map((pl, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={PAYMENT_VARIANTS[pl.method] || 'secondary'} size="sm">
                          {translatePayment(pl.method)}
                        </Badge>
                        <span className="text-sm font-bold text-green-700">
                          {formatCurrency(pl.amount)}
                        </span>
                      </div>
                    </div>
                  ));
                }
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={PAYMENT_VARIANTS[selected.paymentMethod] || 'secondary'}
                        size="sm"
                      >
                        {translatePayment(selected.paymentMethod)}
                      </Badge>
                      <span className="text-sm font-bold text-green-700">
                        {formatCurrency(selected.totalAmount || selected.total || 0)}
                      </span>
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-1 border-t border-slate-200 pt-2 dark:border-[#333333]">
                <div className="flex justify-between text-xs text-slate-500 dark:text-[#999999]">
                  <span>Tạm tính</span>
                  <span>
                    {formatCurrency(
                      selected.subtotal ?? selected.totalAmount ?? selected.total ?? 0
                    )}
                  </span>
                </div>
                {selected.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Giảm giá {selected.discountPercent ?? ''}%</span>
                    <span>-{formatCurrency(selected.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-[#004785] dark:border-[#333333]">
                  <span>Tổng</span>
                  <span>{formatCurrency(selected.totalAmount ?? selected.total ?? 0)}</span>
                </div>
              </div>
              {selected.changeAmount > 0 && (
                <div className="flex justify-between rounded-lg bg-green-50 p-2 text-sm dark:bg-green-900/30">
                  <span className="text-green-700 dark:text-green-400">Tiền thừa</span>
                  <span className="font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(selected.changeAmount)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handlePrintOrder(selected)}>
              In hóa đơn
            </Button>
          </div>
        </div>
      )}

      {!selected && (
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 xl:flex dark:border-[#333333]">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">📋</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một đơn hàng</p>
            <p className="text-xs text-slate-300">để xem chi tiết</p>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy đơn nháp */}
      {draftToDelete && (
        <Modal
          isOpen={!!draftToDelete}
          onClose={() => setDraftToDelete(null)}
          title="Xác nhận hủy đơn nháp"
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDraftToDelete(null)}
              >
                Không, giữ lại
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDrafts((prev) => prev.filter((x) => x.id !== draftToDelete.id));
                  showNotice?.('Đã hủy đơn nháp thành công.');
                  setDraftToDelete(null);
                }}
              >
                Xác nhận hủy
              </Button>
            </div>
          }
        >
          <div className="py-2 space-y-2">
            <p className="text-sm text-slate-700 dark:text-[#b3b3b3]">
              Bạn có chắc chắn muốn hủy đơn nháp của khách hàng{' '}
              <strong className="text-slate-900 dark:text-[#e5e5e5]">
                {draftToDelete.customer ? draftToDelete.customer.name : 'Khách lẻ'}
              </strong>{' '}
              ({draftToDelete.items?.length || 0} sản phẩm) không?
            </p>
            <p className="text-xs text-red-500 italic">
              * Đơn nháp sau khi hủy sẽ bị xóa hoàn toàn và không thể khôi phục.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderHistory;
