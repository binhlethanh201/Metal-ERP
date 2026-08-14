/**
 * Sidebar POS - Nằm trong flex layout, thu gọn/mở rộng được.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { hasAnyPermission } from '../../../../shared/utils/permissions';
import { INVENTORY_PERMISSIONS, ROUTE_PERMISSIONS } from '../../../../shared/utils/routeAccess';

const PosSidebar = ({ activeMenu, onMenuSelect, onNavigateWarehouse, open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitching, setIsSwitching] = useState(false);
  const { user } = useAuth();

  const canAccessWarehouse = hasAnyPermission(user, INVENTORY_PERMISSIONS);

  const MENU_ROUTES = {
    'Máy bán hàng': '/pos',
    'Đơn hàng': '/pos/orders',
    Khách: '/pos/customers',
    'Quản lý ca bán': '/pos/shift',
    'Đổi / Trả / Bảo hành': '/pos/returns',
    'Hàng bảo hành': '/pos/warranty',
  };

  const menuItems = [
    { icon: 'shopping_cart', label: 'Máy bán hàng', permissions: ROUTE_PERMISSIONS.pos },
    { icon: 'assignment', label: 'Đơn hàng', permissions: ROUTE_PERMISSIONS.posOrders },
    { icon: 'groups', label: 'Khách', permissions: ROUTE_PERMISSIONS.posCustomers },
    { icon: 'assessment', label: 'Quản lý ca bán', permissions: ROUTE_PERMISSIONS.posShift },
    { icon: 'swap_horiz', label: 'Đổi / Trả / Bảo hành', permissions: ROUTE_PERMISSIONS.posReturns },
    { icon: 'verified_user', label: 'Hàng bảo hành', permissions: ROUTE_PERMISSIONS.posReturns },
  ].filter((item) => hasAnyPermission(user, item.permissions));

  const handleSwitchToWarehouse = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      onNavigateWarehouse();
    }, 1800);
  };

  const handleMenuClick = (label) => {
    const path = MENU_ROUTES[label];
    if (path) navigate(path);
    onMenuSelect?.(label);
  };

  return (
    <>
      {isSwitching && (
        <div className="animate-fadeIn fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-[#0f0f0f]">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-primary dark:border-[#333333]" />
              <Icon name="factory" className="animate-pulse text-primary" size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">
              Đang đồng bộ dữ liệu kho
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-[#999999]">
              Đang thống kê lại nhật ký bán hàng và cập nhật biểu đồ tồn kho real-time...
            </p>
          </div>
        </div>
      )}

      <aside
        className={`flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 dark:border-[#333333] dark:bg-[#0f0f0f] ${
          open ? 'w-[260px]' : 'w-0'
        }`}
      >
        {open && (
          <div className="flex h-full flex-col">
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
              {menuItems.map(({ icon, label }) => {
                const active = location.pathname === MENU_ROUTES[label];
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleMenuClick(label)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                      active
                        ? 'bg-blue-50 font-semibold text-blue-900 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-[#999999] dark:hover:bg-[#272727]'
                    }`}
                  >
                    <Icon name={icon} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {canAccessWarehouse && (
              <div className="shrink-0 border-t border-slate-100 px-3 py-3 dark:border-[#333333]">
                <button
                  type="button"
                  onClick={handleSwitchToWarehouse}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004785] py-2.5 text-sm font-bold text-white transition-all active:scale-95"
                >
                  <Icon name="inventory" className="text-sm" />
                  <span>Kho hàng</span>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Nút toggle sidebar */}
      <button
        type="button"
        onClick={onToggle}
        className={`z-50 flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:hover:bg-[#333333] ${
          open ? '-ml-4 mr-1' : 'ml-2'
        }`}
      >
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform dark:text-[#999999] ${open ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </>
  );
};

export default PosSidebar;
