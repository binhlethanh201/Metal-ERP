import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import Icon from '../../../shared/components/Icon';
import KPICardOwner from '../../owner/components/dashboard/KPICard';
import FinanceMetric from '../../owner/components/dashboard/FinanceMetric';
import { fmtVND, fmtInt, fmtPct, fmtPeriod } from '../../owner/utils/dashboardUtils';
import {
  getDashboardStats,
  getRevenueChart,
  getRecentEvents,
  exportDashboard,
  getOverview,
} from '../services/adminService';

const formatCurrency = (value) => {
  if (value == null) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('vi-VN');
};

const formatMonth = (m) => new Date(2000, m - 1, 1).toLocaleDateString('vi-VN', { month: 'short' });

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', { hour12: false });
};

const levelClass = (level) => {
  switch ((level || '').toUpperCase()) {
    case 'ERROR':
    case 'WARN':
      return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-500';
    case 'INFO':
      return 'bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-slate-100 text-slate-900 dark:bg-[#272727] dark:text-[#e5e5e5]';
  }
};

/* ─── Skeleton loader ─── */
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-100 dark:bg-[#272727] ${className}`} />
);

/* ─── Section wrapper ─── */
const Section = ({ title, icon, action, children }) => (
  <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#333333]">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400">
            <Icon name={icon} className="text-base" />
          </span>
        )}
        <h4 className="text-[11px] font-black uppercase tracking-[0.06em] text-slate-500 dark:text-[#999999]">
          {title}
        </h4>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </article>
);

const KPICardAdmin = ({ icon, label, value, unit, tone }) => {
  let colors = 'bg-white dark:bg-[#0f0f0f] border-slate-200 dark:border-[#333333]';
  let iconColors = 'bg-slate-50 text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]';

  if (tone === 'navy') iconColors = 'bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400';
  if (tone === 'green') iconColors = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (tone === 'orange') iconColors = 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
  if (tone === 'red') iconColors = 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-500';

  return (
    <div className={`flex flex-col rounded-xl border p-5 shadow-sm ${colors}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColors}`}>
          <Icon name={icon} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-[#e5e5e5]">{value}</h3>
            {unit && <span className="text-xs font-bold text-slate-400 dark:text-[#666666]">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Custom tooltip cho recharts ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-[#333333] dark:bg-[#0f0f0f]">
      <p className="mb-1 font-bold text-slate-700 dark:text-[#b3b3b3]">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {fmtVND(p.value, true)}
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRevenueChart(new Date().getFullYear()),
      getRecentEvents(20),
      getOverview(),
    ])
      .then(([statsData, chartData, eventsData, overviewData]) => {
        setStats(statsData);
        setChart(Array.isArray(chartData) ? chartData : []);
        setRecentEvents(Array.isArray(eventsData) ? eventsData : []);
        setOverview(overviewData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Dashboard API error:', err);
        setError(err.message || 'Không tải được dữ liệu dashboard');
        setLoading(false);
      });
  }, []);

  const handleExport = async () => {
    try {
      const blob = await exportDashboard('excel');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mep-admin-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const maxRevenue = chart.reduce((max, p) => (p && p.revenue > max ? p.revenue : max), 0);

  /* ── Dữ liệu biểu đồ 12 tháng Owner ── */
  const trendChart = (overview?.revenueTrendLast12Months ?? []).map((r, i) => ({
    period: fmtPeriod(r.period),
    doanhThu: r.amount,
    chiPhi: overview?.expenseTrendLast12Months?.[i]?.amount ?? 0,
  }));

  /* ── Thanh toán 30 ngày ── */
  const pb = overview?.paymentBreakdownLast30Days;
  const paymentRows = pb
    ? [
      { label: 'Tiền mặt', amount: pb.cashAmount, count: pb.cashCount, color: 'bg-green-500' },
      { label: 'Chuyển khoản', amount: pb.transferAmount, count: pb.transferCount, color: 'bg-blue-500' },
      { label: 'Kết hợp', amount: pb.combinedAmount, count: pb.combinedCount, color: 'bg-purple-500' },
      { label: 'Công nợ', amount: pb.debtAmount, count: pb.debtCount, color: 'bg-orange-500' },
    ]
    : [];
  const totalPbAmount = paymentRows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10 text-slate-900 dark:text-[#e5e5e5]">
      {/* MAIN TITLE */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Hệ thống Phân tích Chỉ số &amp; Vận hành Lõi
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            M.E.P ADMIN DASHBOARD
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Icon name="download" size={16} /> Xuất Excel
        </button>
      </div>

      {error && (
        <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 text-center dark:border-red-900/30 dark:bg-red-900/10">
          <Icon name="error" className="text-2xl text-red-500" />
          <p className="font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!error && (
        <>
          {/* ========================================================================= */}
          {/* 1. ADMIN KPI CARDS */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              <>
                <KPICardAdmin
                  icon="store"
                  label="Tài Khoản Đang Hoạt Động"
                  value={formatCurrency(stats?.activeTenants)}
                  unit="tài khoản"
                  tone="navy"
                />
                <KPICardAdmin
                  icon="receipt_long"
                  label="Doanh Thu Hóa Đơn (30d)"
                  value={formatCurrency(stats?.subscriptionRevenue)}
                  unit="VNĐ"
                  tone="green"
                />
                <KPICardAdmin
                  icon="warning"
                  label="Cảnh Báo Công Nợ"
                  value={formatCurrency(stats?.overdueAlerts)}
                  unit="cảnh báo"
                  tone={stats?.overdueAlerts > 0 ? 'red' : 'green'}
                />
              </>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 2. OWNER KPI CARDS */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : (
              <>
                <KPICardOwner
                  icon="receipt_long"
                  label="Đơn hàng hôm nay"
                  value={fmtInt(overview?.totalOrdersToday)}
                  unit="đơn"
                  tone="navy"
                />
                <KPICardOwner
                  icon="payments"
                  label="Doanh thu hôm nay"
                  value={fmtVND(overview?.totalRevenueToday, true)}
                  unit="VNĐ"
                  tone="green"
                />
                <KPICardOwner
                  icon="group"
                  label="Khách hàng mới hôm nay"
                  value={fmtInt(overview?.newCustomersToday)}
                  unit="khách"
                  tone="orange"
                />
                <KPICardOwner
                  icon="inventory_2"
                  label="Hàng tồn kho thấp"
                  value={fmtInt(overview?.lowStockProductCount)}
                  unit="sản phẩm"
                  tone={overview?.lowStockProductCount > 0 ? 'red' : 'green'}
                />
              </>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            ) : (
              <>
                <FinanceMetric
                  label="Doanh thu 30 ngày"
                  value={fmtVND(overview?.totalRevenueLast30Days, true)}
                  subtitle={`7 ngày: ${fmtVND(overview?.totalRevenueLast7Days, true)}`}
                  tone="navy"
                />
                <FinanceMetric
                  label="Lợi nhuận 30 ngày"
                  value={fmtVND(overview?.totalProfitLast30Days, true)}
                  subtitle={`7 ngày: ${fmtVND(overview?.totalProfitLast7Days, true)}`}
                  tone="green"
                />
                <FinanceMetric
                  label="Biên lợi nhuận 30 ngày"
                  value={fmtPct(overview?.grossMarginPercentLast30Days)}
                  progress={Math.min(overview?.grossMarginPercentLast30Days ?? 0, 100)}
                  tone="navy"
                />
                <FinanceMetric
                  label="Chi phí 30 ngày"
                  value={fmtVND(overview?.totalExpenseLast30Days, true)}
                  subtitle={`7 ngày: ${fmtVND(overview?.totalExpenseLast7Days, true)}`}
                  tone="slate"
                />
              </>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 3. ADMIN QUICK ACTIONS & LOGS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Section title="Phím tắt tác vụ nhanh" icon="bolt">
                <div className="flex h-[280px] flex-wrap content-start gap-4">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="flex h-[120px] w-full sm:w-[calc(50%-8px)] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-[#004785] hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400">
                      <Icon name="groups" size={24} />
                    </div>
                    Quản lý Người Dùng
                  </button>
                  <button
                    onClick={() => navigate('/admin/notifications')}
                    className="flex h-[120px] w-full sm:w-[calc(50%-8px)] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-red-500 hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-red-500 dark:hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400">
                      <Icon name="campaign" size={24} />
                    </div>
                    Phát tin khẩn cấp
                  </button>
                  <button
                    onClick={() => navigate('/admin/logs')}
                    className="flex h-[120px] w-full sm:w-[calc(50%-8px)] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-slate-500 dark:hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-[#999999]">
                      <Icon name="terminal" size={24} />
                    </div>
                    Tra cứu Log máy chủ
                  </button>
                </div>
              </Section>
            </div>

            <div className="xl:col-span-1">
              <Section
                title="Hoạt động Quản trị gần đây"
                icon="history"
                action={
                  <button
                    onClick={() => navigate('/admin/logs')}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#004785] hover:underline dark:text-blue-400"
                  >
                    Xem tất cả
                  </button>
                }
              >
                <div className="no-scrollbar flex h-[280px] flex-col gap-3 overflow-y-auto pr-1">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                  ) : recentEvents.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-[#666666]">
                      <Icon name="inbox" className="mb-2 text-3xl" />
                      <p className="text-xs font-semibold">Chưa có hoạt động nào</p>
                    </div>
                  ) : (
                    recentEvents.map((event) => (
                      <div
                        key={event.logId}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-[#333333] dark:bg-[#1a1a1a] dark:hover:bg-[#272727]"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-black tracking-wider ${levelClass(event.level)}`}>
                            {event.action}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-[#666666]">
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-700 dark:text-[#b3b3b3]">
                          {event.description || '—'}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-[#999999]">
                          <Icon name="person" size={12} /> {event.userName || 'System'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Section>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. OWNER'S AREA CHART */}
          {/* ========================================================================= */}
          <Section title="Doanh thu & Chi phí 12 tháng gần nhất (Tổng hợp hệ thống)" icon="bar_chart">
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDoanhThu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004785" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#004785" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gChiPhi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtVND(v, true)} width={68} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#004785" strokeWidth={2} fill="url(#gDoanhThu)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="chiPhi" name="Chi phí" stroke="#f59e0b" strokeWidth={2} fill="url(#gChiPhi)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Section>

          {/* ========================================================================= */}
          {/* 6. OWNER'S GRIDS: PAYMENT & TOP PRODUCTS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title="Phân tích thanh toán (30 ngày)" icon="credit_card">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRows.map((row) => {
                    const pct = totalPbAmount > 0 ? (row.amount / totalPbAmount) * 100 : 0;
                    return (
                      <div key={row.label}>
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${row.color}`} />
                            <span className="text-xs font-semibold text-slate-700 dark:text-[#b3b3b3]">{row.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                              ({fmtInt(row.count)} đơn)
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                            {fmtVND(row.amount, true)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#272727]">
                          <div className={`h-full rounded-full transition-all ${row.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-right text-[10px] font-bold uppercase text-slate-400 dark:text-[#808080]">
                    Tổng: {fmtVND(totalPbAmount, true)}
                  </p>
                </div>
              )}
            </Section>

            <Section title="Top sản phẩm theo doanh thu (30 ngày)" icon="trending_up">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {(overview?.topProductsByRevenue ?? []).map((p, idx) => (
                    <div key={p.productId} className="flex items-center gap-3 py-2.5">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-[#004785] dark:bg-blue-900/30">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">{p.productName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                          {p.categoryName || 'Sản phẩm'} · {fmtInt(p.quantitySold)} bán
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-blue-900 dark:text-blue-400">{fmtVND(p.revenue, true)}</p>
                      </div>
                    </div>
                  ))}
                  {!overview?.topProductsByRevenue?.length && (
                    <p className="py-6 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
                  )}
                </div>
              )}
            </Section>
          </div>

          {/* ========================================================================= */}
          {/* 7. OWNER'S GRIDS: TOP CUSTOMERS & DEBT SUMMARY */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title="Top khách hàng (30 ngày)" icon="workspace_premium">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {(overview?.topCustomers ?? []).map((c, idx) => (
                    <div key={c.customerId} className="flex items-center gap-3 py-2.5">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-black text-orange-600 dark:bg-orange-900/30">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">{c.customerName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                          {c.phoneNumber ?? '—'} · {fmtInt(c.orderCount)} đơn
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-800 dark:text-[#e5e5e5]">
                          {fmtVND(c.totalSpent, true)}
                        </p>
                        {c.totalDebt > 0 && (
                          <p className="text-[10px] text-red-500">Nợ: {fmtVND(c.totalDebt, true)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {!overview?.topCustomers?.length && (
                    <p className="py-6 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
                  )}
                </div>
              )}
            </Section>

            <Section title="Tổng quan công nợ khách hàng" icon="account_balance">
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Tổng công nợ',
                      value: fmtVND(overview?.customerDebtSummary?.totalDebt, true),
                      sub: `${fmtInt(overview?.customerDebtSummary?.customerCount)} khách`,
                      color: 'text-blue-900 dark:text-blue-400',
                      bg: 'bg-blue-50 dark:bg-blue-900/20',
                      icon: 'payments',
                    },
                    {
                      label: 'Nợ quá hạn',
                      value: fmtVND(overview?.customerDebtSummary?.overdueDebt, true),
                      sub: `${fmtInt(overview?.customerDebtSummary?.overdueCustomerCount)} khách`,
                      color: 'text-red-600 dark:text-red-400',
                      bg: 'bg-red-50 dark:bg-red-900/20',
                      icon: 'warning',
                    },
                    {
                      label: 'Đơn chờ xử lý',
                      value: fmtInt(overview?.pendingOrderCount),
                      sub: 'đơn đang chờ',
                      color: 'text-orange-600 dark:text-orange-400',
                      bg: 'bg-orange-50 dark:bg-orange-900/20',
                      icon: 'schedule',
                    },
                    {
                      label: 'Chi phí chờ duyệt',
                      value: fmtVND(overview?.pendingExpenseAmount, true),
                      sub: `${fmtInt(overview?.pendingExpenseCount)} phiếu`,
                      color: 'text-slate-700 dark:text-slate-400',
                      bg: 'bg-slate-50 dark:bg-slate-800',
                      icon: 'receipt',
                    },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-3 ${item.bg}`}>
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                        <Icon name={item.icon} className="text-sm" />
                        {item.label}
                      </div>
                      <p className={`text-lg font-extrabold ${item.color}`}>{item.value}</p>
                      <p className="text-[10px] text-slate-500 dark:text-[#999999]">{item.sub}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ========================================================================= */}
          {/* 8. OWNER'S GRIDS: LOW STOCK & EXPENSE BY CATEGORY */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title="Hàng tồn kho thấp" icon="inventory">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (overview?.lowStockProducts ?? []).length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Icon name="check_circle" className="text-3xl text-green-400" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-[#999999]">Tất cả sản phẩm đủ hàng</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[#333333]">
                        {['Sản phẩm', 'Tồn', 'Tối thiểu', 'Thiếu'].map((h) => (
                          <th key={h} className="pb-2 pr-3 font-black uppercase tracking-wide text-slate-400 dark:text-[#808080] last:text-right">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                      {overview.lowStockProducts.map((p) => (
                        <tr key={p.productId} className="hover:bg-slate-50 dark:hover:bg-[#272727]">
                          <td className="py-2 pr-3">
                            <p className="max-w-[140px] truncate font-bold text-slate-800 dark:text-[#e5e5e5]">{p.productName}</p>
                          </td>
                          <td className="py-2 pr-3 font-semibold text-orange-600">{fmtInt(p.availableStock)}</td>
                          <td className="py-2 pr-3 text-slate-500 dark:text-[#999999]">{fmtInt(p.minimumStock)}</td>
                          <td className="py-2 text-right font-black text-red-600">-{fmtInt(p.shortage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section title="Chi phí theo danh mục (30 ngày)" icon="pie_chart">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (overview?.expenseByCategory ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu chi phí</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const totalExp = overview.expenseByCategory.reduce((s, c) => s + c.totalAmount, 0);
                    return overview.expenseByCategory.map((cat, i) => {
                      const pct = totalExp > 0 ? (cat.totalAmount / totalExp) * 100 : 0;
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-400', 'bg-teal-500'];
                      return (
                        <div key={cat.categoryName}>
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
                              <span className="text-xs font-semibold text-slate-700 dark:text-[#b3b3b3]">{cat.categoryName}</span>
                              <span className="text-[10px] text-slate-400 dark:text-[#808080]">({fmtInt(cat.voucherCount)} phiếu)</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">{fmtVND(cat.totalAmount, true)}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#272727]">
                            <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </Section>
          </div>

          {/* ========================================================================= */}
          {/* 9. QUICK SUMMARY */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {[
              { icon: 'inventory_2', label: 'Sản phẩm đang bán', value: fmtInt(overview?.activeProducts) },
              { icon: 'groups', label: 'KH tích cực', value: fmtInt(overview?.activeCustomerCount) },
              { icon: 'trending_up', label: 'DT tb 7 ngày/ngày', value: fmtVND(overview?.averageDailyRevenueLast7Days, true) },
              { icon: 'shopping_bag', label: 'Giá trị đơn tb 30d', value: fmtVND(overview?.averageOrderValueLast30Days, true) },
              { icon: 'person_add', label: 'KH mới 30 ngày', value: fmtInt(overview?.newCustomersLast30Days) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-[#333333] dark:bg-[#0f0f0f]">
                <Icon name={item.icon} className="mb-1 text-xl text-slate-400 dark:text-[#808080]" />
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-[#808080]">{item.label}</p>
                <p className="mt-1 text-base font-extrabold text-blue-900 dark:text-blue-400">{item.value}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
