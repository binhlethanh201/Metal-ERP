import { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueHelpModal } from './RevenueHelpModal';

export const RevenueByTimeReport = ({ data, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showHelp, setShowHelp] = useState(false);

  const items = useMemo(() => data?.tableData || [], [data?.tableData]);
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  if (!data) return null;

  const revenueTableColumns = [
    {
      key: 'timeKey',
      header: 'Thời gian',
      render: (v) => <span className="font-semibold text-slate-800 dark:text-[#e5e5e5]">{v}</span>,
    },
    { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
    { key: 'totalCost', header: 'Tổng giá vốn', render: (v) => formatCurrency(v) },
    {
      key: 'grossProfit',
      header: 'Lợi nhuận gộp',
      render: (v) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span>,
    },
    {
      key: 'profitMargin',
      header: 'Tỷ suất lợi nhuận (%)',
      render: (v) => <span className="font-semibold text-slate-800 dark:text-[#e5e5e5]">{((v ?? 0)).toFixed(2)}%</span>,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#808080]">Chỉ số tổng quan</span>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
        >
          <Icon name="lightbulb" size={14} /> Cách tính
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Tổng doanh thu
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#004785]">
            {formatCurrency(data.totalRevenue)}
          </p>
        </Card>

        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Tổng số đơn
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">{data.totalOrders}</p>
        </Card>

        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Tổng lợi nhuận gộp
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {formatCurrency(data.totalGrossProfit || 0)}
          </p>
        </Card>

        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Tỷ suất lợi nhuận TB
          </p>
          <p className="mt-1 text-2xl font-extrabold text-amber-600">
            {((data.averageProfitMargin || 0)).toFixed(2)}%
          </p>
        </Card>
      </div>

      <Card header={<h2 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">Biểu đồ doanh thu theo thời gian</h2>}>
        {data.chartData?.length ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="timeKey"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-400 dark:text-[#808080]">
            Không có dữ liệu biểu đồ
          </div>
        )}
      </Card>

      <Card padding="p-0">
        <Table
          columns={revenueTableColumns}
          data={paginatedItems}
          loading={isLoading}
          emptyMessage="Chưa có dữ liệu"
        />
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]">
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, items.length)} trong tổng số {items.length} dòng</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]">
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">Trang {currentPage} / {totalPages}</div>
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]">
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <RevenueHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};

export default RevenueByTimeReport;
