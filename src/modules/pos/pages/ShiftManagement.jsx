/**
 * ShiftManagement Page - Quản lý ca bán hàng
 * Nghiệp vụ: Mở ca (nhập số dư đầu) -> Bán hàng (hệ thống tự ghi nhận từng đơn) -> Đóng ca (hệ thống tự tổng hợp, thu ngân chỉ kiểm đếm đối chiếu)
 */
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const MOCK_SHIFTS = [
  {
    id: 1,
    date: '2024-05-08',
    cashier: 'Nguyễn Văn A',
    startTime: '08:00',
    endTime: '16:00',
    openingBalance: 5000000,
    closingBalance: 8500000,
    actualCashCount: 6980000,
    cashVariance: -20000,
    totalSales: 3500000,
    cashSales: 2000000,
    cardSales: 1200000,
    transferSales: 300000,
    orderCount: 47,
    status: 'closed',
    note: '',
  },
  {
    id: 2,
    date: '2024-05-07',
    cashier: 'Trần Thị B',
    startTime: '13:00',
    endTime: '21:00',
    openingBalance: 3000000,
    closingBalance: 9200000,
    actualCashCount: 6800000,
    cashVariance: 0,
    totalSales: 6200000,
    cashSales: 3800000,
    cardSales: 2000000,
    transferSales: 400000,
    orderCount: 72,
    status: 'closed',
    note: 'Ca chiều đông khách',
  },
  {
    id: 3,
    date: '2024-05-07',
    cashier: 'Nguyễn Văn A',
    startTime: '08:00',
    endTime: '12:00',
    openingBalance: 5000000,
    closingBalance: 7300000,
    actualCashCount: 6500000,
    cashVariance: 0,
    totalSales: 2300000,
    cashSales: 1500000,
    cardSales: 600000,
    transferSales: 200000,
    orderCount: 31,
    status: 'closed',
    note: '',
  },
  {
    id: 4,
    date: '2024-05-06',
    cashier: 'Lê Văn C',
    startTime: '08:00',
    endTime: '16:00',
    openingBalance: 4000000,
    closingBalance: 7800000,
    actualCashCount: 6080000,
    cashVariance: -20000,
    totalSales: 3800000,
    cashSales: 2100000,
    cardSales: 1400000,
    transferSales: 300000,
    orderCount: 55,
    status: 'closed',
    note: '',
  },
  {
    id: 5,
    date: '2024-05-05',
    cashier: 'Nguyễn Văn A',
    startTime: '08:00',
    endTime: '16:00',
    openingBalance: 5000000,
    closingBalance: 8100000,
    actualCashCount: 6800000,
    cashVariance: 0,
    totalSales: 3100000,
    cashSales: 1800000,
    cardSales: 1000000,
    transferSales: 300000,
    orderCount: 42,
    status: 'closed',
    note: '',
  },
];

const CASHIERS = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];

const PAYMENT_METHODS = ['cash', 'card', 'transfer'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomAmount = () => {
  const amounts = [
    15000, 20000, 25000, 30000, 35000, 45000, 50000, 55000, 65000, 75000, 85000, 100000, 120000,
    150000, 200000, 250000, 350000, 500000, 750000, 1200000,
  ];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

export const ShiftManagement = () => {
  const [shifts, setShifts] = useState(MOCK_SHIFTS);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [activeShiftStart, setActiveShiftStart] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const [startForm, setStartForm] = useState({ cashier: '', openingBalance: '' });

  // Đơn hàng phát sinh trong ca đang mở (hệ thống tự ghi nhận)
  const [shiftOrders, setShiftOrders] = useState([]);
  const orderIntervalRef = useRef(null);

  // Form kết thúc ca: chỉ cần nhập tiền mặt thực tế kiểm đếm + ghi chú
  const [endForm, setEndForm] = useState({ actualCashCount: '', note: '' });

  // ---- Simulation: giả lập đơn hàng đến trong ca đang mở ----
  const addSimulatedOrder = useCallback(() => {
    const method = randomItem(PAYMENT_METHODS);
    const amount = randomAmount();
    setShiftOrders((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString('vi-VN'),
        amount,
        paymentMethod: method,
      },
    ]);
  }, []);

  useEffect(() => {
    if (isShiftActive) {
      addSimulatedOrder();
      orderIntervalRef.current = setInterval(() => {
        addSimulatedOrder();
      }, 8000);
    } else {
      clearInterval(orderIntervalRef.current);
      orderIntervalRef.current = null;
    }
    return () => clearInterval(orderIntervalRef.current);
  }, [isShiftActive, addSimulatedOrder]);

  // ---- Tổng hợp số liệu từ đơn hàng hệ thống ----
  const shiftSummary = useMemo(() => {
    const orderCount = shiftOrders.length;
    const cashSales = shiftOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((s, o) => s + o.amount, 0);
    const cardSales = shiftOrders
      .filter((o) => o.paymentMethod === 'card')
      .reduce((s, o) => s + o.amount, 0);
    const transferSales = shiftOrders
      .filter((o) => o.paymentMethod === 'transfer')
      .reduce((s, o) => s + o.amount, 0);
    const totalSales = cashSales + cardSales + transferSales;
    const openingBalance = Number(startForm.openingBalance) || 0;
    const expectedClosingBalance = openingBalance + cashSales;
    const actualCash = Number(endForm.actualCashCount) || 0;
    const cashVariance = actualCash > 0 ? actualCash - expectedClosingBalance : 0;

    return {
      orderCount,
      cashSales,
      cardSales,
      transferSales,
      totalSales,
      openingBalance,
      expectedClosingBalance,
      actualCash,
      cashVariance,
    };
  }, [shiftOrders, startForm.openingBalance, endForm.actualCashCount]);

  const elapsedStr = useMemo(() => {
    if (!activeShiftStart) return '';
    const diff = Math.floor((Date.now() - activeShiftStart.getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}p`;
  }, [activeShiftStart]);

  // ---- Handlers ----
  const handleOpenStartModal = () => {
    setStartForm({ cashier: '', openingBalance: '' });
    setShowStartModal(true);
  };

  const handleStartShift = () => {
    setIsShiftActive(true);
    setActiveShiftStart(new Date());
    setShiftOrders([]);
    setShowStartModal(false);
  };

  const handleOpenEndModal = () => {
    setEndForm({ actualCashCount: '', note: '' });
    setShowEndModal(true);
  };

  const handleEndShift = () => {
    const now = new Date();
    const st = activeShiftStart;
    const startTime = st
      ? `${st.getHours().toString().padStart(2, '0')}:${st.getMinutes().toString().padStart(2, '0')}`
      : '08:00';
    const endTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

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
    const actualCash = Number(endForm.actualCashCount) || expectedClosingBalance;

    const newShift = {
      id: Date.now(),
      date: now.toISOString().split('T')[0],
      cashier: startForm.cashier || 'Nguyễn Văn A',
      startTime,
      endTime,
      openingBalance,
      closingBalance: actualCash,
      actualCashCount: actualCash,
      cashVariance,
      totalSales,
      cashSales,
      cardSales,
      transferSales,
      orderCount,
      status: 'closed',
      note: endForm.note,
    };

    setShifts((prev) => [newShift, ...prev]);
    setIsShiftActive(false);
    setActiveShiftStart(null);
    setShiftOrders([]);
    setShowEndModal(false);
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

  const totalShifts = shifts.filter((s) => s.status === 'closed').length;
  const totalRevenue = shifts.reduce((sum, s) => sum + s.totalSales, 0);
  const avgPerShift = totalShifts > 0 ? totalRevenue / totalShifts : 0;
  const totalHours = shifts.reduce((sum, s) => {
    const [sH, sM] = s.startTime.split(':').map(Number);
    const [eH, eM] = s.endTime.split(':').map(Number);
    return sum + (eH + eM / 60 - (sH + sM / 60));
  }, 0);

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
                    {activeShiftStart?.toLocaleTimeString('vi-VN')}
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

            {/* Đơn hàng gần đây trong ca */}
            {shiftOrders.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-400">
                  Đơn hàng gần đây
                </p>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {shiftOrders
                    .slice(-8)
                    .reverse()
                    .map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded bg-slate-50 px-3 py-1.5 text-sm"
                      >
                        <span className="text-slate-500">{o.time}</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(o.amount)}
                        </span>
                        <Badge
                          variant={
                            o.paymentMethod === 'cash'
                              ? 'warning'
                              : o.paymentMethod === 'card'
                                ? 'info'
                                : 'primary'
                          }
                          size="sm"
                        >
                          {o.paymentMethod === 'cash'
                            ? 'Tiền mặt'
                            : o.paymentMethod === 'card'
                              ? 'Thẻ'
                              : 'CK'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
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
          <Input
            label="Tiền mặt đầu ca (VNĐ)"
            type="number"
            placeholder="Số tiền mặt có sẵn trong ngăn kéo"
            value={startForm.openingBalance}
            onChange={(e) => setStartForm((f) => ({ ...f, openingBalance: e.target.value }))}
            required
          />
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            Bắt đầu lúc{' '}
            <span className="font-semibold">{new Date().toLocaleTimeString('vi-VN')}</span> -{' '}
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </Modal>

      {/* ====== MODAL CHỐT CA (hệ thống tự tổng hợp) ====== */}
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

          {/* Tổng hợp doanh số từ hệ thống (chỉ xem, không sửa) */}
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
                  {totalSales > 0 ? `${((transferSales / totalSales) * 100).toFixed(0)}%` : '0%'}
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
              <Input
                label="Tiền mặt thực tế kiểm đếm (VNĐ)"
                type="number"
                placeholder="Nhập số tiền mặt đếm được trong ngăn kéo"
                value={endForm.actualCashCount}
                onChange={(e) => setEndForm((f) => ({ ...f, actualCashCount: e.target.value }))}
                hint="Đếm toàn bộ tiền mặt trong ngăn kéo kể cả tiền lẻ"
              />
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
                <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.05em] text-slate-500">
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
