/**
 * ShiftManagement Page - Quản lý ca bán hàng
 * Nghiệp vụ: Mở ca (nhập số dư đầu) → Bán hàng → Đóng ca (đối chiếu tiền mặt)
 * TODO (FE): Kết nối API khi BE sẵn sàng — hiện chạy với MOCK DATA local.
 */
import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const CASHIERS = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];

// ── MOCK DATA ──────────────────────────────────────────────────
const MOCK_SHIFTS = [
  {
    id: 'SH-001',
    date: '2026-06-28',
    cashier: 'Nguyễn Văn A',
    startTime: '08:00',
    endTime: '17:00',
    openingBalance: 500000,
    closingBalance: 3200000,
    actualCashCount: 3200000,
    cashVariance: 0,
    totalSales: 5800000,
    cashSales: 2700000,
    cardSales: 1800000,
    transferSales: 1300000,
    orderCount: 14,
    status: 'closed',
    note: '',
  },
  {
    id: 'SH-002',
    date: '2026-06-27',
    cashier: 'Trần Thị B',
    startTime: '08:00',
    endTime: '17:30',
    openingBalance: 500000,
    closingBalance: 2900000,
    actualCashCount: 2850000,
    cashVariance: -50000,
    totalSales: 4200000,
    cashSales: 2400000,
    cardSales: 1200000,
    transferSales: 600000,
    orderCount: 10,
    status: 'closed',
    note: 'Thiếu 50k cần điều tra',
  },
];

export const ShiftManagement = () => {
  const [shifts, setShifts] = useState(MOCK_SHIFTS);
  const [loading] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [activeShiftStart, setActiveShiftStart] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const [startForm, setStartForm] = useState({ cashier: '', openingBalance: '' });
  const [endForm, setEndForm] = useState({ actualCashCount: '', note: '' });
  const [now, setNow] = useState(Date.now());

  // Cập nhật đồng hồ thời gian làm việc mỗi giây
  useEffect(() => {
    if (!isShiftActive) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isShiftActive]);

  // ── Tổng hợp số liệu ca đang mở ────────────────────────────
  const shiftSummary = useMemo(() => {
    const openingBalance = Number(startForm.openingBalance) || 0;
    // TODO (FE): lấy dữ liệu doanh số thực từ API khi kết nối
    const cashSales = 0;
    const cardSales = 0;
    const transferSales = 0;
    const totalSales = cashSales + cardSales + transferSales;
    const expectedClosingBalance = openingBalance + cashSales;
    const actualCash = Number(endForm.actualCashCount) || 0;
    const cashVariance = actualCash > 0 ? actualCash - expectedClosingBalance : 0;

    return {
      orderCount: 0,
      cashSales,
      cardSales,
      transferSales,
      totalSales,
      openingBalance,
      expectedClosingBalance,
      actualCash,
      cashVariance,
    };
  }, [startForm.openingBalance, endForm.actualCashCount]);

  const elapsedStr = useMemo(() => {
    if (!activeShiftStart) return '';
    const diff = Math.floor((now - activeShiftStart) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h}h ${m.toString().padStart(2, '0')}p ${s.toString().padStart(2, '0')}s`;
  }, [activeShiftStart, now]);

  // ── Handlers ────────────────────────────────────────────────
  const handleOpenStartModal = () => {
    setStartForm({ cashier: '', openingBalance: '' });
    setShowStartModal(true);
  };

  const handleOpenEndModal = () => {
    setEndForm({ actualCashCount: '', note: '' });
    setShowEndModal(true);
  };

  const handleStartShift = () => {
    // TODO (FE): gọi API POST /pos/shifts/start
    if (!startForm.cashier || !startForm.openingBalance) return;
    setIsShiftActive(true);
    setActiveShiftStart(Date.now());
    setShowStartModal(false);
  };

  const handleEndShift = () => {
    // TODO (FE): gọi API POST /pos/shifts/{id}/end
    if (!activeShiftStart) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const newShift = {
      id: 'SH-' + String(shifts.length + 1).padStart(3, '0'),
      date: dateStr,
      cashier: startForm.cashier,
      startTime: new Date(activeShiftStart).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      openingBalance: Number(startForm.openingBalance) || 0,
      closingBalance:
        Number(endForm.actualCashCount) || Number(startForm.openingBalance) || 0,
      actualCashCount: Number(endForm.actualCashCount) || 0,
      cashVariance: shiftSummary.cashVariance,
      totalSales: shiftSummary.totalSales,
      cashSales: shiftSummary.cashSales,
      cardSales: shiftSummary.cardSales,
      transferSales: shiftSummary.transferSales,
      orderCount: shiftSummary.orderCount,
      status: 'closed',
      note: endForm.note,
    };
    setShifts((prev) => [newShift, ...prev]);
    setIsShiftActive(false);
    setActiveShiftStart(null);
    setShowEndModal(false);
    setEndForm({ actualCashCount: '', note: '' });
  };

  const handleViewDetail = (shift) => {
    setSelectedShift(shift);
    setShowDetailModal(true);
  };

  // ── Lọc & thống kê ──────────────────────────────────────────
  const filteredShifts = useMemo(() => {
    if (!dateFilter) return shifts;
    return shifts.filter((s) => s.date === dateFilter);
  }, [shifts, dateFilter]);

  const totalShifts = shifts.filter((s) => s.status === 'closed').length;
  const totalRevenue = shifts.reduce((sum, s) => sum + s.totalSales, 0);
  const avgPerShift = totalShifts > 0 ? totalRevenue / totalShifts : 0;
  const totalHours = shifts.reduce((sum, s) => {
    if (!s.startTime || !s.endTime) return sum;
    const [sH, sM] = s.startTime.split(':').map(Number);
    const [eH, eM] = s.endTime.split(':').map(Number);
    const diff = eH + eM / 60 - (sH + sM / 60);
    return sum + (diff >= 0 ? diff : 0);
  }, 0);

  const {
    orderCount,
    cashSales,
    cardSales,
    transferSales,
    totalSales,
    openingBalance,
    expectedClosingBalance,
    cashVariance,
  } = shiftSummary;

  const columns = [
    { key: 'date', header: 'Ngày', width: '120px' },
    {
      key: 'cashier',
      header: 'Thu ngân',
      render: (v) => <span className="font-medium text-slate-900">{v}</span>,
    },
    {
      key: 'time',
      header: 'Giờ làm',
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
    { key: 'closingBalance', header: 'Số dư cuối', render: (v) => formatCurrency(v) },
    {
      key: 'cashVariance',
      header: 'Lệch',
      render: (v) =>
        v === 0 ? (
          <span className="text-green-600">Khớp</span>
        ) : (
          <span className={v > 0 ? 'font-medium text-blue-600' : 'font-medium text-red-600'}>
            {formatCurrency(v)}
          </span>
        ),
    },
    {
      key: 'status',
      header: 'TT',
      render: (v) => (
        <Badge variant={v === 'closed' ? 'success' : 'warning'}>
          {v === 'closed' ? 'Đã đóng' : 'Đang mở'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (_, r) => (
        <button
          type="button"
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
      {isShiftActive && (
        <Card className="border-l-4 border-l-green-500">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ca đang mở</h2>
                  <p className="text-sm text-slate-500">
                    {startForm.cashier || 'Thu ngân'} - Bắt đầu lúc{' '}
                    {activeShiftStart
                      ? new Date(activeShiftStart).toLocaleTimeString('vi-VN')
                      : ''}
                  </p>
                </div>
              </div>
              <Badge variant="success" size="lg">
                Đang hoạt động - {elapsedStr}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-blue-600">
                  Số dư đầu ca
                </p>
                <p className="mt-1 text-xl font-extrabold text-blue-900">
                  {formatCurrency(openingBalance)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  Đơn đã bán
                </p>
                <p className="mt-1 text-xl font-extrabold text-[#004785]">{orderCount}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-green-600">
                  Doanh số tạm tính
                </p>
                <p className="mt-1 text-xl font-extrabold text-green-700">
                  {formatCurrency(totalSales)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-amber-600">
                  Số dư cuối dự kiến
                </p>
                <p className="mt-1 text-xl font-extrabold text-amber-700">
                  {formatCurrency(expectedClosingBalance)}
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
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              Tổng ca đã chốt
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              Tổng doanh thu
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-purple-600">
              {formatCurrency(avgPerShift)}
            </div>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              Bình quân/ca
            </p>
          </div>
        </Card>
        <Card padding="p-5">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-orange-600">{totalHours.toFixed(1)}h</div>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              Tổng giờ làm
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
          emptyMessage="Chưa có ca làm việc nào được ghi nhận"
        />
      </Card>

      {/* ====== MODAL MỞ CA ====== */}
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
            <Button
              variant="success"
              onClick={handleStartShift}
              disabled={!startForm.cashier || !startForm.openingBalance}
            >
              Mở ca
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Thu ngân <span className="text-red-500">*</span>
            </label>
            <select
              value={startForm.cashier}
              onChange={(e) => setStartForm((f) => ({ ...f, cashier: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
            >
              <option value="">-- Chọn thu ngân --</option>
              {CASHIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tiền mặt đầu ca (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Số tiền mặt có sẵn trong ngăn kéo"
              value={
                startForm.openingBalance
                  ? Number(startForm.openingBalance).toLocaleString('vi-VN')
                  : ''
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, '');
                if (raw === '' || /^\d+$/.test(raw)) {
                  setStartForm((f) => ({ ...f, openingBalance: raw === '' ? '' : raw }));
                }
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold focus:border-[#004785] focus:outline-none"
            />
            {startForm.openingBalance && Number(startForm.openingBalance) < 100000 && (
              <p className="mt-1 text-xs text-amber-600">Số dư đầu ca nên từ 100.000đ trở lên</p>
            )}
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            Bắt đầu lúc{' '}
            <span className="font-semibold">{new Date().toLocaleTimeString('vi-VN')}</span> -{' '}
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </Modal>

      {/* ====== MODAL CHỐT CA ====== */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Chốt ca làm việc"
        size="3xl"
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
        <div className="space-y-5">
          {/* Thông tin ca */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Thu ngân</p>
              <p className="mt-0.5 font-bold text-slate-900">{startForm.cashier || 'Thu ngân'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Thời gian làm</p>
              <p className="mt-0.5 font-bold text-slate-900">{elapsedStr}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Số dư đầu ca</p>
              <p className="mt-0.5 font-bold text-slate-900">{formatCurrency(openingBalance)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Tổng đơn hàng</p>
              <p className="mt-0.5 font-bold text-[#004785]">{orderCount} đơn</p>
            </div>
          </div>

          {/* Tổng hợp doanh số */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.05em] text-slate-500">
              Hệ thống tự tổng hợp từ đơn hàng
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-amber-700">
                  Tiền mặt
                </p>
                <p className="mt-1 text-xl font-extrabold text-amber-800">
                  {formatCurrency(cashSales)}
                </p>
                <p className="text-xs text-amber-600">
                  {totalSales > 0 ? `${((cashSales / totalSales) * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="rounded-lg border-2 border-cyan-200 bg-cyan-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-cyan-700">Thẻ</p>
                <p className="mt-1 text-xl font-extrabold text-cyan-800">
                  {formatCurrency(cardSales)}
                </p>
                <p className="text-xs text-cyan-600">
                  {totalSales > 0 ? `${((cardSales / totalSales) * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-blue-700">
                  Chuyển khoản
                </p>
                <p className="mt-1 text-xl font-extrabold text-blue-800">
                  {formatCurrency(transferSales)}
                </p>
                <p className="text-xs text-blue-600">
                  {totalSales > 0
                    ? `${((transferSales / totalSales) * 100).toFixed(0)}%`
                    : '0%'}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-green-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.05em] text-green-700">
                Tổng doanh thu ca
              </p>
              <p className="text-2xl font-extrabold text-green-700">{formatCurrency(totalSales)}</p>
            </div>
          </div>

          {/* Số dư cuối ca dự kiến */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-blue-700">
                  Số dư cuối ca dự kiến
                </p>
                <p className="text-sm text-blue-600">
                  = Số dư đầu ({formatCurrency(openingBalance)}) + Tiền mặt thu được (
                  {formatCurrency(cashSales)})
                </p>
              </div>
              <p className="text-2xl font-extrabold text-blue-800">
                {formatCurrency(expectedClosingBalance)}
              </p>
            </div>
          </div>

          {/* Đối chiếu tiền mặt thực tế */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.05em] text-slate-500">
              Đối chiếu tiền mặt thực tế
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tiền mặt thực tế kiểm đếm (VNĐ)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Nhập số tiền mặt đếm được trong ngăn kéo"
                  value={
                    endForm.actualCashCount
                      ? Number(endForm.actualCashCount).toLocaleString('vi-VN')
                      : ''
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '');
                    if (raw === '' || /^\d+$/.test(raw)) {
                      setEndForm((f) => ({ ...f, actualCashCount: raw === '' ? '' : raw }));
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold focus:border-[#004785] focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Đếm toàn bộ tiền mặt trong ngăn kéo kể cả tiền lẻ
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-slate-700">Chênh lệch</p>
                {endForm.actualCashCount ? (
                  <>
                    <p
                      className={`mt-1 text-2xl font-extrabold ${cashVariance === 0 ? 'text-green-600' : cashVariance > 0 ? 'text-blue-600' : 'text-red-600'}`}
                    >
                      {cashVariance > 0 ? '+' : ''}
                      {formatCurrency(cashVariance)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {cashVariance === 0
                        ? 'Khớp với hệ thống'
                        : cashVariance > 0
                          ? 'Thừa so với hệ thống'
                          : 'Thiếu so với hệ thống'}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">
                    Nhập số tiền kiểm đếm để xem chênh lệch
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              rows={2}
              placeholder="Ghi chú về ca làm việc (nếu có)"
              value={endForm.note}
              onChange={(e) => setEndForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* ====== MODAL CHI TIẾT CA ====== */}
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
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
                  Thu ngân
                </p>
                <p className="mt-1 font-semibold text-slate-900">{selectedShift.cashier}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
                  Giờ làm việc
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedShift.startTime} - {selectedShift.endTime}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
                  Trạng thái
                </p>
                <Badge variant={selectedShift.status === 'closed' ? 'success' : 'warning'}>
                  {selectedShift.status === 'closed' ? 'Đã đóng' : 'Đang mở'}
                </Badge>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.05em] text-slate-500">
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

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.05em] text-slate-500">
                Theo hình thức thanh toán
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Tiền mặt',
                    val: selectedShift.cashSales,
                    color: 'border-amber-200 bg-amber-50',
                    text: 'text-amber-800',
                  },
                  {
                    label: 'Thẻ',
                    val: selectedShift.cardSales,
                    color: 'border-cyan-200 bg-cyan-50',
                    text: 'text-cyan-800',
                  },
                  {
                    label: 'Chuyển khoản',
                    val: selectedShift.transferSales,
                    color: 'border-blue-200 bg-blue-50',
                    text: 'text-blue-800',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border ${item.color} p-3 text-center`}
                  >
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className={`mt-0.5 text-lg font-bold ${item.text}`}>
                      {formatCurrency(item.val)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedShift.totalSales > 0
                        ? `${((item.val / selectedShift.totalSales) * 100).toFixed(0)}%`
                        : '0%'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.05em] text-slate-500">
                Đối chiếu
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-600">Số dư cuối dự kiến</p>
                  <p className="mt-0.5 text-lg font-bold text-blue-800">
                    {formatCurrency(selectedShift.openingBalance + selectedShift.cashSales)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Tiền mặt thực tế</p>
                  <p className="mt-0.5 text-lg font-bold">
                    {formatCurrency(selectedShift.actualCashCount)}
                  </p>
                  {selectedShift.cashVariance !== 0 && (
                    <p
                      className={`text-xs ${selectedShift.cashVariance > 0 ? 'text-blue-600' : 'text-red-600'}`}
                    >
                      {selectedShift.cashVariance > 0 ? 'Thừa ' : 'Thiếu '}
                      {formatCurrency(Math.abs(selectedShift.cashVariance))}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedShift.note && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
                  Ghi chú
                </p>
                <p className="mt-1 text-sm text-slate-600">{selectedShift.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftManagement;
