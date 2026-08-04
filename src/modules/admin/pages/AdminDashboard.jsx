import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../../../shared/components/Icon';
import {
  getDashboardStats,
  getRecentEvents,
} from '../services/adminService';

const formatCurrency = (value) => {
  if (value == null) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('vi-VN');
};

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

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-100 dark:bg-[#272727] ${className}`} />
);

const Section = ({ title, icon, action, children }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:border-[#333333] dark:bg-[#0f0f0f]">
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
  let iconColors = 'bg-slate-50 text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]';
  let textColor = 'text-slate-900 dark:text-[#e5e5e5]';

  if (tone === 'navy') { iconColors = 'bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400'; textColor = 'text-[#004785] dark:text-blue-400'; }
  if (tone === 'green') { iconColors = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'; textColor = 'text-emerald-700 dark:text-emerald-400'; }
  if (tone === 'red') { iconColors = 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-500'; textColor = 'text-red-700 dark:text-red-400'; }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColors}`}>
          <Icon name={icon} size={24} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">{label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h3 className={`text-[40px] font-bold leading-none ${textColor}`}>{value}</h3>
            {unit && <span className="text-sm font-semibold text-slate-400 dark:text-[#666666]">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentEvents(20),
    ])
      .then(([statsData, eventsData]) => {
        setStats(statsData);
        setRecentEvents(Array.isArray(eventsData) ? eventsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Dashboard API error:', err);
        setError(err.message || 'Không tải được dữ liệu dashboard');
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10 text-slate-900 dark:text-[#e5e5e5]" style={{ background: 'radial-gradient(circle at top right, rgba(37,99,235,0.03), transparent 50%)' }}>
      {/* HEADER */}
      <div className="relative flex items-center justify-between pb-4">
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-b-sm bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />
        <div className="pt-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Hệ thống Phân tích Chỉ số &amp; Vận hành Lõi
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            M.E.P ADMIN DASHBOARD
          </p>
        </div>
      </div>

      {error && (
        <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 text-center dark:border-red-900/30 dark:bg-red-900/10">
          <Icon name="error" className="text-2xl text-red-500" />
          <p className="font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!error && (
        <>
          {/* TÀI KHOẢN ĐANG HOẠT ĐỘNG */}
          <section className="max-w-sm">
            {loading ? (
              <Skeleton className="h-24" />
            ) : (
              <KPICardAdmin
                icon="store"
                label="Tài Khoản Đang Hoạt Động"
                value={formatCurrency(stats?.activeTenants)}
                unit="tài khoản"
                tone="navy"
              />
            )}
          </section>

          {/* PHÍM TẮT TÁC VỤ NHANH & HOẠT ĐỘNG QUẢN TRỊ GẦN ĐÂY */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Section title="Phím tắt tác vụ nhanh" icon="bolt">
                <div className="flex h-[280px] flex-wrap content-start gap-4">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="flex h-[120px] w-full sm:w-[calc(50%-8px)] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#3B82F6] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400 transition-transform group-hover:scale-105">
                      <Icon name="groups" size={24} />
                    </div>
                    Quản lý Người Dùng
                  </button>
                  <button
                    onClick={() => navigate('/admin/notifications')}
                    className="flex h-[120px] w-full sm:w-[calc(50%-8px)] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#3B82F6] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400">
                      <Icon name="campaign" size={24} />
                    </div>
                    Phát tin khẩn cấp
                  </button>
                  <button
                    onClick={() => navigate('/admin/logs')}
                    className="flex h-[120px] w-full sm:w-[calc(50%-8px)] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#3B82F6] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-[#999999]">
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
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-[#333333] dark:bg-[#1a1a1a] dark:hover:bg-[#222] dark:hover:border-[#444]"
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
        </>
      )}
    </div>
  );
};

export default AdminDashboard;