import { useMemo } from 'react';
import {
  PackagePlus,
  PackageMinus,
  TrendingUp,
  TrendingDown,
  Clock,
  Warehouse,
} from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor,
  iconTextColor,
  trend,
  trendUp,
  loading = false,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-[#999999]">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#e5e5e5]">
            {loading ? (
              <span className="inline-block h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-[#272727]" />
            ) : (
              value
            )}
          </p>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-[#999999]">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </p>
          )}
        </div>
        <div
          className={`flex items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor} h-12 w-12`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export const TransactionStats = ({ stats, loading = false }) => {
  const statsData = useMemo(
    () => [
      {
        title: 'Tổng phiếu nhập',
        value: stats?.totalInward?.toLocaleString('vi-VN') || '0',
        subtitle: 'Tất cả chi nhánh',
        icon: PackagePlus,
        iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
        iconTextColor: 'text-emerald-600 dark:text-emerald-300',
        trend: stats?.inwardTrend,
        trendUp: true,
      },
      {
        title: 'Tổng phiếu xuất',
        value: stats?.totalOutward?.toLocaleString('vi-VN') || '0',
        subtitle: 'Tất cả chi nhánh',
        icon: PackageMinus,
        iconBgColor: 'bg-rose-100 dark:bg-rose-900/50',
        iconTextColor: 'text-rose-600 dark:text-rose-300',
        trend: stats?.outwardTrend,
        trendUp: false,
      },
      {
        title: 'Giá trị nhập hôm nay',
        value: stats?.todayInwardValue
          ? `${stats.todayInwardValue.toLocaleString('vi-VN')} đ`
          : '0 đ',
        subtitle: 'Theo giá vốn',
        icon: TrendingUp,
        iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
        iconTextColor: 'text-emerald-600 dark:text-emerald-300',
        trend: stats?.todayInwardTrend,
        trendUp: true,
      },
      {
        title: 'Giá trị xuất hôm nay',
        value: stats?.todayOutwardValue
          ? `${stats.todayOutwardValue.toLocaleString('vi-VN')} đ`
          : '0 đ',
        subtitle: 'Theo giá vốn',
        icon: TrendingDown,
        iconBgColor: 'bg-rose-100 dark:bg-rose-900/50',
        iconTextColor: 'text-rose-600 dark:text-rose-300',
        trend: stats?.todayOutwardTrend,
        trendUp: false,
      },
      {
        title: 'Hàng đang chờ duyệt',
        value: stats?.pendingCount?.toLocaleString('vi-VN') || '0',
        subtitle: 'Cần xử lý',
        icon: Clock,
        iconBgColor: 'bg-amber-100 dark:bg-amber-900/50',
        iconTextColor: 'text-amber-600 dark:text-amber-300',
      },
      {
        title: 'Tổng giá trị tồn kho',
        value: stats?.totalStockValue
          ? `${stats.totalStockValue.toLocaleString('vi-VN')} đ`
          : '0 đ',
        subtitle: 'Theo giá vốn',
        icon: Warehouse,
        iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
        iconTextColor: 'text-blue-600 dark:text-blue-300',
      },
    ],
    [stats]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
};

export default TransactionStats;
