/**
 * ShiftManagement Page - Quản lý ca bán hàng
 * API: /pos/shifts - GET list, POST start, GET summary, POST end
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
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

const CASHIERS = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];

// Map API shift sang format local
const mapShift = (s) => ({
  id: s.shiftId || s.id,
  date: s.startedAt ? new Date(s.startedAt).toLocaleDateString('vi-VN') : '-',
  cashier: s.userName || s.cashier || 'Thu ngân',
  startTime: s.startedAt
    ? new Date(s.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '-',
  endTime: s.endedAt
    ? new Date(s.endedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : 'Đang mở',
  openingBalance: parseFloat(s.openingBalance || 0),
  closingBalance: parseFloat(s.actualCash || s.closingBalance || 0),
  actualCashCount: parseFloat(s.actualCash || 0),
  cashVariance: parseFloat(s.variance || s.cashVariance || 0),
  totalSales: parseFloat(s.totalRevenue || s.totalSales || 0),
  cashSales: parseFloat(s.totalCash || s.cashSales || 0),
  cardSales: parseFloat(s.totalCard || s.cardSales || 0),
  transferSales: parseFloat(s.totalTransfer || s.transferSales || 0),
  orderCount: parseInt(s.totalOrders || s.orderCount || 0),
  status: s.status === 'OPEN' ? 'open' : 'closed',
  note: s.note || '',
  shiftData: s,
});

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
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ca đang mở
  const openShift = useMemo(() => shifts.find((s) => s.status === 'open'), [shifts]);
  const isShiftActive = !!openShift;

  // Summary của ca đang mở (để hiển thị realtime)
  const [shiftSummary, setShiftSummary] = useState(null);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const [startForm, setStartForm] = useState({ cashier: CASHIERS[0], openingBalance: '1000000' });
  const [endForm, setEndForm] = useState({ actualCashCount: '', note: '' });

  // Load shifts từ API
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShifts();
      const items = Array.isArray(data) ? data : data?.items || [];
      if (items.length > 0) {
        setShifts(items.map(mapShift));
      } else {
        setShifts(MOCK_SHIFTS.map(mapShift));
      }
    } catch (err) {
      console.error('Lỗi load shifts:', err);
      setError(err.message);
      setShifts(MOCK_SHIFTS.map(mapShift));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load shift summary và orders khi có ca đang mở
  const fetchShiftSummary = useCallback(async () => {
    if (!openShift) {
      setShiftSummary(null);
      return;
    }
    try {
      // Load orders của ca (từ shift startedAt đến hiện tại)
      const startDate = new Date(openShift.startedAt);
      const ordersData = await getOrders({
        from: startDate.toISOString().split('T')[0],
        status: 'Completed',
      });
      const orders = Array.isArray(ordersData) ? ordersData : ordersData?.items || [];

      // Tính stats realtime từ orders
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const orderCount = orders.length;
      const cashSales = orders
        .filter((o) => o.paymentMethod === 'Cash')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const transferSales = orders
        .filter((o) => o.paymentMethod === 'Transfer')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setShiftSummary({
        ...openShift,
        totalRevenue,
        orderCount,
        cashSales,
        transferSales,
      });
    } catch (err) {
      console.error('Lỗi load shift orders:', err);
      setShiftSummary(openShift);
    }
  }, [openShift]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    if (openShift) {
      fetchShiftSummary();
      // Poll mỗi 10s để cập nhật realtime
      const interval = setInterval(fetchShiftSummary, 10000);
      return () => clearInterval(interval);
    } else {
      setShiftSummary(null);
    }
  }, [openShift, fetchShiftSummary]);

  // Lấy ca hiển thị (summary nếu đang mở, hoặc shift từ list)
  const displayShift = shiftSummary || openShift;

  // ---- Handlers ----
  const handleOpenStartModal = () => {
    setStartForm({ cashier: CASHIERS[0], openingBalance: '1000000' });
    setShowStartModal(true);
  };

  const handleStartShift = async () => {
    if (!startForm.cashier || !startForm.openingBalance) return;
    try {
      const result = await startShift({
        openingBalance: parseFloat(startForm.openingBalance),
      });
      const newShift = mapShift({ ...result, userName: startForm.cashier });
      setShifts((prev) => [newShift, ...prev]);
      setShiftSummary(newShift);
      setShowStartModal(false);
    } catch (err) {
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
      const result = await endShift(openShift.id, {
        actualCash: parseFloat(endForm.actualCashCount) || 0,
        note: endForm.note,
      });
      // Cập nhật shift trong danh sách
      const updatedShift = mapShift({ ...result, userName: openShift.cashier });
      setShifts((prev) => prev.map((s) => (s.id === openShift.id ? updatedShift : s)));
      setShiftSummary(null);
      setShowEndModal(false);
    } catch (err) {
      alert('Lỗi chốt ca: ' + (err.message || 'Không xác định'));
    }
  };

  const handleViewDetail = (shift) => {
    setSelectedShift(shift);
    setShowDetailModal(true);
  };

  // ---- Lọc & thống kê ----
  const filteredShifts = useMemo(() => {
    if (!dateFilter) return shifts;
    return shifts.filter((s) => s.date === dateFilter);
  }, [shifts, dateFilter]);

  const closedShifts = shifts.filter((s) => s.status === 'closed');
  const totalShifts = closedShifts.length;
  const totalRevenue = closedShifts.reduce((sum, s) => sum + s.totalSales, 0);
  const avgPerShift = totalShifts > 0 ? totalRevenue / totalShifts : 0;

  const columns = [
    { key: 'date', header: 'Ngày', width: '120px' },
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
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase text-blue-600">Số dư đầu ca</p>
                <p className="mt-1 text-xl font-extrabold text-blue-900">
                  {formatCurrency(displayShift.openingBalance)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Đơn đã bán</p>
                <p className="mt-1 text-xl font-extrabold text-[#004785]">
                  {displayShift.orderCount}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-xs font-bold uppercase text-green-600">Doanh số tạm tính</p>
                <p className="mt-1 text-xl font-extrabold text-green-700">
                  {formatCurrency(displayShift.totalSales)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase text-amber-600">Số dư cuối dự kiến</p>
                <p className="mt-1 text-xl font-extrabold text-amber-700">
                  {formatCurrency(displayShift.openingBalance + displayShift.totalSales)}
                </p>
              </div>
            </div>
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
            <div className="text-2xl font-extrabold text-orange-600">{shifts.length}</div>
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
            <div className="w-full sm:w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        }
        padding="p-0"
      >
        <Table
          columns={columns}
          data={filteredShifts}
          loading={loading}
          emptyMessage={error ? `Lỗi: ${error}` : 'Chưa có ca làm việc nào'}
        />
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
        title="Chốt ca làm việc"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEndModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleEndShift}>
              Xác nhận chốt ca
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Số dư đầu ca</p>
              <p className="mt-0.5 font-bold">
                {formatCurrency(displayShift?.openingBalance || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xs text-green-700">Doanh số</p>
              <p className="mt-0.5 font-bold text-green-700">
                {formatCurrency(displayShift?.totalSales || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-xs text-amber-700">Số dư cuối dự kiến</p>
              <p className="mt-0.5 font-bold text-amber-700">
                {formatCurrency(
                  (displayShift?.openingBalance || 0) + (displayShift?.totalSales || 0)
                )}
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tiền mặt thực tế kiểm đếm (VNĐ)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số tiền mặt đếm được"
              value={
                endForm.actualCashCount
                  ? Number(endForm.actualCashCount).toLocaleString('vi-VN')
                  : ''
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, '');
                setEndForm((f) => ({ ...f, actualCashCount: raw }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold focus:border-[#004785] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <textarea
              rows={2}
              placeholder="Ghi chú về ca làm việc"
              value={endForm.note}
              onChange={(e) => setEndForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Chi tiết ca */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Chi tiết ca - ${selectedShift?.date || ''}`}
        size="2xl"
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
                    {selectedShift.status === 'closed' ? 'Đã đóng' : 'Đ*{selectedShift.status}'}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftManagement;
