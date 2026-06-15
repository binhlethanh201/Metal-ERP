import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import Icon from '../../../shared/components/Icon';
import Logo from '../../../shared/components/Logo';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Giả định useAuth có cung cấp hàm logout
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Xử lý đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour12: false }) + ' | ' + now.toLocaleDateString('vi-VN')
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Xử lý click ra ngoài để đóng dropdown profile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const MENU_SECTIONS = [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Dashboard hệ thống', path: '/admin', badge: null, icon: 'layout_dashboard' },
      ],
    },
    {
      title: 'TÀI KHOẢN & PHÂN QUYỀN',
      items: [{ label: 'Quản lý Người dùng', path: '/admin/users', badge: null, icon: 'users' }],
    },
    {
      title: 'CỘNG ĐỒNG & NỘI DUNG',
      items: [
        { label: 'Cây danh mục', path: '/admin/categories', badge: null, icon: 'folder_tree' },
        {
          label: 'Kiểm duyệt bài viết',
          path: '/admin/moderation',
          badge: '5',
          icon: 'shield_alert',
        },
      ],
    },
    {
      title: 'VẬN HÀNH & HỆ THỐNG',
      items: [
        {
          label: 'Thông báo hệ thống',
          path: '/admin/notifications',
          badge: null,
          icon: 'bell_ring',
        },
        { label: 'Nhật ký máy chủ (Log)', path: '/admin/logs', badge: null, icon: 'terminal' },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-container-low font-sans text-on-surface antialiased">
      {/* LEFT SIDEBAR */}
      <aside className="z-50 flex w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest">
        <div className="flex h-14 items-center gap-2.5 border-b border-outline-variant bg-surface-container-lowest px-4">
          <Logo moduleName="Administrator" />
        </div>

        <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto py-4">
          {MENU_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-2 px-4 font-sans text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
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
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={
                              isActive ? 'text-on-primary' : 'text-outline group-hover:text-primary'
                            }
                          >
                            <Icon name={item.icon} size={16} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-error px-1 text-[9px] font-black text-on-error">
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
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-outline-variant bg-surface-container-lowest px-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-md border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-bold text-on-surface-variant">
              <Icon name="clock" size={14} /> {currentTime || '00:00:00'}
            </span>

            <button className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high">
              <Icon name="bell" size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />
            </button>

            <div className="h-6 w-px bg-outline-variant"></div>

            {/*  PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-1 pr-2 transition-colors hover:bg-surface-container-high"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-container text-xs font-bold text-on-primary-container">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-bold text-on-surface">{user?.name || 'Admin'}</span>
                <span className="text-outline">
                  <Icon name="chevron_down" size={14} />
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg">
                  <div className="border-b border-surface-container-high px-4 py-3">
                    <p className="text-xs font-bold text-on-surface">{user?.name || 'Admin'}</p>
                    <p className="truncate text-[10px] font-semibold text-on-surface-variant">
                      {user?.email || 'admin@mep.system'}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        navigate('/change-password');
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low"
                    >
                      <Icon name="key" size={14} /> Đổi mật khẩu
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-bold text-error hover:bg-error-container/50"
                    >
                      <Icon name="log_out" size={14} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
