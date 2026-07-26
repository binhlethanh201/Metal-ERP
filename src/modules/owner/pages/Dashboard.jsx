import React from 'react';
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

/* ════════════════════════════════════════════════════════ */
const InventoryDashboard = () => {
  const { data, loading, error, refetch } = useOwnerDashboard();

  /* ── Trạng thái lỗi ── */
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

  /* ── Dữ liệu cho biểu đồ 12 tháng ── */
  const trendChart = (data?.revenueTrendLast12Months ?? []).map((r, i) => ({
    period: fmtPeriod(r.period),
    doanhThu: r.amount,
    chiPhi: data?.expenseTrendLast12Months?.[i]?.amount ?? 0,
  }));

  /* ── Thanh toán 30 ngày ── */
  const pb = data?.paymentBreakdownLast30Days;
  const paymentRows = pb
    ? [
        { label: 'Tiền mặt', amount: pb.cashAmount, count: pb.cashCount, color: 'bg-green-500' },
        {
          label: 'Chuyển khoản',
          amount: pb.transferAmount,
          count: pb.transferCount,
          color: 'bg-blue-500',
        },
        {
          label: 'Kết hợp',
          amount: pb.combinedAmount,
          count: pb.combinedCount,
          color: 'bg-purple-500',
        },
        { label: 'Công nợ', amount: pb.debtAmount, count: pb.debtCount, color: 'bg-orange-500' },
      ]
    : [];
  const totalPbAmount = paymentRows.reduce((s, r) => s + r.amount, 0);

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      {/* ── 1. KPI Cards ── */}
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
              label="Khách hàng mới hôm nay"
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

      {/* ── 2. Finance Metrics (7 ngày & 30 ngày) ── */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <FinanceMetric
              label="Doanh thu 30 ngày"
              value={fmtVND(data?.totalRevenueLast30Days, true)}
              subtitle={`7 ngày: ${fmtVND(data?.totalRevenueLast7Days, true)}`}
              tone="navy"
            />
            <FinanceMetric
              label="Lợi nhuận 30 ngày"
              value={fmtVND(data?.totalProfitLast30Days, true)}
              subtitle={`7 ngày: ${fmtVND(data?.totalProfitLast7Days, true)}`}
              tone="green"
            />
            <FinanceMetric
              label="Biên lợi nhuận 30 ngày"
              value={fmtPct(data?.grossMarginPercentLast30Days)}
              progress={Math.min(data?.grossMarginPercentLast30Days ?? 0, 100)}
              tone="navy"
            />
            <FinanceMetric
              label="Chi phí 30 ngày"
              value={fmtVND(data?.totalExpenseLast30Days, true)}
              subtitle={`7 ngày: ${fmtVND(data?.totalExpenseLast7Days, true)}`}
              tone="slate"
            />
          </>
        )}
      </section>

      {/* ── 3. Biểu đồ Doanh thu & Chi phí 12 tháng ── */}
      <Section title="Doanh thu & Chi phí 12 tháng gần nhất" icon="bar_chart">
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
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
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtVND(v, true)}
                width={68}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="doanhThu"
                name="Doanh thu"
                stroke="#004785"
                strokeWidth={2}
                fill="url(#gDoanhThu)"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="chiPhi"
                name="Chi phí"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gChiPhi)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── 4 + 5. Thanh toán 30 ngày & Top sản phẩm ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Phân tích thanh toán */}
        <Section title="Phân tích thanh toán (30 ngày)" icon="credit_card">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
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
                      <div
                        className={`h-full rounded-full transition-all ${row.color}`}
                        style={{ width: `${pct}%` }}
                      />
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

        {/* Top sản phẩm theo doanh thu */}
        <Section title="Top sản phẩm theo doanh thu (30 ngày)" icon="trending_up">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-[#333333]">
              {(data?.topProductsByRevenue ?? []).map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-primary dark:bg-blue-900/30">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">{p.productName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                      {p.categoryName} · {fmtInt(p.quantitySold)} bán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-900">{fmtVND(p.revenue, true)}</p>
                    <p className="text-[10px] text-green-600">+{fmtVND(p.profit, true)}</p>
                  </div>
                </div>
              ))}
              {!loading && !data?.topProductsByRevenue?.length && (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
              )}
            </div>
          )}
        </Section>
      </div>

      {/* ── 6 + 7. Top khách hàng & Công nợ ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top khách hàng */}
        <Section title="Top khách hàng (30 ngày)" icon="MedalIcon">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-[#333333]">
              {(data?.topCustomers ?? []).map((c, idx) => (
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
              {!loading && !data?.topCustomers?.length && (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu</p>
              )}
            </div>
          )}
        </Section>

        {/* Công nợ khách hàng */}
        <Section title="Tổng quan công nợ khách hàng" icon="account_balance">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Tổng công nợ',
                    value: fmtVND(data?.customerDebtSummary?.totalDebt, true),
                    sub: `${fmtInt(data?.customerDebtSummary?.customerCount)} khách`,
                    color: 'text-blue-900',
                    bg: 'bg-blue-50',
                    icon: 'CircleDollarSign',
                  },
                  {
                    label: 'Nợ quá hạn',
                    value: fmtVND(data?.customerDebtSummary?.overdueDebt, true),
                    sub: `${fmtInt(data?.customerDebtSummary?.overdueCustomerCount)} khách`,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    icon: 'warning',
                  },
                  {
                    label: 'Đơn chờ xử lý',
                    value: fmtInt(data?.pendingOrderCount),
                    sub: 'đơn đang chờ',
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    icon: 'ClipboardClock',
                  },
                  {
                    label: 'Chi phí chờ duyệt',
                    value: fmtVND(data?.pendingExpenseAmount, true),
                    sub: `${fmtInt(data?.pendingExpenseCount)} phiếu`,
                    color: 'text-slate-700',
                    bg: 'bg-slate-50',
                    icon: 'receipt',
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg p-3 ${item.bg} dark:bg-opacity-20`}>
                    <div
                      className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]`}
                    >
                      <Icon name={item.icon} className="text-sm" />
                      {item.label}
                    </div>
                    <p className={`text-lg font-extrabold ${item.color}`}>{item.value}</p>
                    <p className="text-[10px] text-slate-500 dark:text-[#999999]">{item.sub}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>
      </div>

      {/* ── 8 + 9. Hàng tồn kho thấp & Chi phí theo danh mục ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hàng tồn kho thấp */}
        <Section title="Hàng tồn kho thấp" icon="inventory">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (data?.lowStockProducts ?? []).length === 0 ? (
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
                      <th
                        key={h}
                        className="pb-2 pr-3 font-black uppercase tracking-wide text-slate-400 dark:text-[#808080] last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {data.lowStockProducts.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50 dark:hover:bg-[#272727]">
                      <td className="py-2 pr-3">
                        <p className="max-w-[140px] truncate font-bold text-slate-800 dark:text-[#e5e5e5]">
                          {p.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-[#808080]">{p.categoryName}</p>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-orange-600">
                        {fmtInt(p.availableStock)}
                      </td>
                      <td className="py-2 pr-3 text-slate-500 dark:text-[#999999]">{fmtInt(p.minimumStock)}</td>
                      <td className="py-2 text-right font-black text-red-600">
                        -{fmtInt(p.shortage)}
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
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (data?.expenseByCategory ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400 dark:text-[#808080]">Chưa có dữ liệu chi phí</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const totalExp = data.expenseByCategory.reduce((s, c) => s + c.totalAmount, 0);
                return data.expenseByCategory.map((cat, i) => {
                  const pct = totalExp > 0 ? (cat.totalAmount / totalExp) * 100 : 0;
                  const colors = [
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-green-500',
                    'bg-red-400',
                    'bg-teal-500',
                    'bg-pink-500',
                    'bg-yellow-500',
                    'bg-indigo-500',
                    'bg-slate-400',
                  ];
                  return (
                    <div key={cat.categoryName}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
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
                          className={`h-full rounded-full ${colors[i % colors.length]}`}
                          style={{ width: `${pct}%` }}
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

      {/* ── Tóm tắt nhanh cuối trang ── */}
      {!loading && data && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { icon: 'store', label: 'Chi nhánh hoạt động', value: fmtInt(data.activeBranches) },
            { icon: 'inventory_2', label: 'Sản phẩm đang bán', value: fmtInt(data.activeProducts) },
            {
              icon: 'group',
              label: 'Khách hàng tích cực',
              value: fmtInt(data.activeCustomerCount),
            },
            {
              icon: 'trending_up',
              label: 'DT tb 7 ngày/ngày',
              value: fmtVND(data.averageDailyRevenueLast7Days, true),
            },
            {
              icon: 'shopping_bag',
              label: 'Giá trị đơn tb 30 ngày',
              value: fmtVND(data.averageOrderValueLast30Days, true),
            },
            {
              icon: 'UserPlus',
              label: 'KH mới 30 ngày',
              value: fmtInt(data.newCustomersLast30Days),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-[#333333] dark:bg-[#0f0f0f]"
            >
              <Icon name={item.icon} className="mb-1 text-xl text-slate-400 dark:text-[#808080]" />
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-[#808080]">{item.label}</p>
              <p className="mt-1 text-base font-extrabold text-blue-900">{item.value}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default InventoryDashboard;
