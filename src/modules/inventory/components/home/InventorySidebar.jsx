/**
 * Sidebar Tổng kho nâng cấp - Menu điều hướng trái sử dụng flat data từ sidebarItems.
 * Tích hợp Phân quyền (RBAC): Tự động ẩn HOÀN TOÀN các menu không thuộc thẩm quyền của User.
 */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
import { sidebarItems } from '../../data/inventoryPageData';
import { useAuth } from '../../../../shared/hooks/useAuth'; // Import hook xác thực

const InventorySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Lấy thông tin user hiện tại
  const [isSwitching, setIsSwitching] = useState(false);

  // Chuẩn hóa mảng roles của user (Xử lý cả trường hợp API trả về chuỗi "role" hoặc mảng "roles")
  const userRoles = user?.roles || (user?.role ? [user.role] : []);

  // Kiểm tra xem User có mang role Owner hay không
  const isOwner = userRoles.includes('Owner');

  // Lọc danh sách menu: Xóa sổ hoàn toàn các menu Owner khỏi DOM nếu không đủ quyền
  const visibleMenuItems = sidebarItems.filter((item) => {
    // Nếu menu đánh cờ ownerOnly = true MÀ user KHÔNG PHẢI Owner -> Ẩn đi (return false)
    if (item.ownerOnly && !isOwner) {
      return false;
    }

    // Nếu sau này bạn xài thêm allowedRoles thì check ở đây
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      return item.allowedRoles.some((r) => userRoles.includes(r));
    }

    // Còn lại là public menu, cho hiển thị
    return true;
  });

  // Hàm check xem item nào đang active dựa trên URL hiện tại
  const isItemActive = (path) => {
    if (!path) return false;
    if (path === '/inventory/dashboard')
      return location.pathname.startsWith('/inventory/dashboard');
    if (path === '/inventory/reports') return location.pathname.startsWith('/inventory/reports');
    return location.pathname === path;
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-slate-200 bg-white p-4">
        {/* Khối Logo thương hiệu */}
        <div className="mb-8 px-2">
          <Logo moduleName="Tổng Kho" />
        </div>

        {/* Vùng điều hướng Menu chính (Đã được lọc qua quyền) */}
        <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
          {visibleMenuItems.map((item) => {
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

        {/* TIỆN ÍCH CHÂN TRANG */}
        <div className="mt-auto space-y-4 border-t border-slate-100 pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004785] py-3 font-bold text-white shadow-sm shadow-blue-900/10 transition-all active:scale-95"
          >
            <Icon name="bolt" className="text-sm" />
            <span>Hỗ trợ AI</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default InventorySidebar;
