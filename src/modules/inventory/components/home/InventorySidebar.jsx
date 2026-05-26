/**
 * Sidebar Tổng kho - Menu điều hướng trái sử dụng flat data từ sidebarItems.
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
// Sử dụng chuẩn xác danh sách phẳng sidebarItems
import { sidebarItems } from '../../data/inventoryPageData';

const InventorySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm check xem item nào đang active dựa trên URL hiện tại
  const isItemActive = (path) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-8 px-2">
        <Logo moduleName="Tổng Kho" />
      </div>

      {/* Điều hướng Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {sidebarItems.map((item) => {
          const active = isItemActive(item.path);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                active
                  ? 'bg-blue-50 font-semibold text-blue-900'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon name={item.icon} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Nút tiện ích chân trang */}
      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004785] py-3 font-bold text-white transition-all active:scale-95">
          <Icon name="bolt" className="text-sm" />
          <span>Hỗ trợ AI</span>
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-xl border-[2px] px-3 py-2 text-slate-600 hover:bg-slate-100">
          <Icon name="settings" />
          Cài đặt
        </button>
      </div>
    </aside>
  );
};

export default InventorySidebar;
