import { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { getRevenueByTimeReport, getProductProfitReport } from '../services/reportService';
import { useReport } from '../hooks/useReport';

// Import Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const OwnerReports = () => {
  // Set default: 30 ngày gần nhất
  const defaultToDate = new Date().toISOString().split('T')[0];
  const defaultFromDate = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split('T')[0];

  const [dateFrom, setDateFrom] = useState(defaultFromDate);
  const [dateTo, setDateTo] = useState(defaultToDate);
  const [timeGrouping, setTimeGrouping] = useState('day');

  // Khởi tạo Hooks
  const {
    data: revenueData,
    isLoading: loadingRevenue,
    execute: fetchRevenue,
  } = useReport(getRevenueByTimeReport);
  const {
    data: profitData,
    isLoading: loadingProfit,
    execute: fetchProfit,
  } = useReport(getProductProfitReport);

  // Hàm gọi đồng loạt các báo cáo
  const loadReports = () => {
    fetchRevenue({
      fromDate: dateFrom,
      toDate: dateTo,
      timeGrouping: timeGrouping,
      branchId: null, // Null để API tự lấy theo token
    });

    fetchProfit({
      fromDate: dateFrom,
      toDate: dateTo,
      sortBy: 'profit',
      pageNumber: 1, // Tạm fix cứng page 1, bạn có thể thêm state cho pagination sau
      pageSize: 10,
      branchId: null,
    });
  };

  // Load data lần đầu khi mount
  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cấu hình cột cho Table Lợi nhuận sản phẩm
  const profitColumns = [
    { key: 'productCode', header: 'Mã SP', width: '120px' },
    { key: 'productName', header: 'Tên sản phẩm' },
    {
      key: 'quantitySold',
      header: 'SL Bán',
      render: (v) => <span className="font-medium text-slate-900">{v}</span>,
    },
    { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
    { key: 'cost', header: 'Giá vốn', render: (v) => formatCurrency(v) },
    {
      key: 'profit',
      header: 'Lợi nhuận',
      render: (v) => <span className="font-bold text-green-600">{formatCurrency(v)}</span>,
    },
    {
      key: 'profitMargin',
      header: 'Tỷ suất',
      render: (v) => <span className="font-medium text-purple-600">{v}%</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tổng quan Kinh doanh</h1>
          <p className="mt-1 text-sm text-slate-500">
            Báo cáo doanh thu và lợi nhuận toàn hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <label className="mb-1 block text-sm font-medium text-slate-700">Gom nhóm</label>
            <select
              value={timeGrouping}
              onChange={(e) => setTimeGrouping(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            >
              <option value="day">Theo Ngày</option>
              <option value="week">Theo Tuần</option>
              <option value="month">Theo Tháng</option>
            </select>
          </div>
          <Input
            type="date"
            label="Từ ngày"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            label="Đến ngày"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button variant="primary" onClick={loadReports}>
            Lọc Dữ Liệu
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card padding="p-5" className="border-l-4 border-l-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
            Tổng Doanh Thu
          </p>
          <p className="mt-1 text-2xl font-extrabold text-blue-700">
            {revenueData ? formatCurrency(revenueData.totalRevenue) : '0 đ'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Từ {revenueData?.totalOrders || 0} đơn hàng</p>
        </Card>
        <Card padding="p-5" className="border-l-4 border-l-red-500">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
            Tổng Giá Vốn
          </p>
          <p className="mt-1 text-2xl font-extrabold text-red-600">
            {profitData ? formatCurrency(profitData.totalCost) : '0 đ'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Chi phí nhập hàng</p>
        </Card>
        <Card padding="p-5" className="border-l-4 border-l-green-500">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
            Tổng Lợi Nhuận
          </p>
          <p className="mt-1 text-2xl font-extrabold text-green-600">
            {profitData ? formatCurrency(profitData.totalProfit) : '0 đ'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Sau khi trừ giá vốn</p>
        </Card>
        <Card padding="p-5" className="border-l-4 border-l-purple-500">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
            Tỷ Suất LN Bình Quân
          </p>
          <p className="mt-1 text-2xl font-extrabold text-purple-600">
            {profitData ? `${profitData.averageProfitMargin.toFixed(1)}%` : '0 %'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Biên lợi nhuận gộp</p>
        </Card>
      </div>

      {/* Biểu đồ Doanh Thu */}
      <Card header={<h2 className="text-lg font-bold text-slate-800">Biểu đồ doanh thu</h2>}>
        <div className="h-80 w-full">
          {loadingRevenue ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004785]" />
            </div>
          ) : revenueData?.chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData.chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="timeKey"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Chưa có dữ liệu biểu đồ
            </div>
          )}
        </div>
      </Card>

      {/* Bảng Top Lợi Nhuận */}
      <Card
        header={
          <h2 className="text-lg font-bold text-slate-800">Hiệu quả theo sản phẩm (Top 10)</h2>
        }
        padding="p-0"
      >
        <Table
          columns={profitColumns}
          data={profitData?.items || []}
          loading={loadingProfit}
          emptyMessage="Không có dữ liệu giao dịch trong thời gian này"
        />
      </Card>
    </div>
  );
};

export default OwnerReports;
