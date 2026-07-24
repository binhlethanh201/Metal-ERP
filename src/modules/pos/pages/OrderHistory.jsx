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
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDate } from '../../../shared/utils/formatDate';
import { getOrders, getInvoice, getReturns, getPosProducts } from '../services/posService';
import Icon from '../../../shared/components/Icon';

const VN_TZ = 'Asia/Ho_Chi_Minh';
const formatDateTimeVN = (date) => formatDate(date, 'DD/MM/YYYY HH:mm', { timeZone: VN_TZ });

// Mock data fallback — dùng khi API chưa có dữ liệu
const MOCK_ORDERS = [
  {
    id: 'POS-20240508-001',
    invoiceCode: 'POS-20240508-001',
    date: '2024-05-08 14:30',
    createdAt: '2024-05-08T14:30:00',
    customer: 'Cty TNHH XD Minh Phat',
    customerName: 'Cty TNHH XD Minh Phat',
    cashier: 'Nguyen Van A',
    items: [
      { productName: 'Thép tấm SS400 5mm', quantity: 10, unitPrice: 250000, price: 250000 },
      { productName: 'Ống thép mạ kẽm Ø34', quantity: 50, unitPrice: 150000, price: 150000 },
    ],
    itemCount: 2,
    subtotal: 4200000,
    discount: 0,
    vat: 336000,
    total: 4536000,
    totalAmount: 4536000,
    payLines: [{ method: 'Tiền mặt', amount: 5000000 }],
    change: 464000,
    changeAmount: 464000,
  },
  {
    id: 'POS-20240508-002',
    invoiceCode: 'POS-20240508-002',
    date: '2024-05-08 15:10',
    createdAt: '2024-05-08T15:10:00',
    customer: 'Khách lẻ',
    customerName: 'Khách lẻ',
    cashier: 'Nguyen Van A',
    items: [
      { productName: 'Bulong M16', quantity: 50, unitPrice: 12000, price: 12000 },
      { productName: 'Đai ốc M16', quantity: 50, unitPrice: 5000, price: 5000 },
    ],
    itemCount: 2,
    subtotal: 850000,
    discount: 50000,
    vat: 64000,
    total: 864000,
    totalAmount: 864000,
    payLines: [{ method: 'Thẻ', amount: 864000 }],
    change: 0,
    changeAmount: 0,
  },
  {
    id: 'POS-20240508-003',
    invoiceCode: 'POS-20240508-003',
    date: '2024-05-08 16:45',
    createdAt: '2024-05-08T16:45:00',
    customer: 'Dai ly Tuan Kiet',
    customerName: 'Dai ly Tuan Kiet',
    cashier: 'Nguyen Van A',
    items: [
      { productName: 'Thép hộp 40x80', quantity: 20, unitPrice: 350000, price: 350000 },
      { productName: 'Tôn lợp mái', quantity: 30, unitPrice: 180000, price: 180000 },
    ],
    itemCount: 2,
    subtotal: 12500000,
    discount: 500000,
    vat: 960000,
    total: 12960000,
    totalAmount: 12960000,
    payLines: [
      { method: 'Tiền mặt', amount: 8000000 },
      { method: 'Chuyển khoản', amount: 4960000 },
    ],
    change: 0,
    changeAmount: 0,
  },
  {
    id: 'POS-20240507-004',
    invoiceCode: 'POS-20240507-004',
    date: '2024-05-07 09:15',
    createdAt: '2024-05-07T09:15:00',
    customer: 'Nha thau Quang Vinh',
    customerName: 'Nha thau Quang Vinh',
    cashier: 'Tran Thi B',
    items: [
      { productName: 'Sắt phi 12', quantity: 100, unitPrice: 42000, price: 42000 },
      { productName: 'Sắt phi 16', quantity: 50, unitPrice: 65000, price: 65000 },
    ],
    itemCount: 2,
    subtotal: 5600000,
    discount: 0,
    vat: 448000,
    total: 6048000,
    totalAmount: 6048000,
    payLines: [{ method: 'Chuyển khoản', amount: 6048000 }],
    change: 0,
    changeAmount: 0,
  },
  {
    id: 'POS-20240507-005',
    invoiceCode: 'POS-20240507-005',
    date: '2024-05-07 11:30',
    createdAt: '2024-05-07T11:30:00',
    customer: 'Khách lẻ',
    customerName: 'Khách lẻ',
    cashier: 'Tran Thi B',
    items: [{ productName: 'Máy cắt cầm tay', quantity: 1, unitPrice: 1550000, price: 1550000 }],
    itemCount: 1,
    subtotal: 1550000,
    discount: 0,
    vat: 124000,
    total: 1674000,
    totalAmount: 1674000,
    payLines: [{ method: 'Tiền mặt', amount: 1700000 }],
    change: 26000,
    changeAmount: 26000,
  },
  {
    id: 'POS-20240507-006',
    invoiceCode: 'POS-20240507-006',
    date: '2024-05-07 14:00',
    createdAt: '2024-05-07T14:00:00',
    customer: 'Anh Nguyen Van Hung',
    customerName: 'Anh Nguyen Van Hung',
    cashier: 'Tran Thi B',
    items: [
      { productName: 'Keo dán sắt', quantity: 10, unitPrice: 45000, price: 45000 },
      { productName: 'Băng keo chống thấm', quantity: 5, unitPrice: 120000, price: 120000 },
      { productName: 'Vít bắn tôn', quantity: 200, unitPrice: 3000, price: 3000 },
    ],
    itemCount: 3,
    subtotal: 2100000,
    discount: 0,
    vat: 168000,
    total: 2268000,
    totalAmount: 2268000,
    payLines: [{ method: 'Thẻ', amount: 2268000 }],
    change: 0,
    changeAmount: 0,
  },
  {
    id: 'POS-20240506-007',
    invoiceCode: 'POS-20240506-007',
    date: '2024-05-06 08:30',
    createdAt: '2024-05-06T08:30:00',
    customer: 'Cua hang VLXD Tuan Kiet',
    customerName: 'Cua hang VLXD Tuan Kiet',
    cashier: 'Le Van C',
    items: [
      { productName: 'Xi măng PCB40', quantity: 50, unitPrice: 85000, price: 85000 },
      { productName: 'Cát vàng', quantity: 5, unitPrice: 350000, price: 350000 },
    ],
    itemCount: 2,
    subtotal: 18500000,
    discount: 925000,
    vat: 1406000,
    total: 18981000,
    totalAmount: 18981000,
    payLines: [
      { method: 'Tiền mặt', amount: 10000000 },
      { method: 'Chuyển khoản', amount: 8981000 },
    ],
    change: 0,
    changeAmount: 0,
  },
  {
    id: 'POS-20240506-008',
    invoiceCode: 'POS-20240506-008',
    date: '2024-05-06 10:15',
    createdAt: '2024-05-06T10:15:00',
    customer: 'Khách lẻ',
    customerName: 'Khách lẻ',
    cashier: 'Le Van C',
    items: [
      { productName: 'Găng tay bảo hộ', quantity: 10, unitPrice: 35000, price: 35000 },
      { productName: 'Khẩu trang công nghiệp', quantity: 20, unitPrice: 10000, price: 10000 },
    ],
    itemCount: 2,
    subtotal: 550000,
    discount: 0,
    vat: 44000,
    total: 594000,
    totalAmount: 594000,
    payLines: [{ method: 'Tiền mặt', amount: 600000 }],
    change: 6000,
    changeAmount: 6000,
  },
];

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
const translatePayment = (method) => PAYMENT_LABELS[method] || method || '-';

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
      // Fallback: vẫn hiển thị mock để UI không trống
      setOrders(MOCK_ORDERS);
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

  const handlePrintOrder = (order) => {
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
    const totalPaid =
      payLines.length > 0
        ? payLines.reduce((s, pl) => s + pl.amount, 0)
        : order.totalAmount || order.total || 0;

    const payLinesHtml =
      payLines.length > 0
        ? payLines
            .map(
              (pl) =>
                `<tr><td>${translatePayment(pl.method)}</td><td class="r">${formatCurrency(pl.amount)}</td></tr>`
            )
            .join('')
        : `<tr><td>${translatePayment(order.paymentMethod)}</td><td class="r">${formatCurrency(totalPaid)}</td></tr>`;

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
	    <tr>
	      <td class="name">${item.productName || item.name || 'SP'}</td>
	      <td class="r">${item.quantity || 0}${item.displayUnit || item.selectedUnit || ''} x ${formatCurrency(item.unitPrice || item.price || 0)}</td>
	      <td class="r">${formatCurrency((item.unitPrice || item.price || 0) * (item.quantity || 0))}</td>
	    </tr>`
      )
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
	<html>
	<head><meta charset="utf-8"><title>In hóa đơn ${order.id}</title>
	<style>
	  @page { size: 80mm auto; margin: 0; }
	  *{margin:0;padding:0;box-sizing:border-box}
	  body{
	    font-family:'Consolas','Courier New',monospace;
	    font-size:14px;
	    color:#000;
	    background:#fff;
	    max-width:320px;
	    margin:0 auto;
	    padding:14px 10px;
	    line-height:1.35;
	  }
	  .c{text-align:center}
	  .r{text-align:right;white-space:nowrap}
	  .name{word-wrap:break-word}
	  h2{font-size:18px;font-weight:700;margin-bottom:2px}
	  .sub{font-size:12px;color:#333;margin-bottom:1px}
	  hr{border:none;border-top:1px dashed #000;margin:8px 0}
	  hr.d{border-top:1px dotted #888}
	  table{width:100%;border-collapse:collapse}
	  td{padding:2px 0;font-size:14px;vertical-align:top}
	  th{font-size:11px;color:#666;text-transform:uppercase;padding:1px 0 4px;font-weight:600}
	  .bold{font-weight:700}
	  .lg{font-size:17px}
	  .thanks{font-size:14px;font-weight:700;margin-top:6px}
	  @media print{
	    body{max-width:100%;width:100%;padding:12px 16px;font-size:12px}
	    td{font-size:12px}
	    h2{font-size:16px}
	    .lg{font-size:15px}
	    .sub{font-size:11px}
	    .thanks{font-size:12px}
	    th{font-size:10px}
	  }
	</style></head>
	<body>
	<div class="c">
	  <h2>MEP SYSTEM</h2>
	  <p class="sub">12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM</p>
	  <p class="sub">ĐT: 028.3999.8888 &bull; MST: 0312345678</p>
	</div>
	<hr>
	<div class="c">
	  <p class="bold lg">HÓA ĐƠN BÁN HÀNG</p>
	  <p style="font-size:13px;color:#555">Mã: ${order.id}</p>
	  <p style="font-size:13px;color:#555">${formatDateTimeVN(order.date || order.createdAt)}</p>
	</div>
	<hr>
	<table>
	  <tr><td>Thu ngân</td><td class="r">${order.cashier || order.userName || '-'}</td></tr>
	</table>
	<hr>
	${
    itemsHtml
      ? `
	<table>
	  <thead><tr><th style="text-align:left">Mặt hàng</th><th style="text-align:right">SL x Giá</th><th style="text-align:right">T.Tiền</th></tr></thead>
	  ${itemsHtml}
	</table>
	<hr>
	`
      : ''
  }
	<table>
	  <tr><td>Tạm tính</td><td class="r">${formatCurrency(order.subtotal)}</td></tr>
	  ${order.discount > 0 ? `<tr><td style="color:#c62828;">Giảm giá</td><td class="r" style="color:#c62828;">-${formatCurrency(order.discount)}</td></tr>` : ''}
	  <tr class="bold lg"><td>TỔNG CỘNG</td><td class="r">${formatCurrency(order.total)}</td></tr>
	</table>
	<hr>
	<table>
	  <tr><td>Khách hàng</td><td class="r">${order.customer}</td></tr>
	  ${payLinesHtml}
	  <tr class="bold"><td>Đã thanh toán</td><td class="r">${formatCurrency(totalPaid)}</td></tr>
	  ${order.change > 0 ? `<tr><td style="color:#e65100;">Tiền thừa</td><td class="r" style="color:#e65100;">${formatCurrency(order.change)}</td></tr>` : ''}
	</table>
	<hr class="d">
	<div class="c">
	  <p class="thanks">Cảm ơn quý khách!</p>
	  <p style="font-size:13px;color:#666">Hẹn gặp lại &#9728;</p>
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
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(d); // en-CA trả về "YYYY-MM-DD"
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
  const exchangeByInvoice = {};
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
      exchangeByInvoice[key] = true;
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
        const exchanged = exchangeByInvoice[code];
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold text-[#004785]">{code}</span>
            <div className="flex flex-wrap gap-1">
              {refunded > 0 && (
                <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  🔄 Hoàn {formatCurrency(refunded)}
                </span>
              )}
              {exchanged && (
                <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                  🔄 Đổi hàng
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
        <span className="text-xs font-medium text-slate-900">
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
      header: '',
      width: '70px',
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
          <h1 className="text-2xl font-extrabold text-slate-900">Đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem lại các đơn đã bán và đơn nháp chưa thanh toán
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{todayCount}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Đơn hôm nay
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">
                {formatCurrency(todayRevenue)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Doanh thu hôm nay
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-purple-600">
                {todayCount > 0 ? formatCurrency(todayRevenue / todayCount) : formatCurrency(0)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Bình quân/đơn
              </p>
            </div>
          </Card>
        </div>

        {drafts.length > 0 && (
          <Card header={`Đơn nháp (${drafts.length})`} padding="p-0">
            <div className="divide-y divide-slate-100">
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
                        <p className="text-sm font-semibold text-slate-900">
                          {d.customer ? d.customer.name : 'Khách lẻ'}
                        </p>
                        <p className="text-xs text-slate-400">
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
                        onClick={() => setDrafts((prev) => prev.filter((x) => x.id !== d.id))}
                        className="rounded p-1 text-slate-400 hover:text-red-500"
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
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <strong>Lưu ý:</strong> {fetchError}. Đang hiển thị dữ liệu mẫu.
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
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTimeFilter(f.id)}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${timeFilter === f.id ? 'bg-[#004785] text-white' : 'text-slate-500 hover:text-slate-900'}`}
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
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary"
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
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700">
                  Trang {currentPage} / {totalPages || 1}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
                  <p className="text-xs text-slate-400">{formatDateTimeVN(selected.date)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100"
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

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Khách hàng</span>
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
                          <p className="text-xs text-slate-400">
                            {formatCurrency(item.unitPrice || item.price || 0)} x{' '}
                            {item.quantity || 0}
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
                          <span className="shrink-0 text-slate-500">x {item.quantity || 0}</span>
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
                <p className="text-sm text-slate-400">Không có chi tiết sản phẩm</p>
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
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
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
              <div className="space-y-1 border-t border-slate-200 pt-2">
                <div className="flex justify-between text-xs text-slate-500">
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
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-[#004785]">
                  <span>Tổng</span>
                  <span>{formatCurrency(selected.totalAmount ?? selected.total ?? 0)}</span>
                </div>
              </div>
              {selected.changeAmount > 0 && (
                <div className="flex justify-between rounded-lg bg-green-50 p-2 text-sm">
                  <span className="text-green-700">Tiền thừa</span>
                  <span className="font-bold text-green-700">
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
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 xl:flex">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">📋</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một đơn hàng</p>
            <p className="text-xs text-slate-300">để xem chi tiết</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
