import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import {
  getDashboardStats,
  getRevenueChart,
  getRecentEvents,
  exportDashboard,
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
      return 'bg-error-container text-error';
    case 'INFO':
      return 'bg-primary-fixed text-on-primary-fixed-variant';
    default:
      return 'bg-surface-container-highest text-on-surface';
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRevenueChart(new Date().getFullYear()),
      getRecentEvents(20),
    ])
      .then(([statsData, chartData, eventsData]) => {
        setStats(statsData);
        setChart(Array.isArray(chartData) ? chartData : []);
        setRecentEvents(Array.isArray(eventsData) ? eventsData : []);
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
      const blob = await exportDashboard();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mep-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const maxRevenue = chart.reduce((max, p) => (p && p.revenue > max ? p.revenue : max), 0);

  return (
    <div className="space-y-6 text-on-surface">
      {/* MAIN TITLE */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            Hệ thống Phân tích Chỉ số &amp; Vận hành Lõi
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Giám sát thời gian thực trạng phân hệ cửa hàng và luồng thông tin B2B
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-md bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-outline-variant"
        >
          <Icon name="download" size={16} /> Xuất Báo Cáo (.CSV)
        </button>
      </div>

      {/* 4 CARDS SỐ LIỆU TỔNG QUAN */}
      {error && (
        <div className="rounded-md bg-error-container p-3 text-xs font-semibold text-error">
          {error}
        </div>
      )}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-on-surface-variant">
                Shop Đang Hoạt Động
              </div>
              <div className="mt-2 text-3xl font-black text-on-surface">
                {formatCurrency(stats.activeTenants)}
              </div>
            </div>
            <div className="mt-4 w-fit rounded-md bg-tertiary-fixed px-2 py-1 text-xs font-bold text-on-tertiary-fixed-variant">
              Owner có IsActive = 1
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-on-surface-variant">
                Doanh Thu Hóa Đơn (30 ngày)
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">
                  {formatCurrency(stats.subscriptionRevenue)}
                </span>
                <span className="text-sm font-bold text-on-surface-variant">VNĐ</span>
              </div>
            </div>
            <div className="mt-4 w-fit rounded-md bg-tertiary-fixed px-2 py-1 text-xs font-bold text-on-tertiary-fixed-variant">
              Invoice COMPLETED 30d
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-on-surface-variant">
                Hoa Hồng B2B (1% Transfer)
              </div>
              <div className="mt-2 text-3xl font-black text-on-surface">
                {formatCurrency(stats.b2bCommission)}
              </div>
            </div>
            <div className="mt-4 w-fit rounded-md bg-surface-container-highest px-2 py-1 text-xs font-bold text-on-surface-variant">
              Tính trên Order TRANSFER
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border-l-4 border-outline-variant border-l-error bg-error-container/20 p-5 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-on-surface-variant">Cảnh Báo Công Nợ</div>
              <div className="mt-2 text-3xl font-black text-error">
                {formatCurrency(stats.overdueAlerts)}
              </div>
            </div>
            <div className="mt-4 w-fit rounded-md bg-error-container px-2 py-1 text-xs font-bold text-on-error-container">
              Khách vượt DebtLimit
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS BOARD */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Phím tắt tác vụ nhanh
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="user_plus" size={14} className="text-primary" /> Duyệt cấp Cửa hàng
          </button>
          <button
            onClick={() => navigate('/admin/notifications')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="megaphone" size={14} className="text-error" /> Phát tin khẩn cấp
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="folder_plus" size={14} className="text-emerald-700" /> Cập nhật Nhóm hàng
          </button>
          <button
            onClick={() => navigate('/admin/logs')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="terminal" size={14} className="text-slate-500" /> Tra cứu Log máy chủ
          </button>
        </div>
      </div>

      {/* CHART & AUDIT LOGS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* CHART */}
        <section className="flex min-h-[380px] flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-surface-container-high pb-2">
            <h3 className="text-base font-bold text-on-surface">Phân tích Hiệu suất Doanh thu</h3>
            <span className="text-xs font-bold text-primary">
              Dữ liệu năm {new Date().getFullYear()}
            </span>
          </div>

          <div className="grid flex-1 grid-cols-12 items-end gap-2 pt-4">
            {chart.map((point) => {
              const heightPct =
                maxRevenue > 0 ? Math.max(2, Math.round((point.revenue / maxRevenue) * 100)) : 2;
              return (
                <div
                  key={point.month}
                  className="flex h-full flex-col items-center justify-end gap-1"
                >
                  <div
                    className="w-full rounded-t bg-primary transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${formatMonth(point.month)}: ${formatCurrency(point.revenue)} VNĐ (${point.orderCount} hóa đơn)`}
                  />
                  <div className="text-[10px] font-bold text-on-surface-variant">
                    {formatMonth(point.month)}
                  </div>
                  <div className="text-[9px] text-outline">{point.orderCount || 0}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AUDIT LOGS */}
        <section className="flex min-h-[380px] flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 border-b border-surface-container-high pb-2">
            <h3 className="text-base font-bold text-on-surface">Hoạt động Quản trị gần đây</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {loading && (
              <div className="flex items-center justify-center py-8 text-xs text-on-surface-variant">
                Đang tải...
              </div>
            )}
            {!loading && recentEvents.length === 0 && (
              <div className="py-8 text-center text-xs text-on-surface-variant">
                Chưa có hoạt động nào.
              </div>
            )}
            {!loading &&
              recentEvents.map((event) => (
                <div
                  key={event.logId}
                  className="rounded-md bg-surface-container-low p-3 text-xs transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span
                      className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${levelClass(event.level)}`}
                    >
                      {event.action}
                    </span>
                    <span className="text-[11px] font-medium text-on-surface-variant">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1.5 font-medium text-on-surface">{event.description || '—'}</p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
                    <Icon name="user" size={10} /> Thao tác: {event.userName || 'System'}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
