/**
 * Sidebar Component - Điều hướng chính theo UI Figma
 */

import { useLocation, useNavigate } from 'react-router-dom';

const navSections = [
  {
    title: 'HỆ THỐNG',
    items: [
      { icon: 'dashboard', label: 'Tổng quan', path: '/inventory/dashboard' },
      { icon: 'inventory_2', label: 'Hàng hóa', path: '/inventory/products' },
      { icon: 'group', label: 'Nhà cung cấp', path: '/inventory/suppliers' },
      { icon: 'analytics', label: 'Báo cáo', path: '/inventory/reports' },
      { icon: 'badge', label: 'Quản lý nhân viên', path: '/admin' },
    ],
  },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path) => {
    if (path === '/inventory/products') return location.pathname === path;
    if (path === '/inventory/dashboard')
      return location.pathname.startsWith('/inventory/dashboard');
    if (path === '/inventory/reports') return location.pathname.startsWith('/inventory/reports');
    if (path === '/inventory/suppliers')
      return location.pathname.startsWith('/inventory/suppliers');
    if (path === '/admin') return location.pathname.startsWith('/admin');
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-slate-200 bg-white p-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            factory
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-blue-900 dark:text-blue-300">MetalERP</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#999999]">
            Industrial Precision
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#808080]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-blue-50 font-semibold text-blue-900 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-[#999999] dark:hover:bg-[#272727]'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4 dark:border-[#333333]">
        <button className="bg-navy-cta w-full rounded-xl py-3 font-bold text-white transition-all active:scale-95">
          <span className="material-symbols-outlined mr-2 align-middle text-sm">bolt</span>
          <span className="align-middle">Hỗ trợ AI</span>
        </button>
        <button
          onClick={() => navigate('/admin')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-[#999999] dark:hover:bg-[#272727]"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Cài đặt</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
