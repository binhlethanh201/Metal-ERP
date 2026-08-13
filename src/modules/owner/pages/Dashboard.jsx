import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Icon from '../../../shared/components/Icon';
import KPICard from '../components/dashboard/KPICard';
import FinanceMetric from '../components/dashboard/FinanceMetric';
import useOwnerDashboard from '../hooks/useOwnerDashboard';
import { fmtVND, fmtInt, fmtPct, fmtPeriod } from '../utils/dashboardUtils';

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
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-primary">
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

/* ─── Mini metric card (dùng trong các section công nợ, thanh toán) ─── */
const MiniMetric = ({ icon, label, value, sub, color = 'text-slate-800', bg = 'bg-slate-50' }) => (
  <div className={`rounded-lg p-4 ${bg}`}>
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">
      <Icon name={icon} className="text-sm" />
      {label}
    </div>
    <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    {sub && <p className="mt-0.5 text-[10px] text-slate-500 dark:text-[#999999]">{sub}</p>}
  </div>
);

/* ════════════════════════════════════════════════════════ */
const OwnerDashboard = () => {
  const { data, loading, error, refetch } = useOwnerDashboard();

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <Icon name="CircleAlert" className="text-4xl text-red-400" />
        <p className="font-semibold text-slate-700 dark:text-[#b3b3b3]">Không thể tải dữ liệu dashboard</p>
        <p className="text-sm text-slate-500 dark:text-[#999999]">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:brightness-110"
        >
          Thử lại
        </button>
      </div>
    );
  }

  /* ── Dữ liệu biểu đồ: ưu tiên 30 ngày, fallback về 12 tháng ── */
  const has30DayTrend = (data?.revenueTrendLast30Days ?? []).length > 0;
  const trendRaw = has30DayTrend
    ? data.revenueTrendLast30Days
    : (data?.revenueTrendLast12Months ?? []);
  const trendChart = trendRaw.map((r) => ({
    period: has30DayTrend ? r.period : fmtPeriod(r.period),
    doanhThu: r.amount,
  }));
  const chartTitle = has30DayTrend
    ? 'Doanh thu 30 ngày gần nhất'
    : 'Doanh thu & Chi phí 12 tháng gần nhất';

  /* ── Phân tích thanh toán 30 ngày ── */
  const pb = data?.paymentBreakdownLast30Days;
  const paymentRows = [
    { label: 'Tiền mặt', amount: pb?.cashAmount ?? 0, count: pb?.cashCount ?? 0, color: 'bg-emerald-500' },
    { label: 'Chuyển khoản', amount: pb?.transferAmount ?? 0, count: pb?.transferCount ?? 0, color: 'bg-blue-500' },
    { label: 'Kết hợp', amount: pb?.combinedAmount ?? 0, count: pb?.combinedCount ?? 0, color: 'bg-violet-500' },
    { label: 'Trả nợ', amount: pb?.debtAmount ?? 0, count: pb?.debtCount ?? 0, color: 'bg-amber-500' },
  ].filter((r) => r.amount > 0 || r.count > 0);
  const totalPbAmount = paymentRows.reduce((s, r) => s + r.amount, 0);
  const showSupplierDebtPaid = (data?.supplierDebtPaidLast30Days ?? 0) > 0;

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      {/* ── Row 1: 4 KPI Cards (Hôm nay) ── */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <KPICard
              icon="receipt_long"
              label="Đơn hàng hôm nay"
              value={fmtInt(data?.totalOrdersToday)}
              unit="đơn"
              tone="navy"
            />
            <KPICard
              icon="payments"
              label="Doanh thu hôm nay"
              value={fmtVND(data?.totalRevenueToday, true)}
              unit="VNĐ"
              tone="green"
            />
            <KPICard
              icon="group"
              label="Khách mới hôm nay"
              value={fmtInt(data?.newCustomersToday)}
              unit="khách"
              tone="orange"
            />
            <KPICard
              icon="inventory_2"
              label="Hàng tồn kho thấp"
              value={fmtInt(data?.lowStockProductCount)}
              unit="sản phẩm"
              tone={data?.lowStockProductCount > 0 ? 'red' : 'green'}
            />
          </>
        )}
      </section>

      {/* ── Row 2: 3 Finance KPI (30 ngày) ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <FinanceMetric
              label="Doanh thu 30 ngày"
              value={fmtVND(data?.totalRevenueLast30Days, true)}
              subtitle={
                data?.totalOrdersLast30Days > 0
                  ? `${fmtInt(data?.totalOrdersLast30Days)} đơn · TB ${fmtVND(data?.averageDailyRevenueLast30Days, true)}/ngày`
                  : `7 ngày: ${fmtVND(data?.totalRevenueLast7Days, true)}`
              }
              tone="navy"
            />
            <FinanceMetric
              label="Lợi nhuận 30 ngày"
              value={fmtVND(data?.totalProfitLast30Days, true)}
              subtitle={
                data?.grossMarginPercentLast30Days > 0
                  ? `Biên gộp: ${fmtPct(data?.grossMarginPercentLast30Days)}`
                  : `7 ngày: ${fmtVND(data?.totalProfitLast7Days, true)}`
              }
              tone="green"
            />
            <FinanceMetric
              label="Chi phí 30 ngày"
              value={fmtVND(data?.totalExpenseLast30Days, true)}
              subtitle={
                data?.totalRefundAmountLast30Days > 0
                  ? `Hoàn trả: ${fmtVND(data?.totalRefundAmountLast30Days, true)}`
                  : `7 ngày: ${fmtVND(data?.totalExpenseLast7Days, true)}`
              }
              tone="slate"
            />
          </>
        )}
      </section>

      {/* ── Row 3: Biểu đồ doanh thu ── */}
      <Section title={chartTitle} icon="bar_chart">
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gDoanhThu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004785" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#004785" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(Math.floor(trendChart.length / 7), 0)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtVND(v, true)}
                width={68}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="doanhThu"
                name="Doanh thu"
                stroke="#004785"
                strokeWidth={2}
                fill="url(#gDoanhThu)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── Row 4: Phân tích thanh toán 30 ngày ── */}
      <Section title="Phân tích thanh toán (30 ngày)" icon="credit_card">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paymentRows.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu thanh toán</p>
              ) : (
                paymentRows.map((row) => {
                const pct = totalPbAmount > 0 ? (row.amount / totalPbAmount) * 100 : 0;
                return (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-3 w-3 rounded-full ${row.color}`} />
                        <span className="text-sm font-semibold text-slate-800 dark:text-[#e5e5e5]">
                          {row.label}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-[#a3a3a3]">
                          ({fmtInt(row.count)} giao dịch)
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                        {fmtVND(row.amount, true)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#272727]">
                      <div
                        className={`h-full rounded-full transition-all ${row.color}`}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })
              )}
            </div>
            {/* Đã trả Nhà Cung Cấp */}
            {showSupplierDebtPaid && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  <Icon name="local_shipping" className="text-base text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">
                    Đã trả Nhà Cung Cấp (30 ngày)
                  </span>
                </div>
                <span className="text-sm font-extrabold text-blue-900 dark:text-blue-400">
                  {fmtVND(data?.supplierDebtPaidLast30Days, true)}
                </span>
              </div>
            )}
          </>
        )}
      </Section>

      {/* ── Row 5: Top sản phẩm bán chạy + Top khách hàng ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top sản phẩm theo doanh thu */}
        <Section title="Top sản phẩm theo doanh thu (30 ngày)" icon="trending_up">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (data?.topProductsByRevenue ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-[#333333]">
              {(data?.topProductsByRevenue ?? []).map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-3 py-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-primary dark:bg-blue-900/30">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                      {p.productName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                      {p.categoryName} &middot; SL: {fmtInt(p.quantitySold)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-900 dark:text-blue-400">
                      {fmtVND(p.revenue, true)}
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">
                      Lãi {fmtVND(p.profit, true)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Top khách hàng */}
        <Section title="Top khách hàng (30 ngày)" icon="groups">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (data?.topCustomers ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-[#333333]">
              {(data?.topCustomers ?? []).map((c, idx) => (
                <div key={c.customerId} className="flex items-center gap-3 py-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-[10px] font-black text-amber-600 dark:bg-amber-900/30">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                      {c.customerName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                      {c.phoneNumber ?? '—'} &middot; {fmtInt(c.orderCount)} đơn
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800 dark:text-[#e5e5e5]">
                      {fmtVND(c.totalSpent, true)}
                    </p>
                    {c.totalDebt > 0 && (
                      <p className="text-[10px] text-red-500">Nợ {fmtVND(c.totalDebt, true)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ── Row 6: Tổng quan công nợ ── */}
      <Section title="Tổng quan công nợ" icon="account_balance">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MiniMetric
                icon="local_shipping"
                label="Nợ Nhà Cung Cấp"
                value={fmtVND(data?.totalSupplierDebt ?? 0, true)}
                color="text-blue-900 dark:text-blue-400"
                bg="bg-blue-50 dark:bg-blue-950/30"
              />
              <MiniMetric
                icon="receipt"
                label="Chi Phí Chờ Duyệt"
                value={fmtVND(data?.pendingExpenseAmount, true)}
                sub={`${fmtInt(data?.pendingExpenseCount)} phiếu chi`}
                color="text-amber-600 dark:text-amber-400"
                bg="bg-amber-50 dark:bg-amber-950/30"
              />
            </div>
          </>
        )}
      </Section>

      {/* ── Row 7: Top SP theo lợi nhuận + Danh mục bán chạy ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top sản phẩm theo lợi nhuận */}
        <Section title="Top sản phẩm theo lợi nhuận (30 ngày)" icon="savings">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (data?.topProductsByProfit ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-[#333333]">
              {(data?.topProductsByProfit ?? []).map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-3 py-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-black text-green-600 dark:bg-green-900/30">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                      {p.productName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                      {p.categoryName} &middot; SL: {fmtInt(p.quantitySold)} &middot; Biên: {fmtPct(p.profitMarginPercent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-green-600 dark:text-green-400">
                      {fmtVND(p.profit, true)}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#999999]">
                      DT {fmtVND(p.revenue, true)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Danh mục bán chạy */}
        <Section title="Danh mục bán chạy (30 ngày)" icon="category">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (data?.topCategoriesByRevenue ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const totalCatRev = (data?.topCategoriesByRevenue ?? []).reduce((s, c) => s + (c.revenue || 0), 0);
                const catColors = [
                  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500',
                ];
                return (data?.topCategoriesByRevenue ?? []).map((cat, i) => {
                  const pct = totalCatRev > 0 ? ((cat.revenue || 0) / totalCatRev) * 100 : 0;
                  return (
                    <div key={cat.categoryName}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${catColors[i % catColors.length]}`} />
                          <span className="text-xs font-semibold text-slate-700 dark:text-[#b3b3b3]">
                            {cat.categoryName || 'Sản phẩm chưa phân định danh mục'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                            ({fmtInt(cat.quantitySold)} sp)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                            {fmtVND(cat.revenue, true)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#272727]">
                        <div
                          className={`h-full rounded-full ${catColors[i % catColors.length]}`}
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </Section>
      </div>

      {/* ── Row 8: Hàng tồn kho thấp + Chi phí theo danh mục ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hàng tồn kho thấp */}
        <Section title="Hàng tồn kho thấp" icon="inventory">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (data?.lowStockProducts ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Icon name="check_circle" className="text-3xl text-emerald-400" />
              <p className="text-sm font-semibold text-slate-500 dark:text-[#999999]">Tất cả sản phẩm đủ hàng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#333333]">
                    {['Sản phẩm', 'Danh mục', 'Tồn', 'Tối thiểu'].map((h, i) => (
                      <th
                        key={h}
                        className={`pb-2 font-black uppercase tracking-wide text-slate-400 dark:text-[#808080] ${i > 0 ? 'text-right' : 'pr-3'} ${i > 0 && i < 3 ? 'px-2' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {(data?.lowStockProducts ?? []).map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50 dark:hover:bg-[#272727]">
                      <td className="py-2 pr-3">
                        <p className="max-w-[120px] truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                          {p.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-[#808080]">{p.productCode}</p>
                      </td>
                      <td className="px-2 text-right text-[10px] text-slate-400 dark:text-[#808080]">
                        {p.categoryName}
                      </td>
                      <td className="px-2 text-right text-xs font-semibold text-red-500">
                        {fmtInt(p.availableStock)}
                      </td>
                      <td className="px-2 text-right text-xs text-slate-500 dark:text-[#999999]">
                        {fmtInt(p.minimumStock)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Chi phí theo danh mục */}
        <Section title="Chi phí theo danh mục (30 ngày)" icon="pie_chart">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (data?.expenseByCategory ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu chi phí</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const totalExp = (data?.expenseByCategory ?? []).reduce((s, c) => s + (c.totalAmount || 0), 0);
                const expColors = [
                  'bg-slate-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-violet-500',
                  'bg-emerald-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
                ];
                return (data?.expenseByCategory ?? []).map((cat, i) => {
                  const pct = totalExp > 0 ? ((cat.totalAmount || 0) / totalExp) * 100 : 0;
                  return (
                    <div key={cat.categoryName}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${expColors[i % expColors.length]}`} />
                          <span className="text-xs font-semibold text-slate-700 dark:text-[#b3b3b3]">
                            {cat.categoryName}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                            ({fmtInt(cat.voucherCount)} phiếu)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                          {fmtVND(cat.totalAmount, true)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#272727]">
                        <div
                          className={`h-full rounded-full ${expColors[i % expColors.length]}`}
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </Section>
      </div>

      {/* ── Row 9: Ca bán bất thường ── */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Section title="Ca bán bất thường (Gần đây)" icon="error">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (data?.abnormalShifts ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Icon name="check_circle" className="text-3xl text-emerald-400" />
              <p className="text-sm font-semibold text-slate-500 dark:text-[#999999]">Tất cả các ca bán đều khớp tiền</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#333333]">
                    <th className="pb-2 font-black uppercase tracking-wide text-slate-400 dark:text-[#808080]">Mã ca / Người trực</th>
                    <th className="pb-2 font-black uppercase tracking-wide text-slate-400 dark:text-[#808080]">Chênh lệch</th>
                    <th className="pb-2 font-black uppercase tracking-wide text-slate-400 dark:text-[#808080]">Ngày chốt</th>
                    <th className="pb-2 text-right font-black uppercase tracking-wide text-slate-400 dark:text-[#808080]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {(data?.abnormalShifts ?? []).map((s) => (
                    <tr key={s.shiftId} className="hover:bg-slate-50 dark:hover:bg-[#272727]">
                      <td className="py-2 pr-3">
                        <p className="font-bold text-slate-800 dark:text-[#e5e5e5]">{s.shiftCode}</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#808080]">{s.userName}</p>
                      </td>
                      <td className={`py-2 pr-3 font-semibold ${s.variance > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {s.variance > 0 ? '+' : ''}{fmtVND(s.variance)}
                      </td>
                      <td className="py-2 pr-3 text-slate-500 dark:text-[#999999]">{s.endedAt ? new Date(s.endedAt).toLocaleString('vi-VN') : '—'}</td>
                      <td className="py-2 text-right text-slate-600 dark:text-[#b3b3b3]">{s.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default OwnerDashboard;
