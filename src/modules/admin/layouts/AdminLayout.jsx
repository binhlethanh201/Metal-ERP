import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../../../shared/hooks/useAuth';
import Icon from '../../../shared/components/Icon';
import Logo from '../../../shared/components/Logo';
import AdminNotificationDropdown from '../components/AdminNotificationDropdown';
import { useTheme } from '../../../shared/contexts/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5100';
const HUB_URL = `${API_BASE}/r/mepHub`;

const MENU_ITEMS = [
  { label: 'Dashboard hệ thống', path: '/admin', icon: 'dashboard' },
  { label: 'Quản lý Người dùng', path: '/admin/users', icon: 'groups' },
  { label: 'Vai trò & Phân quyền', path: '/admin/roles', icon: 'shield' },
  { label: 'Quản lý Cửa hàng', path: '/admin/branches', icon: 'store' },
  { label: 'Thông báo hệ thống', path: '/admin/notifications', icon: 'campaign' },
  { label: 'Nhật ký máy chủ (Log)', path: '/admin/logs', icon: 'terminal' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const hubRef = useRef(null);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, type === 'warning' || type === 'error' ? 8000 : 5000);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN', { hour12: false }) + ' | ' + now.toLocaleDateString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    hubRef.current = connection;
    connection.on('StoreApprovalPending', (data) => addToast(`Cửa hàng mới "${data.storeName || '—'}" vừa đăng ký — chờ duyệt`, 'warning'));
    connection.on('SystemNotification', (data) => addToast(`${data.title || 'Thông báo mới'}`, 'info'));
    connection.on('ViolationReported', (data) => addToast(`Báo cáo vi phạm: "${data.reportedContent || data.postTitle || '—'}"`, 'error'));
    connection.start().catch((err) => console.warn('SignalR không thể kết nối:', err.message));
    return () => { connection.stop().catch(() => {}); };
  }, [addToast]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const isItemActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const TOAST_STYLES = {
    info: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200',
    warning: 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-200',
    error: 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-200',
    success: 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-200',
  };
  const TOAST_ICONS = { info: 'info', warning: 'warning', error: 'dangerous', success: 'check_circle' };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f9fc] font-sans text-slate-900 antialiased dark:bg-[#0a0a0a] dark:text-[#e5e5e5]">
      {/* Toast notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-full max-w-md">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-4 rounded-xl border p-5 shadow-2xl transition-all ${TOAST_STYLES[t.type] || TOAST_STYLES.info} w-full`}>
            <Icon name={TOAST_ICONS[t.type] || 'info'} size={24} className="mt-0.5 shrink-0" />
            <div className="flex flex-col"><span className="text-base font-black uppercase tracking-wide">{t.message}</span></div>
            <button onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))} className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-[#fcfcfd]/80 backdrop-blur-sm px-6 shadow-[0_1px_8px_rgba(15,23,42,0.04)] dark:border-[#333333] dark:bg-[#0f0f0f]/80">
        <div className="flex items-center gap-3">
          <Logo moduleName="Administrator" />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
            <Icon name="clock" size={14} /> {currentTime || '00:00:00'}
          </span>

          <AdminNotificationDropdown />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white transition-transform active:scale-95"
            >
              {(user?.name || user?.fullName || 'A').charAt(0).toUpperCase()}
            </button>

            {isProfileOpen && (
              <div className="animate-fadeIn absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                  <p className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">{user?.name || user?.fullName || 'Admin'}</p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold uppercase text-slate-500 dark:text-[#999999]">{user?.email || 'admin@mep.system'}</p>
                </div>
                <div className="p-1">
                  <button onClick={toggleTheme} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b3b3b3] dark:hover:bg-[#272727]">
                    <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={16} className="text-slate-500 dark:text-[#999999]" />
                    {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                  </button>
                  <button onClick={() => { navigate('/account-settings'); setIsProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b3b3b3] dark:hover:bg-[#272727]">
                    <Icon name="settings" size={16} className="text-slate-500 dark:text-[#999999]" /> Cài đặt tài khoản
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-[#333333]" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50">
                    <Icon name="logout" className="text-base" /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY: SIDEBAR + CONTENT */}
      <div className="flex flex-1 gap-3 overflow-hidden p-3">
        {/* SIDEBAR */}
        <aside
          className={`flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 dark:border-[#333333] dark:bg-[#0f0f0f] ${
            sidebarOpen ? 'w-[260px]' : 'w-0'
          }`}
        >
          {sidebarOpen && (
            <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-3">
              {MENU_ITEMS.map((item) => {
                const active = isItemActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 ${
                      active
                        ? 'bg-blue-50 font-bold text-[#004785] dark:bg-blue-900/50 dark:text-blue-300'
                        : 'font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-[#999999] dark:hover:bg-[#272727] dark:hover:text-[#d4d4d4]'
                    }`}
                  >
                    <Icon name={item.icon} size={22} className="shrink-0" />
                    <span className="text-[15px] leading-none">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        {/* SIDEBAR TOGGLE */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className={`z-50 flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:hover:bg-[#333333] ${
            sidebarOpen ? '-ml-4 mr-1' : 'ml-2'
          }`}
          aria-label="Toggle sidebar"
        >
          <svg className={`h-4 w-4 text-slate-500 transition-transform dark:text-[#999999] ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* MAIN CONTENT */}
        <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]">
          <div className="h-full overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;