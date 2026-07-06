/**
 * ShiftManagement Page - Quản lý ca bán hàng
 * API: /pos/shifts - GET list, POST start, GET summary, POST end
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import {
  startShift,
  endShift,
  getShifts,
  getShiftSummary,
  getOrders,
} from '../services/posService';

// Format date thành YYYY-MM-DD theo giờ địa phương
const toLocalDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const cashierName = s.userName || s.cashier || saved[shiftId] || 'Thu ngân';
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
    shiftData: s,
  };
};

// Mock data fallback
const MOCK_SHIFTS = [
  {
    shiftId: 'mock-1',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    userName: 'Nguyễn Văn A',
    status: 'CLOSED',
    openingBalance: 1000000,
    totalRevenue: 2500000,
    totalOrders: 15,
    note: '',
  },
  {
    shiftId: 'mock-2',
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    userName: 'Trần Thị B',
    status: 'CLOSED',
    openingBalance: 500000,
    totalRevenue: 1800000,
    totalOrders: 12,
    note: 'Ca chiều',
  },
];

export const ShiftManagement = () => {
  const { user } = useAuth();
  const staffName = user?.fullName || user?.name || user?.email || 'Thu ngân';
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ca đang mở
  const openShift = useMemo(() => shifts.find((s) => s.status === 'open'), [shifts]);
  const isShiftActive = !!openShift;

  // Summary + orders của ca đang mở
  const [shiftSummary, setShiftSummary] = useState(null);
  const [shiftOrders, setShiftOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedShiftOrders, setSelectedShiftOrders] = useState([]);
  const [detailOrdersLoading, setDetailOrdersLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(() => toLocalDateStr(new Date()));
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter]);

  const [startForm, setStartForm] = useState({ openingBalance: '1000000' });
  const [endForm, setEndForm] = useState({ actualCashCount: '', note: '' });

  // Load shifts từ API
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[ShiftManagement] Fetching shifts...');
      const data = await getShifts();
      console.log('[ShiftManagement] getShifts response:', data);
      const rawItems = Array.isArray(data) ? data : data?.items || data?.data || [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      console.log('[ShiftManagement] shifts items:', items.length);
      if (items.length > 0) {
        const mapped = items.map(mapShift);
        console.log('[ShiftManagement] mapped shifts:', mapped);
        setShifts(mapped);

        // Kiểm tra có ca OPEN không
        const open = mapped.find((s) => s.status === 'open');
        console.log('[ShiftManagement] open shift found:', open ? open.id : 'none');
        if (open) {
          sessionStorage.setItem('pos_active_shift', JSON.stringify(open));
        } else {
          sessionStorage.removeItem('pos_active_shift');
        }
      } else {
        console.log('[ShiftManagement] API trả về rỗng');
        setShifts([]);
        sessionStorage.removeItem('pos_active_shift');
      }
    } catch (err) {
      console.error('Lỗi load shifts:', err);
      setError(err.message);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

      // Load orders
      console.log('[ShiftManagement] Fetching completed orders...');
      const ordersData = await getOrders({ status: 'Completed' });
      console.log('[ShiftManagement] getOrders response:', ordersData);
      const rawOrders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.items || ordersData?.data || [];
      console.log('[ShiftManagement] raw orders count:', rawOrders.length);

      // Map orders với field linh hoạt
      const orders = rawOrders.map((o) => ({
        id: o.invoiceCode || o.invoiceId || o.id || '',
        invoiceCode: o.invoiceCode || o.id || '',
        createdAt: o.createdAt || o.date || o.invoiceDate || '',
        customerName: o.customerName || o.customer || 'Khách lẻ',
        totalAmount: parseFloat(o.totalAmount || o.total || o.grandTotal || 0),
        paymentMethod: o.paymentMethod || '',
        cashier: o.userName || o.cashier || o.createdBy || openShift.cashier,
        items: o.items || [],
        itemCount: o.items?.length || o.itemCount || 0,
      }));

      // Lọc orders từ lúc mở ca (xử lý linh hoạt định dạng ngày)
      const startDate = new Date(openShift.startedAt);
      console.log('[ShiftManagement] startDate:', startDate, 'raw:', openShift.startedAt);
      const filteredOrders = orders.filter((o) => {
        if (!o.createdAt) {
          console.warn('[ShiftManagement] order missing createdAt:', o.invoiceCode);
          return false;
        }
        const orderDate = new Date(o.createdAt);
        if (isNaN(orderDate.getTime())) {
          try {
            const parsed = Date.parse(o.createdAt);
            if (!isNaN(parsed)) {
              const keep = parsed >= startDate.getTime();
              if (!keep)
                console.log('[ShiftManagement] order before shift:', o.invoiceCode, o.createdAt);
              return keep;
            }
          } catch (_) {}
          console.warn(
            '[ShiftManagement] unparseable date, keeping order:',
            o.invoiceCode,
            o.createdAt
          );
          return true;
        }
        const keep = orderDate >= startDate;
        if (!keep) console.log('[ShiftManagement] order before shift:', o.invoiceCode, o.createdAt);
        return keep;
      });
      console.log('[ShiftManagement] filtered orders count:', filteredOrders.length);
      if (filteredOrders.length > 0) {
        console.log('[ShiftManagement] first order:', filteredOrders[0]);
      }

      // Tính stats từ orders
      const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const orderCount = filteredOrders.length;
      const cashSales = filteredOrders
        .filter(
          (o) =>
            o.paymentMethod === 'Cash' ||
            o.paymentMethod === 'CASH' ||
            o.paymentMethod === 'Tiền mặt'
        )
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const cardSales = filteredOrders
        .filter(
          (o) =>
            o.paymentMethod === 'Card' || o.paymentMethod === 'CARD' || o.paymentMethod === 'Thẻ'
        )
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const transferSales = filteredOrders
        .filter(
          (o) =>
            o.paymentMethod === 'Transfer' ||
            o.paymentMethod === 'TRANSFER' ||
            o.paymentMethod === 'Chuyển khoản'
        )
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setShiftSummary({
        ...summaryData,
        totalRevenue,
        totalSales: totalRevenue,
        orderCount,
        cashSales,
        cardSales,
        transferSales,
      });
      setShiftOrders(filteredOrders);
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

  useEffect(() => {
    if (openShift) {
      fetchShiftSummary();
      // Poll mỗi 10s để cập nhật realtime
      const interval = setInterval(() => {
        try {
          const ss = JSON.parse(sessionStorage.getItem('pos_active_shift') || 'null');
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
      // API có thể trả về { data: {...} } hoặc trực tiếp {...}
      const result = raw?.data || raw;
      console.log('[ShiftManagement] startShift result:', result);
      const newShift = mapShift({ ...result, userName: staffName });
      console.log('[ShiftManagement] mapped new shift:', newShift);

      // Lưu tên thu ngân cho shift này
      saveCashier(newShift.id, staffName);
      // Lưu shift đang hoạt động vào sessionStorage để POSScreen dùng
      sessionStorage.setItem('pos_active_shift', JSON.stringify(newShift));

      setShifts((prev) => [newShift, ...prev]);
      setShiftSummary(newShift);
      setShowStartModal(false);
    } catch (err) {
      console.error('[ShiftManagement] Error starting shift:', err);
      alert('Lỗi mở ca: ' + (err.message || 'Không xác định'));
    }
  };

  const handleOpenEndModal = () => {
    setEndForm({ actualCashCount: '', note: '' });
    setShowEndModal(true);
  };

  const handleEndShift = async () => {
    if (!openShift) return;
    try {
      console.log('[ShiftManagement] Ending shift:', openShift.id);
      const result = await endShift(openShift.id, {
        actualCash: parseFloat(endForm.actualCashCount) || 0,
        note: endForm.note,
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
      });
      setShifts((prev) => prev.map((s) => (s.id === openShift.id ? updatedShift : s)));
      setShiftSummary(null);
      setShowEndModal(false);

      // Cập nhật tên thu ngân trong localStorage
      saveCashier(openShift.id, openShift.cashier);

      // Xóa shift khỏi sessionStorage
      sessionStorage.removeItem('pos_active_shift');
    } catch (err) {
      console.error('[ShiftManagement] Error ending shift:', err);
      alert('Lỗi chốt ca: ' + (err.message || 'Không xác định'));
    }
  };

  const handleViewDetail = async (shift) => {
    setSelectedShift(shift);
    setSelectedShiftOrders([]);
    setShowDetailModal(true);
    setDetailOrdersLoading(true);

    // Fetch orders trong khoảng thời gian của ca
    try {
      const ordersData = await getOrders({ status: 'Completed' });
      const rawOrders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.items || ordersData?.data || [];
      const shiftStart = new Date(shift.startedAt);
      const shiftEnd = shift.endedAt ? new Date(shift.endedAt) : new Date();

      const orders = rawOrders
        .filter((o) => {
          const d = new Date(o.createdAt || o.date || o.invoiceDate || '');
          return !isNaN(d.getTime()) && d >= shiftStart && d <= shiftEnd;
        })
        .map((o) => ({
          id: o.invoiceCode || o.invoiceId || o.id || '',
          invoiceCode: o.invoiceCode || o.id || '',
          createdAt: o.createdAt || o.date || '',
          customerName: o.customerName || o.customer || 'Khách lẻ',
          totalAmount: parseFloat(o.totalAmount || o.total || o.grandTotal || 0),
          paymentMethod: o.paymentMethod || '',
        }));
      setSelectedShiftOrders(orders);
    } catch (err) {
      console.error('[ShiftManagement] Lỗi load orders for detail:', err);
    } finally {
      setDetailOrdersLoading(false);
    }
  };

  // ---- Lọc & thống kê ----
  const filteredShifts = useMemo(() => {
    if (!dateFilter) return shifts;
    return shifts.filter((s) => s.date === dateFilter);
  }, [shifts, dateFilter]);

  const totalPages = Math.ceil(filteredShifts.length / pageSize);
  const paginatedShifts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShifts.slice(start, start + pageSize);
  }, [filteredShifts, currentPage, pageSize]);

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
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý ca bán hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Mở ca, theo dõi đơn hàng và chốt ca cuối ngày
          </p>
        </div>
        <div className="flex gap-3">
          {!isShiftActive ? (
            <Button variant="success" onClick={handleOpenStartModal}>
              Mở ca mới
            </Button>
          ) : (
            <Button variant="danger" onClick={handleOpenEndModal}>
              Chốt ca
            </Button>
          )}
        </div>
      </div>

      {/* Panel ca đang mở */}
      {isShiftActive && displayShift && (
        <Card className="border-l-4 border-l-green-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ca đang mở</h2>
                  <p className="text-sm text-slate-500">
                    {displayShift.cashier} - Bắt đầu lúc {displayShift.startTime}
                  </p>
                </div>
              </div>
              <Badge variant="success" size="lg">
                Đang hoạt động
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="overflow-hidden rounded-lg bg-blue-50 p-4">
                <p className="truncate text-xs font-bold uppercase text-blue-600">Số dư đầu ca</p>
                <p className="mt-1 truncate text-lg font-extrabold text-blue-900">
                  {formatCurrency(displayShift.openingBalance)}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-slate-50 p-4">
                <p className="truncate text-xs font-bold uppercase text-slate-500">Đơn đã bán</p>
                <p className="mt-1 truncate text-lg font-extrabold text-[#004785]">
                  {displayShift.orderCount}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-green-50 p-4">
                <p className="truncate text-xs font-bold uppercase text-green-600">
                  Doanh số tạm tính
                </p>
                <p className="mt-1 truncate text-lg font-extrabold text-green-700">
                  {formatCurrency(displayShift.totalSales)}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-amber-50 p-4">
                <p className="truncate text-xs font-bold uppercase text-amber-600">
                  Số dư cuối dự kiến
                </p>
                <p className="mt-1 truncate text-lg font-extrabold text-amber-700">
                  {formatCurrency(displayShift.openingBalance + displayShift.totalSales)}
                </p>
              </div>
            </div>

            {/* Danh sách đơn đã bán trong ca - dạng thanh trượt 3 đơn */}
            {shiftOrders.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Đơn đã bán trong ca
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    {shiftOrders.length} đơn
                  </span>
                </div>
                <div
                  className="scrollbar-thin space-y-2 overflow-y-auto pr-1"
                  style={{ maxHeight: '11.5rem' }}
                >
                  {shiftOrders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0 font-mono text-xs font-bold text-[#004785]">
                          {o.invoiceCode}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {new Date(o.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="truncate text-xs text-slate-600">{o.customerName}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-bold text-green-600">
                          {formatCurrency(o.totalAmount)}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          {o.paymentMethod === 'CASH' || o.paymentMethod === 'Cash'
                            ? 'Tiền mặt'
                            : o.paymentMethod === 'TRANSFER' || o.paymentMethod === 'Transfer'
                              ? 'CK'
                              : o.paymentMethod === 'CARD' || o.paymentMethod === 'Card'
                                ? 'Thẻ'
                                : o.paymentMethod || '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {shiftOrders.length > 3 && (
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-medium text-slate-400">
                      ⋮ kéo xuống để xem thêm ⋮
                    </span>
                  </div>
                )}
              </div>
            )}
            {ordersLoading && (
              <div className="py-3 text-center text-xs text-slate-400">Đang tải đơn hàng...</div>
            )}
          </div>
        </Card>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#004785]">{totalShifts}</div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Tổng ca đã chốt
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Tổng doanh thu
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-purple-600">
              {formatCurrency(avgPerShift)}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Bình quân/ca
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-orange-600">{filteredShifts.length}</div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Tổng số ca
            </p>
          </div>
        </Card>
      </div>

      {/* Lịch sử ca */}
      <Card
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Lịch sử ca làm việc</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDateFilter(toLocalDateStr(new Date()))}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                  dateFilter === toLocalDateStr(new Date())
                    ? 'border-[#004785] bg-[#004785] text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredShifts.length)} trên {filteredShifts.length} ca
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (
                    totalPages > 7 &&
                    i !== 0 &&
                    i !== totalPages - 1 &&
                    Math.abs(currentPage - 1 - i) > 2
                  ) {
                    if (Math.abs(currentPage - 1 - i) === 3) {
                      return <span key={i} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 min-w-[32px] rounded-md px-2 text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-[#004785] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
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
                  ? Number(startForm.openingBalance).toLocaleString('vi-VN')
                  : ''
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, '');
                setStartForm((f) => ({ ...f, openingBalance: raw }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold focus:border-[#004785] focus:outline-none"
            />
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
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
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Chốt ca làm việc
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Kiểm tra số liệu và xác nhận kết thúc ca
            </p>
          </div>

          {/* Thông tin ca */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              THÔNG TIN CA
              <span className="ml-1.5 h-px flex-1 bg-slate-200" />
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
                  <p className="text-sm font-bold text-slate-900">{displayShift?.cashier || '-'}</p>
                  <p className="text-xs text-slate-400">Thu ngân</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{displayShift?.startTime || '-'}</p>
                <p className="text-xs text-slate-400">Giờ mở ca</p>
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
              <span className="ml-1.5 h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Số dư đầu ca
                </p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="truncate text-xl font-extrabold text-slate-900">
                    {formatCurrency(displayShift?.openingBalance || 0)}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">VNĐ</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
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
                      (displayShift?.openingBalance || 0) + (displayShift?.totalSales || 0)
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-amber-500">VNĐ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nhập liệu */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
              <span className="ml-1.5 h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Tiền mặt thực tế
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-300">
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
                      setEndForm((f) => ({ ...f, actualCashCount: raw }));
                    }}
                    className="w-full rounded-xl border-2 border-slate-200 py-3.5 pl-10 pr-4 text-base font-bold transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 [&::-webkit-inner-spin-button]:appearance-none"
                    maxLength={14}
                  />
                </div>
                {endForm.actualCashCount &&
                  (() => {
                    const expectedAmount =
                      (displayShift?.openingBalance || 0) + (displayShift?.totalSales || 0);
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
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  value={endForm.note}
                  onChange={(e) => setEndForm((f) => ({ ...f, note: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-[#004785] focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
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
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Thu ngân</p>
                <p className="mt-1 font-semibold">{selectedShift.cashier}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Giờ làm</p>
                <p className="mt-1 font-semibold">
                  {selectedShift.startTime} - {selectedShift.endTime}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Trạng thái
                </p>
                <p className="mt-1">
                  <Badge variant={selectedShift.status === 'closed' ? 'success' : 'warning'}>
                    {selectedShift.status === 'closed' ? 'Đã đóng' : 'Đang mở'}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Số liệu ca
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Số dư đầu</p>
                  <p className="mt-0.5 text-lg font-bold">
                    {formatCurrency(selectedShift.openingBalance)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
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
            {selectedShift.note && (
              <div className="border-t pt-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Ghi chú
                </h3>
                <p className="text-sm text-slate-700">{selectedShift.note}</p>
              </div>
            )}

            {/* Đơn đã bán trong ca */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Đơn đã bán trong ca
                {selectedShiftOrders.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({selectedShiftOrders.length} đơn)
                  </span>
                )}
              </h3>
              {detailOrdersLoading ? (
                <div className="py-4 text-center text-xs text-slate-400">Đang tải...</div>
              ) : selectedShiftOrders.length > 0 ? (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {selectedShiftOrders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0 font-mono text-xs font-bold text-[#004785]">
                          {o.invoiceCode}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {new Date(o.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="truncate text-xs text-slate-600">{o.customerName}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-bold text-green-600">
                          {formatCurrency(o.totalAmount)}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {o.paymentMethod === 'CASH' || o.paymentMethod === 'Cash'
                            ? 'Tiền mặt'
                            : o.paymentMethod === 'TRANSFER' || o.paymentMethod === 'Transfer'
                              ? 'CK'
                              : o.paymentMethod === 'CARD' || o.paymentMethod === 'Card'
                                ? 'Thẻ'
                                : o.paymentMethod || '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">Không có đơn nào trong ca</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftManagement;
