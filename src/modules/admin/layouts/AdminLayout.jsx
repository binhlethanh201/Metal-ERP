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

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const hubRef = useRef(null);

  // ---- Toast helpers ----
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // ---- Real-time clock ----
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour12: false }) + ' | ' + now.toLocaleDateString('vi-VN')
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ---- Click outside to close dropdown ----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- SignalR real-time connection ----
  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hubRef.current = connection;

    // Cửa hàng mới đăng ký chờ duyệt
    connection.on('StoreApprovalPending', (data) => {
      addToast(
        `Cửa hàng mới "${data.storeName || data.storeName || '—'}" vừa đăng ký — chờ duyệt`,
        'warning'
      );
    });

    // Thông báo hệ thống gửi đến admin
    connection.on('SystemNotification', (data) => {
      addToast(`${data.title || 'Thông báo mới'}`, 'info');
    });

    // Violation được báo cáo
    connection.on('ViolationReported', (data) => {
      addToast(`Báo cáo vi phạm: "${data.reportedContent || data.postTitle || '—'}"`, 'error');
    });

    connection.start().catch((err) => {
      console.warn('SignalR không thể kết nối:', err.message);
    });

    return () => {
      connection.stop().catch(() => {});
    };
  }, [addToast]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const MENU_SECTIONS = [
    {
      title: 'TỔNG QUAN',
      items: [{ label: 'Dashboard hệ thống', path: '/admin', badge: null, icon: 'dashboard' }],
    },
    {
      title: 'Quản trị Người dùng',
      items: [
        { label: 'Quản lý Người dùng', path: '/admin/users', badge: null, icon: 'groups' },
        {
          label: 'Vai trò & Phân quyền',
          path: '/admin/roles',
          badge: null,
          icon: 'admin_panel_settings',
        },
        { label: 'Quản lý Cửa hàng', path: '/admin/branches', badge: null, icon: 'store' },
      ],
    },

    {
      title: 'VẬN HÀNH & HỆ THỐNG',
      items: [
        {
          label: 'Thông báo hệ thống',
          path: '/admin/notifications',
          badge: null,
          icon: 'campaign',
        },
        { label: 'Nhật ký máy chủ (Log)', path: '/admin/logs', badge: null, icon: 'terminal' },
      ],
    },
  ];

  const TOAST_STYLES = {
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    success: 'bg-green-50 border-green-300 text-green-800',
  };
  const TOAST_ICONS = {
    info: 'info',
    warning: 'warning',
    error: 'dangerous',
    success: 'check_circle',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased dark:bg-[#0f0f0f] dark:text-[#e5e5e5]">
      {/* Toast notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-full max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-4 rounded-xl border p-5 shadow-2xl transition-all ${TOAST_STYLES[t.type] || TOAST_STYLES.info} w-full`}
          >
            <Icon name={TOAST_ICONS[t.type] || 'info'} size={24} className="mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-base font-black uppercase tracking-wide">{t.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LEFT SIDEBAR */}
      <aside className="z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 bg-white px-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
          <Logo moduleName="Administrator" />
        </div>

        <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto py-4">
          {MENU_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-2 px-4 font-sans text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                {section.title}
              </h3>
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#004785] text-white shadow-sm dark:bg-blue-600'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#999999] dark:hover:bg-[#1a1a1a] dark:hover:text-[#e5e5e5]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#004785] dark:text-[#666666] dark:group-hover:text-blue-400'
                            }
                          >
                            <Icon name={item.icon} size={16} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-red-500 px-1 text-[9px] font-black text-white dark:bg-red-600">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* TOPBAR */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-slate-200 bg-white px-6 dark:border-[#333333] dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
              <Icon name="clock" size={14} /> {currentTime || '00:00:00'}
            </span>

            {/* ADMIN NOTIFICATION DROPDOWN */}
            <AdminNotificationDropdown />

            <div className="h-6 w-px bg-slate-200 dark:bg-[#333333]" />

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-1 pr-2 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:hover:bg-[#1a1a1a]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#004785] text-xs font-bold text-white dark:bg-blue-600">
                  {(user?.name || user?.fullName || 'A').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {user?.name || user?.fullName || 'Admin'}
                </span>
                <span className="text-slate-400 dark:text-[#666666]">
                  <Icon name="chevron_down" size={14} />
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                    <p className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">
                      {user?.name || user?.fullName || 'Admin'}
                    </p>
                    <p className="truncate text-[10px] font-semibold text-slate-500 dark:text-[#999999]">
                      {user?.email || 'admin@mep.system'}
                    </p>
                  </div>
                  <div className="p-1">
                    {/* Dark mode toggle */}
                    <button
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
                    >
                      <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={16} className="text-slate-500 dark:text-[#999999]" />
                      {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                    </button>

                    <button
                      onClick={() => {
                        navigate('/account-settings');
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
                    >
                      <Icon name="lock" size={16} className="text-slate-500 dark:text-[#999999]" /> Đổi mật khẩu
                    </button>
                    
                    <div className="my-1 border-t border-slate-100 dark:border-[#333333]" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <Icon name="logout" size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-[#1a1a1a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
