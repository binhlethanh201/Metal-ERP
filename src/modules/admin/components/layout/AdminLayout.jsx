import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Database,
  CreditCard,
  SlidersHorizontal,
} from 'lucide-react';

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
      title: 'TỔNG QUAN',
      items: [{ label: 'Dashboard chung', path: '/admin', badge: null, icon: LayoutDashboard }],
    },
    {
      title: 'VẬN HÀNH & CỘNG ĐỒNG',
      items: [
        { label: 'Cửa hàng (Tenants)', path: '/admin/users', badge: null, icon: Users },
        { label: 'Kiểm duyệt B2B', path: '/admin/moderation', badge: '12', icon: ShieldCheck },
      ],
    },
    {
      title: 'TÀI CHÍNH',
      items: [
        { label: 'Doanh thu & Gói cước', path: '/admin/billing', badge: null, icon: CreditCard },
      ],
    },
    {
      title: 'DỮ LIỆU & HỆ THỐNG',
      items: [
        { label: 'Cây danh mục Master', path: '/admin/master-data', badge: null, icon: Database },
        {
          label: 'Cài đặt nền tảng',
          path: '/admin/settings',
          badge: null,
          icon: SlidersHorizontal,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-[#FAFAFA] font-sans text-textAdmin">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-borderLight bg-white px-6">
        <div className="flex w-56 shrink-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-admin bg-admin text-sm font-bold text-white shadow-sm">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-widest text-admin">AI_RETAIL_ERP</span>
            <span className="text-[10px] font-bold tracking-widest text-[#CC0000]">
              ADMIN DASHBROAD
            </span>
          </div>
        </div>

        <div className="hidden flex-1 px-12 md:block">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm cửa hàng, giao dịch, người dùng..."
              className="w-full rounded-admin border border-borderLight bg-[#FAFAFA] py-2 pl-10 pr-12 text-sm text-textAdmin transition-all focus:border-admin focus:bg-white focus:outline-none focus:ring-1 focus:ring-admin"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-borderLight bg-white px-1.5 py-0.5 text-[10px] font-bold text-placeholder shadow-sm">
              ⌘K
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-4 text-xs font-semibold text-placeholder lg:flex">
            <span>{currentTime || 'Loading...'}</span>
            <button className="rounded-admin border border-borderLight px-3 py-1.5 text-admin transition-colors hover:bg-bodyAdmin active:scale-95">
              SYSTEM LOGS
            </button>
            <div className="mx-1 h-5 w-px bg-borderLight"></div>
          </div>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-admin text-placeholder transition-colors hover:bg-[#F5F5F6] hover:text-admin">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#CC0000]"></span>
          </button>

          <button className="flex h-9 w-9 items-center justify-center rounded-admin text-placeholder transition-colors hover:bg-[#F5F5F6] hover:text-admin">
            <Settings size={20} />
          </button>

          <div className="ml-2 flex cursor-pointer items-center gap-3 border-l border-borderLight pl-4 transition-opacity hover:opacity-80">
            <div className="flex hidden flex-col text-right sm:block">
              <span className="block text-sm font-bold text-textAdmin">
                {user?.name || 'Administrator'}
              </span>
              <span className="block text-[10px] font-semibold text-placeholder"> admin 1</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-admin bg-[#E0E3E6] font-bold text-admin">
              {user?.name?.charAt(0) || 'AD'}
            </div>
            <ChevronDown size={16} className="text-placeholder" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-borderLight bg-white py-6">
          {MENU_SECTIONS.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="mb-3 px-6 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                {section.title}
              </h3>
              <ul className="space-y-1 px-3">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={`group flex w-full items-center justify-between rounded-admin px-3 py-2.5 text-sm transition-all ${
                          isActive
                            ? 'bg-admin font-bold text-white'
                            : 'font-semibold text-placeholder hover:bg-[#F5F5F6] hover:text-textAdmin'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            size={18}
                            className={
                              isActive
                                ? 'text-white'
                                : 'text-placeholder group-hover:text-textAdmin'
                            }
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`flex h-5 items-center justify-center rounded px-1.5 text-[10px] font-bold ${isActive ? 'bg-[#CC0000] text-white' : 'bg-borderLight text-textAdmin'}`}
                          >
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
        </aside>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
