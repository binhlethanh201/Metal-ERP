import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour12: false }) + ' | ' + now.toLocaleDateString('vi-VN')
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const MENU_SECTIONS = [
    {
      title: 'TỔNG QUAN HỆ THỐNG',
      items: [{ label: 'Dashboard chung', path: '/admin', badge: null, icon: 'layout_dashboard' }],
    },
    {
      title: 'VẬN HÀNH & CỘNG ĐỒNG',
      items: [
        { label: 'Cửa hàng (Tenants)', path: '/admin/users', badge: null, icon: 'users' },
        { label: 'Kiểm duyệt B2B', path: '/admin/moderation', badge: '12', icon: 'shield_check' },
      ],
    },
    {
      title: 'TÀI CHÍNH',
      items: [
        { label: 'Doanh thu & Gói cước', path: '/admin/billing', badge: null, icon: 'credit_card' },
      ],
    },
    {
      title: 'DỮ LIỆU & CẤU HÌNH',
      items: [
        { label: 'Cây danh mục Master', path: '/admin/master-data', badge: null, icon: 'database' },
        {
          label: 'Cài đặt nền tảng',
          path: '/admin/settings',
          badge: null,
          icon: 'sliders_horizontal',
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9] font-sans text-slate-900 antialiased">
      {/* SIDEBAR TRÁI - CHUYỂN SANG NỀN SÁNG ĐỂ TRÁNH GÂY MỎI MẮT KHI ĐIỀU TIẾT */}
      <aside className="z-50 flex w-64 shrink-0 flex-col border-r border-slate-300 bg-[#F8FAFC]">
        {/* LOGO AREA KHÍT KHAO */}
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-300 bg-white px-4">
          <Logo moduleName="Administrator" />
        </div>

        {/* HỆ THỐNG MENU ĐIỀU HƯỚNG SÁNG SỦA, RÕ CHỮ */}
        <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto py-4">
          {MENU_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-2 px-4 font-sans text-[10px] font-black uppercase tracking-wider text-slate-400">
                {section.title}
              </h3>
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={`group flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-xs font-bold transition-all ${
                          isActive
                            ? 'border-l-4 border-l-[#004785] bg-[#0F172A] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                            }
                          >
                            <Icon name={item.icon} size={14} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-[2px] bg-[#9A1616] px-1 text-[9px] font-black text-white">
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

        {/* CHÂN SIDEBAR CHỨA PROFILE ADMIN */}
        <div className="flex items-center gap-3 border-t border-slate-300 bg-white p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-slate-300 bg-slate-100 font-sans text-xs font-bold text-slate-800">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="block truncate text-xs font-bold leading-none text-slate-800">
              {user?.name || ' Admin'}
            </span>
            <span className="mt-1 block truncate font-sans text-[9px] font-bold uppercase text-slate-400">
              Quyền: Tổng quản trị
            </span>
          </div>
        </div>
      </aside>

      {/* KHU VỰC BÊN PHẢI: TOPBAR VÀ KHÔNG GIAN HIỂN THỊ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR PHẲNG MÀU TRẮNG ĐỒNG BỘ ĐỘ CAO H-14 */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-300 bg-white px-6">
          <div className="w-full max-w-xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                placeholder="Tra cứu mã đại lý, log server, hóa đơn tài chính..."
                className="w-full rounded-[4px] border border-slate-300 bg-slate-50 px-3 py-1.5 pl-9 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-slate-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Tiện ích thời gian thực bên phải */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-[4px] border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">
              <Icon name="clock" size={12} /> {currentTime || '00:00:00'}
            </span>

            <button className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
              <Icon name="bell" size={14} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#9A1616]" />
            </button>
          </div>
        </header>

        {/* VÙNG NỘI DUNG CHÍNH NỀN SLATE 100 DỊU MẮT */}
        <main className="flex-1 overflow-y-auto bg-[#F1F5F9] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
