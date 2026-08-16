/**
 * ShiftManagement Page - Quản lý ca bán hàng
 * API: /pos/shifts - GET list, POST start, GET summary, POST end
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import Icon from '../../../shared/components/Icon';
import {
  startShift,
  endShift,
  getShifts,
  getShiftSummary,
  getOrders,
  getInvoice,
  getReturns,
} from '../services/posService';

// Format date thành YYYY-MM-DD theo giờ địa phương
const toLocalDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Phân loại phiếu đổi trả:
//  - Trả (REFUND)                       -> hoàn tiền
//  - Đổi chênh (EXCHANGE có tiền lệch) -> khách trả thêm(+) / hoàn lại(-)
//  - Bảo hành (EXCHANGE ngang giá)     -> không đổi tiền
// Trả về nhãn, màu badge, và số tiền CÓ DẤU (+: khách đưa thêm, -: hoàn lại khách).
const classifyReturn = (r) => {
  const rType = String(r?.returnType || r?.return_type || '').toUpperCase();
  const num = (v) => parseFloat(v ?? 0) || 0;
  const delta = num(r?.deltaAmount ?? r?.delta_amount);
  const pay = num(r?.payAmount ?? r?.pay_amount);
  const refundCust = num(r?.refundAmountCustomer ?? r?.refund_amount_customer);
  const isRefund = rType === 'REFUND';
  const isExchangeDiff = !isRefund && (delta !== 0 || pay > 0 || refundCust > 0);
  const label = isRefund ? 'Trả' : isExchangeDiff ? 'Đổi chênh' : 'Đổi hàng';
  const badge = isRefund
    ? 'bg-red-100 text-red-700'
    : isExchangeDiff
      ? 'bg-amber-100 text-amber-700'
      : 'bg-yellow-100 text-yellow-800';
  let signed = 0;
  if (isRefund) signed = -Math.abs(num(r?.refundAmount ?? r?.refund_amount ?? r?.amount));
  else if (isExchangeDiff) signed = delta; // + khách trả thêm, - hoàn lại, 0 = ngang giá
  return { isRefund, isExchangeDiff, label, badge, signed };
};

// Lưu/lấy tên thu ngân theo shiftId (dùng khi API không trả về userName)
const SHIFT_CASHIER_KEY = 'pos_shift_cashiers';
const getSavedCashiers = () => {
  try {
    return JSON.parse(localStorage.getItem(SHIFT_CASHIER_KEY) || '{}');
  } catch {
    return {};
  }
};
const saveCashier = (shiftId, name) => {
  const map = getSavedCashiers();
  map[shiftId] = name;
  localStorage.setItem(SHIFT_CASHIER_KEY, JSON.stringify(map));
};

// Map API shift sang format local
const mapShift = (s) => {
  const startedAt = s.startedAt || s.startTime || s.createdAt || '';
  const endedAt = s.endedAt || s.endTime || '';
  const startDate = startedAt ? new Date(startedAt) : null;
  // Ghi đè userName từ localStorage nếu API không trả về
  const shiftId = s.shiftId || s.id;
  const saved = getSavedCashiers();
  const cashierName = s.userName || s.openedByUserName || s.cashier || saved[shiftId] || 'Thu ngân';
  return {
    id: shiftId,
    date: startDate ? toLocalDateStr(startDate) : '-',
    dateLabel: startDate ? startDate.toLocaleDateString('vi-VN') : '-',
    cashier: cashierName,
    startTime: startDate
      ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '-',
    startedAt: startedAt,
    endTime: endedAt
      ? new Date(endedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : 'Đang mở',
    endedAt: endedAt,
    openingBalance: parseFloat(s.openingBalance || 0),
    closingBalance: parseFloat(s.actualCash || s.closingBalance || 0),
    actualCashCount: parseFloat(s.actualCash || 0),
    cashVariance: parseFloat(s.variance || s.cashVariance || 0),
    totalSales: parseFloat(s.totalRevenue || s.totalSales || s.revenue || 0),
    cashSales: parseFloat(s.totalCash || s.cashSales || 0),
    cardSales: parseFloat(s.totalCard || s.cardSales || 0),
    transferSales: parseFloat(s.totalTransfer || s.transferSales || 0),
    orderCount: parseInt(s.totalOrders || s.orderCount || 0, 10),
    status: s.status === 'OPEN' ? 'open' : s.status === 'CLOSED' ? 'closed' : s.status || 'open',
    note: s.note || '',
    // Cash Session model fields
    userId: s.userId || s.openedByUserId || '',
    openedByUserName: s.openedByUserName || s.userName || '',
    closedByUserId: s.closedByUserId || '',
    closedByUserName: s.closedByUserName || (s.status === 'CLOSED' ? (s.openedByUserName || s.userName || '') : ''),
    forceCloseReason: s.forceCloseReason || '',
    paymentBreakdown: s.paymentBreakdown || [],
    salesByUser: s.salesByUser || [],
    shiftData: s,
  };
};

// ─── Lý do chênh lệch tiền mặt khi chốt ca ──────────────────────────────────
// Chỉ dùng khi Tiền mặt thực tế ≠ Số dư cuối dự kiến.
// THỪA (thực tế > dự kiến): tiền quỹ nhiều hơn hệ thống tính.
const CASH_SURPLUS_REASONS = [
  'Khách không lấy lại tiền thừa',
  'Quên tạo đơn / Quên bấm thanh toán trên phần mềm',
  'Thu tiền đơn nợ/đơn cũ chưa cập nhật hệ thống',
];
// THIẾU (thực tế < dự kiến): tiền quỹ ít hơn hệ thống tính.
const CASH_SHORTAGE_REASONS = [
  'Trả thừa tiền cho khách (thối sai)',
  'Nhầm mệnh giá / thiếu tiền lẻ',
  'Quên bấm thanh toán, đơn chưa ghi nhận (doanh thu ảo)',
  'Tiền bị mất / thất thoát',
];

export const ShiftManagement = () => {
  const { user } = useAuth();
  const staffName = user?.fullName || user?.name || user?.email || 'Thu ngân';
  const currentUserId = user?.id || user?.userId || user?.sub || '';

  // Permission checks cho Cash Session model
  const canCreateShift = hasPermission(user, 'SHIFT_CREATE');
  const canEndShift = hasPermission(user, 'SHIFT_UPDATE');
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ca đang mở
  const openShift = useMemo(() => shifts.find((s) => s.status === 'open'), [shifts]);
  const isShiftActive = !!openShift;

  // Derived: current user is the one who opened this Cash Session
  const isCurrentUserOpener = openShift?.userId === currentUserId;

  // Summary + orders của ca đang mở
  const [shiftSummary, setShiftSummary] = useState(null);
  const [shiftOrders, setShiftOrders] = useState([]);
  const [shiftReturns, setShiftReturns] = useState([]); // hoàn trả trong ca
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedShiftOrders, setSelectedShiftOrders] = useState([]);
  const [selectedShiftReturns, setSelectedShiftReturns] = useState([]);
  const [detailOrdersLoading, setDetailOrdersLoading] = useState(false);
  const [expandedSalesUser, setExpandedSalesUser] = useState(null); // user được chọn để xem chi tiết đơn
  const [dateFilter, setDateFilter] = useState(() => toLocalDateStr(new Date()));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, pageSize]);

  const [startForm, setStartForm] = useState({ openingBalance: '1000000' });
  const [endForm, setEndForm] = useState({ actualCashCount: '', note: '', diffReason: '', forceClose: false, forceCloseReason: '' });

  // Load shifts từ API (có phân trang server-side)
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, pageSize };
      if (dateFilter) {
        // Calculate UTC ISO strings for the start and end of the chosen local date
        const localStart = new Date(`${dateFilter}T00:00:00`);
        const localEnd = new Date(`${dateFilter}T23:59:59.999`);
        params.from = localStart.toISOString();
        params.to = localEnd.toISOString();
      }
      console.log('[ShiftManagement] Fetching shifts with params:', params);
      const data = await getShifts(params);
      console.log('[ShiftManagement] getShifts response:', data);
      const rawItems = Array.isArray(data) ? data : data?.items || data?.data || [];
      const items = Array.isArray(rawItems) ? rawItems : [];

      // Luôn fetch ca đang mở (không phụ thuộc date filter)
      let openShiftData = null;
      try {
        const openRes = await getShifts({ status: 'OPEN' });
        const openItems = Array.isArray(openRes) ? openRes : openRes?.items || openRes?.data || [];
        if (Array.isArray(openItems) && openItems.length > 0) {
          openShiftData = openItems[0];
        }
      } catch (_) {
        console.warn('[ShiftManagement] Failed to fetch open shift');
      }
      const serverTotal = data?.totalCount ?? data?.total ?? items.length;
      setTotalCount(serverTotal);
      console.log('[ShiftManagement] shifts items:', items.length, 'total:', serverTotal);

      // Gộp ca đang mở (fetch riêng không date filter) vào danh sách nếu chưa có
      if (openShiftData) {
        const openId = openShiftData.shiftId || openShiftData.id;
        const existsInList = items.some((s) => (s.shiftId || s.id) === openId);
        if (!existsInList) {
          items.unshift(openShiftData);
        }
      }

      if (items.length > 0) {
        const mapped = items.map(mapShift);
        console.log('[ShiftManagement] mapped shifts:', mapped);
        setShifts(mapped);

        // Kiểm tra có ca OPEN không
        const open = mapped.find((s) => s.status === 'open');
        console.log('[ShiftManagement] open shift found:', open ? open.id : 'none');
        if (open) {
          // Merge với localStorage để giữ orderCount/totalSales đã tích lũy (tránh mất khi F5)
          const existing = (() => {
            try {
              return JSON.parse(localStorage.getItem('pos_active_shift'));
            } catch {
              return null;
            }
          })();
          const merged = {
            ...open,
            orderCount: Math.max(open.orderCount || 0, existing?.orderCount || 0),
            totalSales: Math.max(open.totalSales || 0, existing?.totalSales || 0),
            totalRevenue: Math.max(open.totalRevenue || 0, existing?.totalRevenue || 0),
            cashSales: Math.max(open.cashSales || 0, existing?.cashSales || 0),
            transferSales: Math.max(open.transferSales || 0, existing?.transferSales || 0),
          };
          localStorage.setItem('pos_active_shift', JSON.stringify(merged));
        } else {
          localStorage.removeItem('pos_active_shift');
        }
      } else {
        console.log('[ShiftManagement] API trả về rỗng');
        setShifts([]);
        localStorage.removeItem('pos_active_shift');
      }
    } catch (err) {
      console.error('Lỗi load shifts:', err);
      setError(err.message);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, dateFilter]);

  // Load shift summary và orders khi có ca đang mở
  const fetchShiftSummary = useCallback(async () => {
    if (!openShift) {
      console.log('[ShiftManagement] No open shift, clearing summary');
      setShiftSummary(null);
      setShiftOrders([]);
      return;
    }
    console.log(
      '[ShiftManagement] Fetching summary for shift:',
      openShift.id,
      'startedAt:',
      openShift.startedAt
    );
    setOrdersLoading(true);
    try {
      // Ưu tiên lấy summary từ API shift summary
      let summaryData = openShift;
      try {
        console.log('[ShiftManagement] Calling getShiftSummary for id:', openShift.id);
        const serverSummary = await getShiftSummary(openShift.id);
        console.log('[ShiftManagement] getShiftSummary response:', serverSummary);
        if (serverSummary) {
          const summaryDataRaw = serverSummary?.data || serverSummary;
          summaryData = { ...openShift, ...mapShift(summaryDataRaw) };
        }
      } catch (_) {
        console.warn('[ShiftManagement] getShiftSummary failed, fallback to order-based calc');
      }

      // Load orders và returns song song
      console.log('[ShiftManagement] Fetching completed orders and returns...');
      const shiftStartISO = new Date(openShift.startedAt).toISOString();
      const [ordersData, returnsRaw] = await Promise.all([
        getOrders({ status: 'Completed', dateFrom: shiftStartISO, pageSize: 1000 }).catch(() => []),
        getReturns({ dateFrom: shiftStartISO, pageSize: 1000 }).catch(() => []),
      ]);
      console.log('[ShiftManagement] getOrders response:', ordersData);
      const rawOrders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.items || ordersData?.data || [];
      console.log('[ShiftManagement] raw orders count:', rawOrders.length);

      // Lưu returns để tính net revenue
      const allReturns = Array.isArray(returnsRaw)
        ? returnsRaw
        : (returnsRaw?.items ?? returnsRaw?.data ?? []);
      setShiftReturns(allReturns);

      // Map orders với field linh hoạt
      const orders = rawOrders.map((o) => ({
        id: o.invoiceCode || o.invoiceId || o.id || '',
        invoiceCode: o.invoiceCode || o.id || '',
        invoiceId: o.invoiceId || o.id || o.invoiceCode || '',
        createdAt: o.createdAt || o.date || o.invoiceDate || '',
        customerName: o.customerName || o.customer || 'Khách lẻ',
        totalAmount: parseFloat(o.totalAmount || o.total || o.grandTotal || 0),
        discountAmount: parseFloat(o.discountAmount || o.discountAmount || o.DiscountAmount || 0),
        discountPercent: parseFloat(
          o.discountPercent || o.discountPercent || o.DiscountPercent || 0
        ),
        paymentMethod: o.paymentMethod || '',
        cashReceived: o.cashReceived,
        changeAmount: o.changeAmount,
        cashier: o.userName || o.cashier || o.createdBy || openShift.cashier,
        items: o.items || [],
        itemCount: o.items?.length || o.itemCount || 0,
      }));

      // Lọc orders từ lúc mở ca (xử lý linh hoạt định dạng ngày)
      // Backend lưu UTC, convert về UTC timestamp để so sánh chính xác
      const startDateUTC = new Date(openShift.startedAt).getTime();
      console.log(
        '[ShiftManagement] startDate (UTC ms):',
        startDateUTC,
        'raw:',
        openShift.startedAt
      );
      const filteredOrders = orders.filter((o) => {
        if (!o.createdAt) {
          console.warn('[ShiftManagement] order missing createdAt:', o.invoiceCode);
          return false;
        }
        // Parse order date và convert về UTC timestamp để so sánh
        const orderDateUTC = new Date(o.createdAt).getTime();
        if (isNaN(orderDateUTC)) {
          console.warn(
            '[ShiftManagement] unparseable date, keeping order:',
            o.invoiceCode,
            o.createdAt
          );
          return true;
        }
        // So sánh UTC timestamps (không bị ảnh hưởng bởi timezone của browser)
        const keep = orderDateUTC >= startDateUTC;
        if (!keep)
          console.log(
            '[ShiftManagement] order before shift:',
            o.invoiceCode,
            o.createdAt,
            'orderUTC:',
            orderDateUTC,
            'shiftUTC:',
            startDateUTC
          );
        return keep;
      });
      // Sap xep moi nhat len dau
      filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      console.log('[ShiftManagement] filtered orders count:', filteredOrders.length);
      if (filteredOrders.length > 0) {
        console.log('[ShiftManagement] first order:', filteredOrders[0]);
      }

      // Chỉ tính REFUND cho những đơn thuộc ca này (invoiceCode có trong filteredOrders)
      const shiftInvoiceCodes = new Set(
        filteredOrders.map((o) => (o.invoiceCode || '').toLowerCase()).filter(Boolean)
      );
      const shiftStartUTCForReturns = new Date(openShift.startedAt).getTime();
      const shiftValidReturns = allReturns.filter((r) => {
        const rStatus = String(r.status || '').toUpperCase();
        const rType = String(r.returnType || r.return_type || '').toUpperCase();
        const rDate = new Date(r.createdAt || r.created_at || 0).getTime();
        const rInvoice = (r.invoiceCode || '').toLowerCase();
        return (
          rStatus !== 'CANCELLED' &&
          rType === 'REFUND' &&
          rDate >= shiftStartUTCForReturns &&
          shiftInvoiceCodes.has(rInvoice)
        );
      });

      const shiftRefundTotal = shiftValidReturns.reduce(
        (sum, r) => sum + parseFloat(r.refundAmount || r.refund_amount || 0),
        0
      );

      // Đổi hàng chênh lệch trong ca (returnType=EXCHANGE có Delta > 0):
      // tiền mặt/CK/đół cộng vào ca. Lọc theo thời gian ca (khác bảo hành — luồng riêng).
      const shiftExchanges = allReturns.filter((r) => {
        const rStatus = String(r.status || '').toUpperCase();
        const rType = String(r.returnType || r.return_type || '').toUpperCase();
        const rDate = new Date(r.createdAt || r.created_at || 0).getTime();
        const pay = parseFloat(r.payAmount ?? 0) || 0;
        const delta = parseFloat(r.deltaAmount ?? 0) || 0;
        return (
          rStatus !== 'CANCELLED' &&
          rType === 'EXCHANGE' &&
          rDate >= shiftStartUTCForReturns &&
          (delta !== 0 || pay > 0)
        );
      });
      const exchDeltaTotal = shiftExchanges.reduce((sum, r) => sum + (parseFloat(r.deltaAmount ?? 0) || 0), 0);
      const exchPayCash = shiftExchanges
        .filter((r) => String(r.paymentMethod || '').toUpperCase() === 'CASH')
        .reduce((sum, r) => sum + (parseFloat(r.payAmount ?? 0) || 0), 0);
      const exchPayTransfer = shiftExchanges
        .filter((r) => String(r.paymentMethod || '').toUpperCase() === 'TRANSFER')
        .reduce((sum, r) => sum + (parseFloat(r.payAmount ?? 0) || 0), 0);

      // Tính stats từ orders — net revenue = gross - hoàn trả (REFUND) trong ca
      const grossRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      let totalDiscount = filteredOrders.reduce(
        (sum, o) => sum + (o.discountAmount || o.discount || 0),
        0
      );

      // Trừ đi phần discount của các đơn đã hoàn trả
      let refundedDiscountTotal = 0;
      shiftValidReturns.forEach((r) => {
        const rInvoice = (r.invoiceCode || '').toLowerCase();
        const originalOrder = filteredOrders.find(
          (o) => (o.invoiceCode || '').toLowerCase() === rInvoice
        );
        if (originalOrder) {
          const discount = originalOrder.discountAmount || originalOrder.discount || 0;
          const rAmount = parseFloat(r.refundAmount || r.refund_amount || 0);
          if (discount > 0 && originalOrder.totalAmount > 0) {
            // Nếu hoàn đủ tiền >= totalAmount thì trừ full discount, nếu không thì trừ theo tỷ lệ
            if (rAmount >= originalOrder.totalAmount) {
              refundedDiscountTotal += discount;
            } else {
              refundedDiscountTotal += (rAmount / originalOrder.totalAmount) * discount;
            }
          }
        }
      });
      totalDiscount = Math.max(0, totalDiscount - refundedDiscountTotal);
      const totalRevenue = grossRevenue - shiftRefundTotal;
      const orderCount = filteredOrders.length;
      const getAmountByMethod = (order, methodKeywords) => {
        if (!order.paymentMethod) return 0;
        let pm = order.paymentMethod;
        try {
          if (pm.startsWith('[')) {
            const arr = JSON.parse(pm);
            if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object') {
              return arr
                .filter(item => methodKeywords.some(kw => item.method?.toLowerCase() === kw.toLowerCase()))
                .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            }
          }
        } catch {}

        const isMatch = methodKeywords.some(kw => pm.toLowerCase() === kw.toLowerCase());
        return isMatch ? order.totalAmount : 0;
      };

      const cashSales = filteredOrders.reduce((sum, o) => sum + getAmountByMethod(o, ['cash', 'tiền mặt']), 0);
      const cardSales = filteredOrders.reduce((sum, o) => sum + getAmountByMethod(o, ['card', 'thẻ']), 0);
      const transferSales = filteredOrders.reduce((sum, o) => sum + getAmountByMethod(o, ['transfer', 'chuyển khoản']), 0);

      // Tính hoàn trả theo phương thức (cùng thời gian ca)
      const cashRefunds = allReturns
        .filter((r) => {
          const s = String(r.status || '').toUpperCase();
          const t = String(r.returnType || r.return_type || '').toUpperCase();
          const d = new Date(r.createdAt || r.created_at || 0).getTime();
          const rInvoice = (r.invoiceCode || '').toLowerCase();
          return (
            s !== 'CANCELLED' &&
            t === 'REFUND' &&
            d >= shiftStartUTCForReturns &&
            (r.refundMethod || r.method || '').toUpperCase() === 'CASH' &&
            shiftInvoiceCodes.has(rInvoice)
          );
        })
        .reduce((sum, r) => sum + parseFloat(r.refundAmount || r.refund_amount || 0), 0);

      setShiftSummary({
        ...summaryData,
        totalRevenue: totalRevenue + exchDeltaTotal,
        totalSales: totalRevenue + exchDeltaTotal,
        totalDiscount,
        orderCount,
        cashSales: (cashSales - cashRefunds) + exchPayCash, // trừ tiền mặt đã hoàn + cộng tiền chênh mặt
        cashSalesGross: cashSales + exchPayCash, // giữ lại để tính số dư cuối dự kiến
        cardSales,
        transferSales: transferSales + exchPayTransfer, // cộng tiền chênh chuyển khoản
        cashRefunds,
      });
      setShiftOrders(filteredOrders);
      // Backfill tong tien ngay trong fetchShiftSummary
      if (filteredOrders.length > 0) {
        const needFetch = filteredOrders.filter(
          (o) => !o.totalAmount && (o.invoiceId || o.invoiceCode)
        );
        if (needFetch.length > 0) {
          Promise.allSettled(
            needFetch.map((o) => {
              const id = o.invoiceId || o.invoiceCode;
              return id ? getInvoice(id) : Promise.reject('no id');
            })
          ).then((results) => {
            const updates = [];
            results.forEach((result, idx) => {
              if (result.status === 'fulfilled' && result.value) {
                const d = result.value;
                const amt = parseFloat(d.totalAmount || d.total || d.grandTotal || 0);
                const pm = d.paymentMethod || needFetch[idx].paymentMethod;
                updates.push({
                  code: needFetch[idx].invoiceCode,
                  totalAmount: amt,
                  paymentMethod: pm,
                  cashReceived: d.cashReceived,
                  changeAmount: d.changeAmount,
                });
              }
            });
            if (!updates.length) return;
            setShiftOrders((prev) =>
              prev.map((o) => {
                const u = updates.find((x) => x.code === o.invoiceCode);
                return u ? { ...o, totalAmount: u.totalAmount, paymentMethod: u.paymentMethod, cashReceived: u.cashReceived, changeAmount: u.changeAmount } : o;
              })
            );
            setShiftSummary((prev) => {
              if (!prev) return prev;
              let extraTotal = 0,
                extraCash = 0,
                extraCard = 0,
                extraTransfer = 0;
              updates.forEach((u) => {
                extraTotal += u.totalAmount;
                if (['Cash', 'CASH', 'Tiền mặt'].includes(u.paymentMethod))
                  extraCash += u.totalAmount;
                else if (['Card', 'CARD', 'Thẻ'].includes(u.paymentMethod))
                  extraCard += u.totalAmount;
                else if (['Transfer', 'TRANSFER', 'Chuyển khoản'].includes(u.paymentMethod))
                  extraTransfer += u.totalAmount;
              });
              return {
                ...prev,
                totalSales: (prev.totalSales || 0) + extraTotal,
                totalRevenue: (prev.totalRevenue || 0) + extraTotal,
                cashSales: (prev.cashSales || 0) + extraCash,
                cardSales: (prev.cardSales || 0) + extraCard,
                transferSales: (prev.transferSales || 0) + extraTransfer,
              };
            });
          });
        }
      }
    } catch (err) {
      console.error('Lỗi load shift orders:', err);
      setShiftSummary(openShift);
      setShiftOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [openShift]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Tu dong refresh khi quay lai trang
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible') fetchShifts();
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [fetchShifts]);

  // Lắng nghe sự kiện shift-state-changed từ SignalR (PosLayout)
  // Khi Owner/Manager chốt ca từ xa → tự động refresh danh sách
  useEffect(() => {
    const handleShiftStateChanged = () => {
      fetchShifts();
    };
    window.addEventListener('shift-state-changed', handleShiftStateChanged);
    return () => window.removeEventListener('shift-state-changed', handleShiftStateChanged);
  }, [fetchShifts]);

  useEffect(() => {
    if (openShift) {
      fetchShiftSummary();
      // Poll mỗi 10s để cập nhật realtime
      const interval = setInterval(() => {
        try {
          const ss = JSON.parse(localStorage.getItem('pos_active_shift') || 'null');
          if (ss && (ss.orderCount > 0 || ss.totalSales > 0)) {
            setShiftSummary((prev) =>
              prev ? { ...prev, orderCount: ss.orderCount, totalSales: ss.totalSales } : prev
            );
          }
        } catch (_) {}
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setShiftSummary(null);
    }
  }, [openShift, fetchShiftSummary]);

  // Lấy ca hiển thị (summary nếu đang mở, hoặc shift từ list)
  const displayShift = shiftSummary || openShift;

  // ---- Handlers ----
  const handleOpenStartModal = () => {
    setStartForm({ openingBalance: '1000000' });
    setShowStartModal(true);
  };

  const handleStartShift = async () => {
    if (!startForm.openingBalance) return;
    try {
      console.log('[ShiftManagement] Starting shift...');
      const raw = await startShift({
        openingBalance: parseFloat(startForm.openingBalance),
        userName: staffName,
      });
      console.log('[ShiftManagement] startShift raw:', raw);
      const result = raw?.data || raw;
      console.log('[ShiftManagement] startShift result:', result);
      const newShift = mapShift({ ...result, userName: staffName });
      console.log('[ShiftManagement] mapped new shift:', newShift);

      saveCashier(newShift.id, staffName);
      localStorage.setItem('pos_active_shift', JSON.stringify(newShift));

      setShifts((prev) => [newShift, ...prev]);
      setShiftSummary(newShift);
      setShowStartModal(false);
    } catch (err) {
      console.error('[ShiftManagement] Error starting shift:', err);
      // Nếu 409 - có ca đang mở, tự fetch ca đó về
      if (err?.status === 409 || (err?.message && err.message.includes('đang có ca bán hoạt động'))) {
        try {
          const openRes = await getShifts({ status: 'OPEN' });
          const openItems = Array.isArray(openRes) ? openRes : openRes?.items || openRes?.data || [];
          const openShiftData = Array.isArray(openItems) ? openItems[0] : null;
          if (openShiftData) {
            const existingOpen = mapShift(openShiftData);
            saveCashier(existingOpen.id, staffName);
            localStorage.setItem('pos_active_shift', JSON.stringify(existingOpen));
            setShiftSummary(existingOpen);
            setShifts((prev) => {
              if (prev.find((s) => s.id === existingOpen.id)) return prev;
              return [existingOpen, ...prev];
            });
            setShowStartModal(false);
            alert('Đã phát hiện ca bán đang mở. Bạn có thể tiếp tục bán hàng hoặc chốt ca.');
            return;
          }
        } catch (fetchErr) {
          console.error('[ShiftManagement] Error fetching open shift:', fetchErr);
        }
      }
      alert('Lỗi mở ca: ' + (err.message || 'Không xác định'));
    }
  };

  const handleOpenEndModal = () => {
    setEndForm({ actualCashCount: '', note: '', diffReason: '', forceClose: false, forceCloseReason: '' });
    setExpandedSalesUser(null);
    setShowEndModal(true);
  };

  const handleEndShift = async () => {
    if (!openShift) return;
    // Kiểm tra nếu tiền mặt lệch so với dự kiến: bắt buộc chọn lý do + nhập ghi chú chi tiết
    const expectedAmount =
      (openShift?.openingBalance || 0) + ((shiftSummary || openShift)?.cashSales || 0);
    const actualAmount = parseFloat(endForm.actualCashCount) || 0;
    const hasDiff = actualAmount !== expectedAmount;
    if (hasDiff) {
      // Validation: chênh lệch → PHẢI chọn lý do (dropdown) VÀ nhập ghi chú chi tiết
      if (!endForm.diffReason) {
        alert('Tiền mặt thực tế chênh lệch so với dự kiến. Vui lòng chọn "Lý do chênh lệch".');
        return;
      }
      if (!endForm.note.trim()) {
        alert('Vui lòng nhập ghi chú giải thích chi tiết lý do chênh lệch.');
        return;
      }
    }
    // Chốt hộ bắt buộc nhập lý do
    if (!isCurrentUserOpener && !endForm.forceCloseReason.trim()) {
      alert('Bạn đang chốt hộ. Vui lòng nhập lý do chốt hộ.');
      return;
    }
    try {
      // Backend tự xác định forceClose dựa trên userId gửi request vs userId mở ca
      const isNotOpener = !isCurrentUserOpener;
      console.log('[ShiftManagement] Ending shift:', openShift.id, 'khongPhaiNguoiMoCa:', isNotOpener);
      // Gộp lý do chênh lệch (dropdown) vào ghi chú gửi backend → không cần sửa backend
      const combinedNote = endForm.diffReason
        ? `[Lý do chênh lệch: ${endForm.diffReason}]${endForm.note.trim() ? ' — ' + endForm.note.trim() : ''}`
        : endForm.note;
      const result = await endShift(openShift.id, {
        actualCash: parseFloat(endForm.actualCashCount) || 0,
        note: combinedNote,
        forceClose: isNotOpener,
        forceCloseReason: isNotOpener ? (endForm.forceCloseReason || `Chốt hộ bởi ${staffName}`) : null,
        closedByUserName: staffName,
      });
      console.log('[ShiftManagement] endShift response:', result);
      const endResult = result?.data || result;
      // Kết hợp dữ liệu từ API + openShift (giữ startedAt, userName, số liệu từ shiftSummary)
      const updatedShift = mapShift({
        ...openShift,
        ...endResult,
        ...(shiftSummary
          ? {
              totalRevenue: shiftSummary.totalSales,
              totalOrders: shiftSummary.orderCount,
              cashSales: shiftSummary.cashSales,
              cardSales: shiftSummary.cardSales,
              transferSales: shiftSummary.transferSales,
            }
          : {}),
        startedAt:
          endResult.startedAt || endResult.startTime || endResult.createdAt || openShift.startedAt,
        userName: openShift.cashier,
        closedByUserName: endResult.closedByUserName || staffName,
      });
      setShifts((prev) => prev.map((s) => (s.id === openShift.id ? updatedShift : s)));
      setShiftSummary(null);
      setShowEndModal(false);

      // Cập nhật tên thu ngân trong localStorage
      saveCashier(openShift.id, openShift.cashier);

      // Xóa shift khỏi localStorage
      localStorage.removeItem('pos_active_shift');

      // Báo cho tất cả component (ShiftBadge, POSScreen...) biết ca đã chốt
      window.dispatchEvent(new CustomEvent('shift-state-changed', { detail: { type: 'closed' } }));
    } catch (err) {
      console.error('[ShiftManagement] Error ending shift:', err);
      alert('Lỗi chốt ca: ' + (err.message || 'Không xác định'));
    }
  };

  const handleViewDetail = async (shift) => {
    setSelectedShift(shift);
    setSelectedShiftOrders([]);
    setSelectedShiftReturns([]);
    setExpandedSalesUser(null);
    setShowDetailModal(true);
    setDetailOrdersLoading(true);

    // Fetch orders + returns trong khoảng thời gian của ca
    try {
      const shiftStart = new Date(shift.startedAt);
      const shiftEnd = shift.endedAt ? new Date(shift.endedAt) : new Date();
      const params = {
        dateFrom: shiftStart.toISOString(),
        dateTo: shiftEnd.toISOString(),
        pageSize: 1000
      };
      const [ordersData, returnsRaw] = await Promise.all([
        getOrders({ status: 'Completed', ...params }).catch(() => []),
        getReturns({ ...params }).catch(() => []),
      ]);
      const rawOrders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.items || ordersData?.data || [];


      const orders = rawOrders
        .filter((o) => {
          const d = new Date(o.createdAt || o.date || o.invoiceDate || '');
          return !isNaN(d.getTime()) && d >= shiftStart && d <= shiftEnd;
        })
        .map((o) => ({
          id: o.invoiceCode || o.invoiceId || o.id || '',
          invoiceCode: o.invoiceCode || o.id || '',
          invoiceId: o.invoiceId || o.id || o.invoiceCode || '',
          createdAt: o.createdAt || o.date || '',
          customerName: o.customerName || o.customer || 'Khách lẻ',
          totalAmount: parseFloat(o.totalAmount || o.total || o.grandTotal || 0),
          paymentMethod: o.paymentMethod || '',
          cashier: o.userName || o.cashier || o.createdBy || '',
        }));
      setSelectedShiftOrders(orders);
      // Lọc returns trong khoảng thời gian của ca
      const allReturns = Array.isArray(returnsRaw)
        ? returnsRaw
        : (returnsRaw?.items ?? returnsRaw?.data ?? []);
      const shiftReturnsInDetail = allReturns.filter((r) => {
        const rStatus = String(r.status || '').toUpperCase();
        if (rStatus === 'CANCELLED') return false;
        const d = new Date(r.createdAt || r.created_at || '');
        return !isNaN(d.getTime()) && d >= shiftStart && d <= shiftEnd;
      });
      setSelectedShiftReturns(shiftReturnsInDetail);
      // Backfill tổng tiền cho modal chi tiết
      const needFetch = orders.filter((o) => !o.totalAmount && (o.invoiceId || o.invoiceCode));
      if (needFetch.length > 0) {
        Promise.allSettled(
          needFetch.map((o) => {
            const id = o.invoiceId || o.invoiceCode;
            return id ? getInvoice(id) : Promise.reject('no id');
          })
        ).then((results) => {
          setSelectedShiftOrders((prev) =>
            prev.map((o) => {
              const found = results.find(
                (r) =>
                  r.status === 'fulfilled' &&
                  r.value &&
                  (r.value.invoiceCode === o.invoiceCode || r.value.invoiceId === o.invoiceId)
              );
              if (!found || found.status !== 'fulfilled' || !found.value) return o;
              const d = found.value;
              return {
                ...o,
                totalAmount: parseFloat(d.totalAmount || d.total || d.grandTotal || o.totalAmount),
                paymentMethod: d.paymentMethod || o.paymentMethod,
              };
            })
          );
        });
      }
    } catch (err) {
      console.error('[ShiftManagement] Lỗi load orders for detail:', err);
    } finally {
      setDetailOrdersLoading(false);
    }
  };

  // ---- Lọc & thống kê ----
  // Server-side pagination: shifts đã được lọc + phân trang từ API
  const filteredShifts = shifts; // Backend đã lọc theo dateFilter
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedShifts = shifts; // Backend đã phân trang sẵn

  // Thống kê dựa theo ngày đã chọn
  const statsShifts = filteredShifts.filter((s) => s.status === 'closed');
  const totalShifts = statsShifts.length;
  const totalRevenue = statsShifts.reduce((sum, s) => sum + s.totalSales, 0);
  const avgPerShift = totalShifts > 0 ? totalRevenue / totalShifts : 0;

  const columns = [
    {
      key: 'date',
      header: 'Ngày',
      render: (v, r) => <span>{r.dateLabel || v}</span>,
      width: '120px',
    },
    { key: 'cashier', header: 'Thu ngân', render: (v) => <span className="font-medium">{v}</span> },
    {
      key: 'time',
      header: 'Giờ',
      render: (_, r) => (
        <span className="text-slate-600">
          {r.startTime} - {r.endTime}
        </span>
      ),
    },
    { key: 'openingBalance', header: 'Số dư đầu', render: (v) => formatCurrency(v) },
    { key: 'orderCount', header: 'Đơn', render: (v) => <span className="font-medium">{v}</span> },
    {
      key: 'totalSales',
      header: 'Doanh số',
      render: (v) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span>,
    },
    {
      key: 'cashVariance',
      header: 'Lệch',
      render: (v) =>
        v === 0 ? (
          <span className="text-green-600">Khớp</span>
        ) : (
          <span className={v > 0 ? 'text-blue-600' : 'text-red-600'}>{formatCurrency(v)}</span>
        ),
    },
    {
      key: 'status',
      header: 'TT',
      render: (v) => (
        <Badge variant={v === 'closed' ? 'success' : 'warning'}>
          {v === 'closed' ? 'Đã đóng' : 'Mở'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (_, r) => (
        <button
          onClick={() => handleViewDetail(r)}
          className="text-sm font-medium text-[#004785] hover:underline"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">Quản lý ca bán hàng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
            Mở ca, theo dõi đơn hàng và chốt ca cuối ngày
          </p>
        </div>
        <div className="flex gap-3">
          {!isShiftActive ? (
            <Button variant="success" onClick={handleOpenStartModal} disabled={!canCreateShift}>
              Mở ca mới
            </Button>
          ) : (
            <Button variant="danger" onClick={handleOpenEndModal} disabled={!canEndShift}>
              Chốt ca
            </Button>
          )}
        </div>
      </div>

      {/* Panel ca đang mở */}
      {isShiftActive && displayShift && (
        <Card className="border-l-4 border-l-green-500 dark:border-l-green-600">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Ca đang mở</h2>
                  <p className="text-sm text-slate-500 dark:text-[#999999]">
                    {displayShift.cashier} - Bắt đầu lúc {displayShift.startTime}
                  </p>
                </div>
              </div>
              <Badge variant="success" size="lg">
                Đang hoạt động
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="overflow-hidden rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                <p className="truncate text-xs font-bold uppercase text-blue-600">Tiền mặt trong ca</p>
                <p className="mt-1 truncate text-lg font-extrabold text-blue-900">
                  {formatCurrency((displayShift.openingBalance || 0) + (displayShift.cashSales || 0))}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-slate-50 p-4 dark:bg-[#1a1a1a]/50">
                <p className="truncate text-xs font-bold uppercase text-slate-500">Đơn đã bán</p>
                <p className="mt-1 truncate text-lg font-extrabold text-[#004785]">
                  {displayShift.orderCount}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                <p className="truncate text-xs font-bold uppercase text-green-600">
                  Doanh số tạm tính
                </p>
                <p className="mt-1 truncate text-lg font-extrabold text-green-700">
                  {formatCurrency(displayShift.totalSales)}
                </p>
                {displayShift.totalDiscount > 0 && (
                  <p className="mt-1 truncate text-xs text-emerald-600">
                    (Đã giảm: -{formatCurrency(displayShift.totalDiscount)})
                  </p>
                )}
              </div>
              <div className="overflow-hidden rounded-lg bg-amber-50 p-4 dark:bg-amber-900/30">
                <p className="truncate text-xs font-bold uppercase text-amber-600">
                  Số dư cuối dự kiến
                </p>
                <p className="mt-1 truncate text-lg font-extrabold text-amber-700">
                  {formatCurrency(
                    (displayShift.openingBalance || 0) +
                      (displayShift.cashSales || 0) +
                      (displayShift.transferSales || 0)
                  )}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-amber-500/80">
                  (tiền mặt + chuyển khoản)
                </p>
              </div>
            </div>

            {/* Danh sách hoạt động trong ca */}
            {shiftOrders.length > 0 && (
              <div className="border-t border-slate-100 pt-4 dark:border-[#333333]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                    Hoạt động trong ca
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 dark:text-[#808080]">
                    {(() => {
                      // Gộp đơn bán + hoàn trả (không hủy)
                      const refundsInShift = shiftReturns.filter((r) => {
                        const rStatus = String(r.status || '').toUpperCase();
                        if (rStatus === 'CANCELLED') return false;
                        const rDate = new Date(r.createdAt || r.created_at || 0).getTime();
                        return rDate >= new Date(openShift.startedAt).getTime();
                      });
                      return shiftOrders.length + refundsInShift.length;
                    })()}{' '}
                    hoạt động
                  </span>
                </div>
                <div
                  className="scrollbar-thin space-y-2 overflow-y-auto pr-1"
                  style={{ maxHeight: '11.5rem' }}
                >
                  {(() => {
                    // Gộp đơn bán + hoàn trả, sắp xếp theo thời gian
                    const shiftStart = new Date(openShift.startedAt).getTime();
                    const returns = shiftReturns
                      .filter((r) => {
                        const s = String(r.status || '').toUpperCase();
                        if (s === 'CANCELLED') return false;
                        return new Date(r.createdAt || r.created_at || 0).getTime() >= shiftStart;
                      })
                      .map((r) => {
                        const rType = String(r.returnType || r.return_type || '').toUpperCase();
                        return {
                          _type: rType === 'REFUND' ? 'refund' : 'exchange',
                          _time: new Date(r.createdAt || r.created_at || 0).getTime(),
                          id: r.returnCode || r.returnOrderId || r.returnId || r.id || '',
                          code: r.returnCode || r.returnOrderId || r.returnId || r.id || '',
                          invoiceCode: r.invoiceCode || '',
                          customerName: r.customerName || 'Khách lẻ',
                          createdAt: r.createdAt || r.created_at || '',
                          amount: parseFloat(r.refundAmount || r.refund_amount || 0),
                          cashier: r.staffName || r.userName || r.cashier || r.processedBy || '',
                          // Trường để phân biệt Đổi chênh lệch vs Bảo hành ngang giá
                          returnType: rType,
                          deltaAmount: r.deltaAmount ?? r.delta_amount ?? 0,
                          payAmount: r.payAmount ?? r.pay_amount ?? 0,
                          refundAmountCustomer: r.refundAmountCustomer ?? r.refund_amount_customer ?? 0,
                          paymentMethod: r.paymentMethod || '',
                          refundMethod: r.refundMethod || r.refund_method || '',
                          cashReceived: r.cashReceived ?? null,
                          changeAmount: r.changeAmount ?? null,
                        };
                      });
                    const sales = shiftOrders.map((o) => ({
                      _type: 'sale',
                      _time: new Date(o.createdAt || 0).getTime(),
                      id: o.id,
                      code: o.invoiceCode,
                      invoiceCode: o.invoiceCode,
                      customerName: o.customerName,
                      createdAt: o.createdAt,
                      amount: o.totalAmount,
                      paymentMethod: o.paymentMethod,
                      cashier: o.cashier || '',
                      cashReceived: o.cashReceived,
                      changeAmount: o.changeAmount,
                    }));
                    return [...sales, ...returns]
                      .sort((a, b) => b._time - a._time)
                      .map((act) => {
                        if (act._type === 'sale') {
                          return (
                            <div
                              key={'sale-' + act.id}
                              className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:hover:border-[#404040] dark:hover:bg-[#272727]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                                  <svg
                                    className="h-3.5 w-3.5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="shrink-0 font-mono text-xs font-bold text-[#004785] dark:text-blue-300">
                                      {act.code}
                                    </span>
                                    <span className="rounded bg-green-100 px-1 py-0.5 text-[9px] font-semibold text-green-700">
                                      Bán
                                    </span>
                                  </div>
                                </div>
                                <span className="shrink-0 text-xs text-slate-400 dark:text-[#808080]">
                                  {new Date(act.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="truncate text-xs text-slate-600 dark:text-[#999999]">
                                  {act.customerName}
                                </span>
                                {act.cashier && (
                                  <span className="shrink-0 text-[10px] text-slate-400 dark:text-[#808080]">
                                    - {act.cashier}
                                  </span>
                                )}
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-green-600">
                                    +{formatCurrency(act.amount)}
                                  </span>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-[#272727] dark:text-[#999999]">
                                  {act.paymentMethod === 'CASH' || act.paymentMethod === 'Cash' || act.paymentMethod === 'Tiền mặt'
                                    ? 'Tiền mặt'
                                    : act.paymentMethod === 'TRANSFER' || act.paymentMethod === 'Transfer' || act.paymentMethod === 'Chuyển khoản'
                                      ? 'CK'
                                      : act.paymentMethod === 'CARD' || act.paymentMethod === 'Card' || act.paymentMethod === 'Thẻ'
                                        ? 'Thẻ'
                                        : act.paymentMethod === 'COMBINED' || act.paymentMethod === 'Combined' || act.paymentMethod === 'Kết hợp' || (act.paymentMethod && act.paymentMethod.startsWith('['))
                                          ? 'Kết hợp'
                                          : act.paymentMethod || '-'}
                                </span>
                                </div>
                                {act.cashReceived > 0 && act.changeAmount > 0 && (
                                  <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                                    Khách đưa: {formatCurrency(act.cashReceived)} - Thừa: {formatCurrency(act.changeAmount)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        const cls = classifyReturn(act);
                        const isRefund = cls.isRefund;
                        // Dòng "đưa/thừa" cho đơn đổi trả tiền mặt
                        const _isCashRet = isRefund
                          ? /CASH|TIỀN MẶT|TIEN MAT/i.test(act.refundMethod || '')
                          : /CASH|TIỀN MẶT|TIEN MAT/i.test(act.paymentMethod || '');
                        let _cashLine = '';
                        if (_isCashRet) {
                          if (cls.isExchangeDiff && cls.signed > 0 && Number(act.cashReceived) > 0) {
                            _cashLine = `Khách đưa: ${formatCurrency(act.cashReceived)} - Thừa: ${formatCurrency(act.changeAmount || 0)}`;
                          } else if (cls.signed < 0) {
                            const _repay = isRefund
                              ? Math.abs(Number(act.amount) || 0)
                              : (Math.abs(Number(act.refundAmountCustomer) || 0) || Math.abs(cls.signed));
                            if (_repay > 0) _cashLine = `Trả khách: ${formatCurrency(_repay)}`;
                          }
                        }
                        return (
                          <div
                            key={'ret-' + act.id}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:hover:border-[#404040] dark:hover:bg-[#272727]"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isRefund ? 'bg-red-100' : 'bg-blue-100'}`}
                              >
                                {isRefund ? (
                                  <svg
                                    className="h-3.5 w-3.5 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 15v-1a4 4 0 00-8 0v1m0 0h8m-8 0a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v3a4 4 0 01-4 4m-8 0a4 4 0 004 4h.5M9 19l-1.5 1.5M9 19l1.5-1.5"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-3.5 w-3.5 text-blue-600"
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
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="shrink-0 font-mono text-xs font-bold text-slate-500">
                                    {act.code}
                                  </span>
                                  <span
                                    className={`rounded px-1 py-0.5 text-[9px] font-semibold ${cls.badge}`}
                                  >
                                    {cls.label}
                                  </span>
                                </div>
                                <span className="mt-0.5 text-[9px] text-slate-400">
                                  {act.invoiceCode}
                                </span>
                              </div>
                              <span className="shrink-0 text-xs text-slate-400 dark:text-[#808080]">
                                {new Date(act.createdAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="truncate text-xs text-slate-600 dark:text-[#999999]">
                                {act.customerName}
                              </span>
                              {act.cashier && (
                                <span className="shrink-0 text-[10px] text-slate-400 dark:text-[#808080]">
                                  - {act.cashier}
                                </span>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                              {cls.signed !== 0 && (
                                <span
                                  className={`text-xs font-bold ${cls.signed < 0 ? 'text-red-600' : 'text-green-600'}`}
                                >
                                  {cls.signed < 0 ? '-' : '+'}{formatCurrency(Math.abs(cls.signed))}
                                </span>
                              )}
                              {_cashLine && (
                                <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                                  {_cashLine}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
                {shiftOrders.length +
                  shiftReturns.filter((r) => {
                    const rStatus = String(r.status || '').toUpperCase();
                    if (rStatus === 'CANCELLED') return false;
                    const rDate = new Date(r.createdAt || r.created_at || 0).getTime();
                    return rDate >= new Date(openShift.startedAt).getTime();
                  }).length >
                  3 && (
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-medium text-slate-400">
                      ⋮ kéo xuống để xem thêm ⋮
                    </span>
                  </div>
                )}
              </div>
            )}
            {ordersLoading && (
              <div className="py-3 text-center text-xs text-slate-400 dark:text-[#808080]">Đang tải đơn hàng...</div>
            )}
          </div>
        </Card>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#004785]">{totalShifts}</div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Tổng ca đã chốt
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Tổng doanh thu
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-purple-600">
              {formatCurrency(avgPerShift)}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Bình quân/ca
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-orange-600">{totalCount}</div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Tổng số ca
            </p>
          </div>
        </Card>
      </div>

      {/* Lịch sử ca */}
      <Card
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Lịch sử ca làm việc</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDateFilter(toLocalDateStr(new Date()))}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                  dateFilter === toLocalDateStr(new Date())
                    ? 'border-[#004785] bg-[#004785] text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-[#333333] dark:text-[#999999] dark:hover:border-[#404040]'
                }`}
              >
                Hôm nay
              </button>
              <div className="w-44">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  icon={<span>📅</span>}
                />
              </div>
            </div>
          </div>
        }
        padding="p-0"
      >
        <Table
          columns={columns}
          data={paginatedShifts}
          loading={loading}
          emptyMessage={error ? `Lỗi: ${error}` : 'Chưa có ca làm việc nào'}
        />
        {totalCount > 0 && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
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
                {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, totalCount)} trong tổng số{' '}
                {totalCount} ca
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

      {/* Modal Mở ca */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Mở ca làm việc mới"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStartModal(false)}>
              Hủy
            </Button>
            <Button variant="success" onClick={handleStartShift}>
              Mở ca
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tiền mặt đầu ca (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={
                startForm.openingBalance
                  ? (isNaN(Number(startForm.openingBalance))
                      ? ''
                      : Number(startForm.openingBalance).toLocaleString('vi-VN'))
                  : ''
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, '');
                if (raw.length > 12) return;
                setStartForm((f) => ({ ...f, openingBalance: raw }));
              }}
              maxLength={15}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Bắt đầu lúc{' '}
            <span className="font-semibold">{new Date().toLocaleTimeString('vi-VN')}</span> -{' '}
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </Modal>

      {/* Modal Chốt ca */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title=""
        size="2xl"
        footer={
          <div className="flex w-full gap-3">
            <Button
              variant="secondary"
              className="flex-1 py-3"
              onClick={() => setShowEndModal(false)}
            >
              Hủy
            </Button>
            <Button variant="danger" className="flex-1 py-3" onClick={handleEndShift}>
              <svg
                className="mr-1.5 inline-block h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Xác nhận chốt ca
            </Button>
          </div>
        }
      >
        <div className="-mt-2 space-y-5">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-[#e5e5e5]">
              Chốt ca làm việc
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-[#999999]">
              {!isCurrentUserOpener
                ? `Người mở ca: ${displayShift?.openedByUserName || displayShift?.cashier || '?'}. Bạn đang chốt hộ.`
                : 'Kiểm tra số liệu và xác nhận kết thúc ca'}
            </p>
          </div>

          {/* Thông tin ca */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 dark:border-[#333333] dark:from-[#1a1a1a]/50 dark:to-[#0f0f0f]">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-[#808080]">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              THÔNG TIN CA
              <span className="ml-1.5 h-px flex-1 bg-slate-200 dark:bg-[#272727]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{displayShift?.cashier || '-'}</p>
                  <p className="text-xs text-slate-400 dark:text-[#808080]">Thu ngân</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{displayShift?.startTime || '-'}</p>
                <p className="text-xs text-slate-400 dark:text-[#808080]">Giờ mở ca</p>
              </div>
            </div>
          </div>

          {/* Số liệu tổng kết */}
          <div>
            <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              TỔNG KẾT
              <span className="ml-1.5 h-px flex-1 bg-slate-200 dark:bg-[#272727]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#808080]">
                  Số dư đầu ca
                </p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="truncate text-xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">
                    {formatCurrency(displayShift?.openingBalance || 0)}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400 dark:text-[#808080]">VNĐ</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#808080]">
                  Số đơn đã bán
                </p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="truncate text-xl font-extrabold text-blue-700">
                    {displayShift?.orderCount || 0}
                  </span>
                  <span className="shrink-0 text-xs text-blue-400">đơn</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 transition-shadow hover:shadow-sm">
                <p className="truncate text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  Tổng doanh số
                </p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="truncate text-xl font-extrabold text-emerald-700">
                    {formatCurrency(displayShift?.totalSales || 0)}
                  </span>
                  <span className="shrink-0 text-xs text-emerald-500">VNĐ</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 transition-shadow hover:shadow-sm">
                <p className="truncate text-[11px] font-bold uppercase tracking-wide text-amber-700">
                  Số dư cuối dự kiến
                </p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="truncate text-xl font-extrabold text-amber-700">
                    {formatCurrency(
                      (displayShift?.openingBalance || 0) +
                        (displayShift?.cashSales || 0) +
                        (displayShift?.transferSales || 0)
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-amber-500">VNĐ</span>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-amber-600/70">
                  (tiền mặt + chuyển khoản)
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 transition-shadow hover:shadow-sm">
                <p className="truncate text-[11px] font-bold uppercase tracking-wide text-blue-700">
                  Tiền mặt
                </p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="truncate text-xl font-extrabold text-blue-700">
                    {formatCurrency(
                      (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0)
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-blue-500">VNĐ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales By User - Cash Session model */}
          {displayShift?.salesByUser && displayShift.salesByUser.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
              <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                DOANH SỐ THEO NHÂN VIÊN
                <span className="ml-1.5 h-px flex-1 bg-slate-200 dark:bg-[#272727]" />
              </div>
              <div className="space-y-1.5">
                {displayShift.salesByUser.map((u, idx) => {
                  const isExpanded = expandedSalesUser === u.userName;
                  const userOrders = shiftOrders.filter((o) => (o.cashier || '') === (u.userName || ''));
                  const userReturns = shiftReturns.filter((r) => {
                    const name = r.staffName || r.userName || r.cashier || r.processedBy || '';
                    return name === (u.userName || '');
                  });
                  return (
                    <div key={u.userId || idx}>
                      <div
                        onClick={() => setExpandedSalesUser(isExpanded ? null : u.userName)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-[#1a1a1a]/50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                            {u.userName || 'NV #' + (idx + 1)}
                          </span>
                          <svg className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-xs text-slate-400">{u.invoiceCount || 0} đơn</span>
                          <span className="text-sm font-bold text-green-600">{formatCurrency(u.totalAmount || 0)}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-1.5 space-y-1 pl-8">
                          {userOrders.length === 0 && userReturns.length === 0 && (
                            <p className="py-2 text-center text-xs text-slate-400">Không có hoạt động nào</p>
                          )}
                          {userOrders.map((o) => (
                            <div key={'usr-order-' + o.id} className="flex items-center justify-between rounded bg-white px-3 py-1.5 text-xs dark:bg-[#1a1a1a]">
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] font-semibold text-green-700">Bán</span>
                                <span className="font-mono text-slate-600 dark:text-[#999999]">{o.invoiceCode}</span>
                                <span className="text-slate-400">{o.customerName}</span>
                              </div>
                              <span className="font-bold text-green-600">+{formatCurrency(o.totalAmount)}</span>
                            </div>
                          ))}
                          {userReturns.map((r) => {
                            const cls = classifyReturn(r);
                            return (
                              <div key={'usr-ret-' + (r.returnCode || r.returnOrderId || r.returnId || r.id)} className="flex items-center justify-between rounded bg-white px-3 py-1.5 text-xs dark:bg-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                  <span className={`rounded px-1 py-0.5 text-[10px] font-semibold ${cls.badge}`}>
                                    {cls.label}
                                  </span>
                                  <span className="font-mono text-slate-500">{r.returnCode || r.returnOrderId || r.returnId || r.id || ''}</span>
                                  <span className="text-slate-400">{r.customerName || 'Khách lẻ'}</span>
                                </div>
                                {cls.signed !== 0 && (
                                  <span className={`font-bold ${cls.signed < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {cls.signed < 0 ? '-' : '+'}{formatCurrency(Math.abs(cls.signed))}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nhập liệu */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              KIỂM ĐẾM THỰC TẾ
              <span className="ml-1.5 h-px flex-1 bg-slate-200 dark:bg-[#272727]" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                  Tiền mặt thực tế
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-300 dark:text-[#808080]">
                    ₫
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      endForm.actualCashCount
                        ? Number(endForm.actualCashCount).toLocaleString('vi-VN')
                        : ''
                    }
                    onChange={(e) => {
                      let raw = e.target.value.replace(/\./g, '');
                      // Chỉ cho nhập số
                      if (raw !== '' && !/^\d+$/.test(raw)) return;
                      // Cắt bớt nếu quá 12 chữ số
                      if (raw.length > 12) {
                        raw = raw.slice(0, 12);
                      }
                      // Reset lý do chênh lệch khi đổi số (dấu chênh lệch có thể đổi THỪA↔THIẾU)
                      setEndForm((f) => ({ ...f, actualCashCount: raw, diffReason: '' }));
                    }}
                    className="w-full rounded-xl border-2 border-slate-200 py-3.5 pl-10 pr-4 text-base font-bold transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] [&::-webkit-inner-spin-button]:appearance-none"
                    maxLength={14}
                  />
                </div>
                {endForm.actualCashCount &&
                  (() => {
                    const expectedAmount =
                      (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0);
                    const actualAmount = Number(endForm.actualCashCount);
                    const diff = actualAmount - expectedAmount;
                    const isReasonable = actualAmount <= expectedAmount * 3 && actualAmount >= 0;

                    return (
                      <div
                        className={`mt-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
                          actualAmount >= expectedAmount
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        } ${!isReasonable ? '!bg-red-50 !text-red-700' : ''}`}
                      >
                        {!isReasonable ? (
                          <>
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            Số tiền nhập vào không hợp lý ({formatCurrency(actualAmount)})
                          </>
                        ) : actualAmount >= expectedAmount ? (
                          <>
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {actualAmount === expectedAmount
                              ? 'Khớp với số dư dự kiến'
                              : `Thừa ${formatCurrency(diff)} so với dự kiến`}
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Còn thiếu {formatCurrency(Math.abs(diff))} so với dự kiến
                          </>
                        )}
                      </div>
                    );
                  })()}
              </div>

              {/* Lý do chênh lệch (Dropdown) — chỉ hiện khi Tiền thực tế ≠ Số dư dự kiến.
                  THỪA (diff>0) → 3 lý do; THIẾU (diff<0) → 4 lý do. Bắt buộc chọn khi lệch. */}
              {(() => {
                const expectedCash = (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0);
                const actualCash = Number(endForm.actualCashCount) || 0;
                const diff = actualCash - expectedCash;
                if (!endForm.actualCashCount || diff === 0) return null;
                const isSurplus = diff > 0;
                const reasons = isSurplus ? CASH_SURPLUS_REASONS : CASH_SHORTAGE_REASONS;
                return (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-red-600">
                      Lý do chênh lệch <span className="text-red-500">*</span>
                      <span className={`ml-2 text-xs font-normal ${isSurplus ? 'text-emerald-600' : 'text-amber-600'}`}>
                        ({isSurplus ? 'thừa tiền' : 'thiếu tiền'})
                      </span>
                    </label>
                    <select
                      value={endForm.diffReason}
                      onChange={(e) => setEndForm((f) => ({ ...f, diffReason: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${isSurplus ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100' : 'border-amber-300 focus:border-amber-500 focus:ring-amber-100'} dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]`}
                    >
                      <option value="">— Chọn lý do chênh lệch —</option>
                      {reasons.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}
              <div>
                <label
                  className={`mb-1.5 block text-sm font-semibold ${(() => {
                    const expectedCash =
                      (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0);
                    const actualCash = Number(endForm.actualCashCount) || 0;
                    return actualCash !== expectedCash ? 'text-red-600' : 'text-slate-700 dark:text-[#b3b3b3]';
                  })()}`}
                >
                  Ghi chú{' '}
                  {(() => {
                    const expectedCash =
                      (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0);
                    const actualCash = Number(endForm.actualCashCount) || 0;
                    return actualCash !== expectedCash ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      ''
                    );
                  })()}
                </label>
                <textarea
                  rows={2}
                  placeholder={(() => {
                    const expectedCash =
                      (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0);
                    const actualCash = Number(endForm.actualCashCount) || 0;
                    return actualCash !== expectedCash
                      ? 'Bắt buộc nhập ghi chú giải thích lý do chênh lệch'
                      : 'Nhập ghi chú (không bắt buộc)';
                  })()}
                  value={endForm.note}
                  onChange={(e) => setEndForm((f) => ({ ...f, note: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${(() => {
                    const expectedCash =
                      (displayShift?.openingBalance || 0) + (displayShift?.cashSales || 0);
                    const actualCash = Number(endForm.actualCashCount) || 0;
                    return actualCash !== expectedCash
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#004785] focus:ring-blue-100';
                  })()}`}
                />
              </div>
              {!isCurrentUserOpener && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-red-600">
                    Lý do chốt hộ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nhập lý do bắt buộc (vd: Nhân viên nghỉ ốm, về sớm, đổi ca...)"
                    value={endForm.forceCloseReason}
                    onChange={(e) => setEndForm((f) => ({ ...f, forceCloseReason: e.target.value }))}
                    className="w-full rounded-xl border-2 border-red-300 px-4 py-3 text-sm transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-red-700 dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Chi tiết ca */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Chi tiết ca - ${selectedShift?.dateLabel || selectedShift?.date || ''}`}
        size="4xl"
        footer={
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        }
      >
        {selectedShift && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">Người mở ca</p>
                <p className="mt-1 font-semibold">{selectedShift.openedByUserName || selectedShift.cashier}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">Giờ làm</p>
                <p className="mt-1 font-semibold">
                  {selectedShift.startTime} - {selectedShift.endTime}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Trạng thái
                </p>
                <p className="mt-1">
                  <Badge variant={selectedShift.status === 'closed' ? 'success' : 'warning'}>
                    {selectedShift.status === 'closed' ? 'Đã đóng' : 'Đang mở'}
                  </Badge>
                </p>
              </div>
              {selectedShift.closedByUserName && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">Người chốt ca</p>
                  <p className="mt-1 font-semibold">{selectedShift.closedByUserName}</p>
                </div>
              )}
              {selectedShift.forceCloseReason && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lý do chốt hộ</p>
                  <p className="mt-1 text-sm text-red-600">{selectedShift.forceCloseReason}</p>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Số liệu ca
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
                  <p className="text-xs text-slate-500 dark:text-[#999999]">Số dư đầu</p>
                  <p className="mt-0.5 text-lg font-bold">
                    {formatCurrency(selectedShift.openingBalance)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]/50">
                  <p className="text-xs text-slate-500">Số dư cuối</p>
                  <p className="mt-0.5 text-lg font-bold">
                    {formatCurrency(selectedShift.closingBalance)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-green-700">Tổng doanh số</p>
                  <p className="mt-0.5 text-lg font-bold text-green-700">
                    {formatCurrency(selectedShift.totalSales)}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">Số đơn hàng</p>
                  <p className="mt-0.5 text-lg font-bold text-blue-700">
                    {selectedShift.orderCount}
                  </p>
                </div>
              </div>
            </div>
            {selectedShift.salesByUser && selectedShift.salesByUser.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Doanh số theo nhân viên
                </h3>
                <div className="space-y-1.5">
                  {selectedShift.salesByUser.map((u, idx) => {
                    const isExpanded = expandedSalesUser === u.userName;
                    const userOrders = selectedShiftOrders.filter((o) => (o.cashier || '') === (u.userName || ''));
                    const userReturns = selectedShiftReturns.filter((r) => {
                      const name = r.staffName || r.userName || r.cashier || r.processedBy || '';
                      return name === (u.userName || '');
                    });
                    return (
                      <div key={u.userId || idx}>
                        <div
                          onClick={() => setExpandedSalesUser(isExpanded ? null : u.userName)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-[#1a1a1a]/50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                              {u.userName || 'NV #' + (idx + 1)}
                            </span>
                            <svg className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{u.invoiceCount || 0} đơn</span>
                            <span className="text-sm font-bold text-green-600">{formatCurrency(u.totalAmount || 0)}</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-1.5 space-y-1 pl-6">
                            {userOrders.length === 0 && userReturns.length === 0 && (
                              <p className="py-2 text-center text-xs text-slate-400">Không có hoạt động nào</p>
                            )}
                            {userOrders.map((o) => (
                              <div key={'det-usr-order-' + o.id} className="flex items-center justify-between rounded bg-white px-3 py-1.5 text-xs dark:bg-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] font-semibold text-green-700">Bán</span>
                                  <span className="font-mono text-slate-600 dark:text-[#999999]">{o.invoiceCode}</span>
                                  <span className="text-slate-400">{o.customerName}</span>
                                </div>
                                <span className="font-bold text-green-600">+{formatCurrency(o.totalAmount)}</span>
                              </div>
                            ))}
                            {userReturns.map((r) => {
                              const cls = classifyReturn(r);
                              return (
                                <div key={'det-usr-ret-' + (r.returnCode || r.returnOrderId || r.returnId || r.id)} className="flex items-center justify-between rounded bg-white px-3 py-1.5 text-xs dark:bg-[#1a1a1a]">
                                  <div className="flex items-center gap-2">
                                    <span className={`rounded px-1 py-0.5 text-[10px] font-semibold ${cls.badge}`}>
                                      {cls.label}
                                    </span>
                                    <span className="font-mono text-slate-500">{r.returnCode || r.returnOrderId || r.returnId || r.id || ''}</span>
                                    <span className="text-slate-400">{r.customerName || 'Khách lẻ'}</span>
                                  </div>
                                  {cls.signed !== 0 && (
                                    <span className={`font-bold ${cls.signed < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {cls.signed < 0 ? '-' : '+'}{formatCurrency(Math.abs(cls.signed))}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedShift.note && (
              <div className="border-t pt-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Ghi chú
                </h3>
                <p className="text-sm text-slate-700 dark:text-[#b3b3b3]">{selectedShift.note}</p>
              </div>
            )}

            {/* Hoạt động trong ca (detail modal) */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Hoạt động trong ca
                {(() => {
                  const total = selectedShiftOrders.length + selectedShiftReturns.length;
                  return (
                    total > 0 && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({total} hoạt động)
                      </span>
                    )
                  );
                })()}
              </h3>
              {detailOrdersLoading ? (
                <div className="py-4 text-center text-xs text-slate-400 dark:text-[#808080]">Đang tải...</div>
              ) : selectedShiftOrders.length > 0 || selectedShiftReturns.length > 0 ? (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {(() => {
                    const returns = selectedShiftReturns.map((r) => {
                      const rType = String(r.returnType || r.return_type || '').toUpperCase();
                      return {
                        _type: rType === 'REFUND' ? 'refund' : 'exchange',
                        _time: new Date(r.createdAt || r.created_at || 0).getTime(),
                        id: r.returnCode || r.returnOrderId || r.returnId || r.id || '',
                        code: r.returnCode || r.returnOrderId || r.returnId || r.id || '',
                        invoiceCode: r.invoiceCode || '',
                        customerName: r.customerName || 'Khách lẻ',
                        createdAt: r.createdAt || r.created_at || '',
                        amount: parseFloat(r.refundAmount || r.refund_amount || 0),
                        cashier: r.userName || r.cashier || r.processedBy || '',
                        returnType: rType,
                        deltaAmount: r.deltaAmount ?? r.delta_amount ?? 0,
                        payAmount: r.payAmount ?? r.pay_amount ?? 0,
                        refundAmountCustomer: r.refundAmountCustomer ?? r.refund_amount_customer ?? 0,
                        paymentMethod: r.paymentMethod || '',
                        refundMethod: r.refundMethod || r.refund_method || '',
                        cashReceived: r.cashReceived ?? null,
                        changeAmount: r.changeAmount ?? null,
                      };
                    });
                    const sales = selectedShiftOrders.map((o) => ({
                      _type: 'sale',
                      _time: new Date(o.createdAt || 0).getTime(),
                      id: o.id,
                      code: o.invoiceCode,
                      invoiceCode: o.invoiceCode,
                      customerName: o.customerName,
                      createdAt: o.createdAt,
                      amount: o.totalAmount,
                      paymentMethod: o.paymentMethod,
                      cashier: o.cashier || '',
                      cashReceived: o.cashReceived,
                      changeAmount: o.changeAmount,
                    }));
                    return [...sales, ...returns]
                      .sort((a, b) => b._time - a._time)
                      .map((act) => {
                        if (act._type === 'sale') {
                          return (
                            <div
                              key={'detail-sale-' + act.id}
                              className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                                  <svg
                                    className="h-3 w-3 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <span className="shrink-0 font-mono text-xs font-bold text-[#004785] dark:text-blue-300">
                                  {act.code}
                                </span>
                                <span className="rounded bg-green-100 px-1 py-0.5 text-[9px] font-semibold text-green-700">
                                  Bán
                                </span>
                                <span className="shrink-0 text-xs text-slate-400 dark:text-[#808080]">
                                  {new Date(act.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="truncate text-xs text-slate-600 dark:text-[#999999]">
                                  {act.customerName}
                                </span>
                                {act.cashier && (
                                  <span className="shrink-0 text-[10px] text-slate-400 dark:text-[#808080]">
                                    - {act.cashier}
                                  </span>
                                )}
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-green-600">
                                    +{formatCurrency(act.amount)}
                                  </span>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                                    {act.paymentMethod === 'CASH' || act.paymentMethod === 'Cash' || act.paymentMethod === 'Tiền mặt'
                                      ? 'Tiền mặt'
                                      : act.paymentMethod === 'TRANSFER' || act.paymentMethod === 'Transfer' || act.paymentMethod === 'Chuyển khoản'
                                        ? 'CK'
                                        : act.paymentMethod === 'CARD' || act.paymentMethod === 'Card' || act.paymentMethod === 'Thẻ'
                                          ? 'Thẻ'
                                          : act.paymentMethod === 'COMBINED' || act.paymentMethod === 'Combined' || act.paymentMethod === 'Kết hợp' || (act.paymentMethod && act.paymentMethod.startsWith('['))
                                            ? 'Kết hợp'
                                            : act.paymentMethod || '-'}
                                  </span>
                                </div>
                                {act.cashReceived > 0 && act.changeAmount > 0 && (
                                  <span className="text-[10px] text-slate-400">
                                    Khách đưa: {formatCurrency(act.cashReceived)} - Thừa: {formatCurrency(act.changeAmount)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        const cls = classifyReturn(act);
                        const isRefund = cls.isRefund;
                        // Dòng "đưa/thừa" cho đơn đổi trả tiền mặt
                        const _isCashRet = isRefund
                          ? /CASH|TIỀN MẶT|TIEN MAT/i.test(act.refundMethod || '')
                          : /CASH|TIỀN MẶT|TIEN MAT/i.test(act.paymentMethod || '');
                        let _cashLine = '';
                        if (_isCashRet) {
                          if (cls.isExchangeDiff && cls.signed > 0 && Number(act.cashReceived) > 0) {
                            _cashLine = `Khách đưa: ${formatCurrency(act.cashReceived)} - Thừa: ${formatCurrency(act.changeAmount || 0)}`;
                          } else if (cls.signed < 0) {
                            const _repay = isRefund
                              ? Math.abs(Number(act.amount) || 0)
                              : (Math.abs(Number(act.refundAmountCustomer) || 0) || Math.abs(cls.signed));
                            if (_repay > 0) _cashLine = `Trả khách: ${formatCurrency(_repay)}`;
                          }
                        }
                        return (
                          <div
                            key={'detail-ret-' + act.id}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isRefund ? 'bg-red-100' : 'bg-blue-100'}`}
                              >
                                {isRefund ? (
                                  <svg
                                    className="h-3 w-3 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 15v-1a4 4 0 00-8 0v1m0 0h8m-8 0a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v3a4 4 0 01-4 4m-8 0a4 4 0 004 4h.5M9 19l-1.5 1.5M9 19l1.5-1.5"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-3 w-3 text-blue-600"
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
                                )}
                              </div>
                              <span className="shrink-0 font-mono text-xs font-bold text-slate-500">
                                {act.code}
                              </span>
                              <span
                                className={`rounded px-1 py-0.5 text-[9px] font-semibold ${cls.badge}`}
                              >
                                {cls.label}
                              </span>
                              <span className="shrink-0 text-xs text-slate-400 dark:text-[#808080]">
                                {new Date(act.createdAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="truncate text-xs text-slate-600 dark:text-[#999999]">
                                {act.customerName}
                              </span>
                              {act.cashier && (
                                <span className="shrink-0 text-[10px] text-slate-400 dark:text-[#808080]">
                                  - {act.cashier}
                                </span>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                              {cls.signed !== 0 && (
                                <span
                                  className={`text-xs font-bold ${cls.signed < 0 ? 'text-red-600' : 'text-green-600'}`}
                                >
                                  {cls.signed < 0 ? '-' : '+'}{formatCurrency(Math.abs(cls.signed))}
                                </span>
                              )}
                              {_cashLine && (
                                <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                                  {_cashLine}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-slate-400 dark:text-[#808080]">
                  Không có hoạt động nào trong ca
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftManagement;
