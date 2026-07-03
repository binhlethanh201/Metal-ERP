/**
 * Sidebar Tổng kho
 * Tinh chỉnh lùi lề menu con sang trái để hiển thị trọn vẹn chữ mà không đổi kích thước sidebar.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
import { sidebarItems } from '../../data/inventoryPageData';
import { useAuth } from '../../../../shared/hooks/useAuth';

const InventorySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isOwner = userRoles.includes('Owner');

  // Lọc menu theo quyền (RBAC)
  const visibleMenuItems = useMemo(() => {
    // Hàm kiểm tra xem 1 item có được hiển thị với user hiện tại không
    const checkPermission = (item) => {
      // Nếu là mục dành riêng cho Owner mà user không phải Owner -> Ẩn
      if (item.ownerOnly && !isOwner) return false;
      // Nếu là mục dành riêng cho Staff (không phải Owner) mà user lại là Owner -> Ẩn
      if (item.staffOnly && isOwner) return false;
      return true;
    };

    return sidebarItems.filter(checkPermission).map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(checkPermission),
        };
      }
      return item;
    });
  }, [isOwner]);

  // Tự động mở menu cha nếu URL đang ở trang con
  useEffect(() => {
    visibleMenuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => child.path && location.pathname.startsWith(child.path)
        );
        if (isChildActive) {
          setExpandedMenus((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [location.pathname, visibleMenuItems]);

  const toggleParentMenu = (label, path) => {
    if (path) {
      navigate(path);
    } else {
      setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    }
  };

  const isItemActive = (path) => {
    if (!path) return false;
    if (path === '/inventory/dashboard')
      return location.pathname.startsWith('/inventory/dashboard');
    if (path === '/inventory/reports') return location.pathname === '/inventory/reports';
    if (path === '/inventory/owner-reports')
      return location.pathname.startsWith('/inventory/owner-reports');

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[260px] select-none flex-col border-r border-slate-200 bg-white p-3.5">
      {/* Khối Logo thương hiệu */}
      <div className="mb-6 px-2.5">
        <Logo moduleName="Tổng Kho" />
      </div>

      {/* Vùng điều hướng Menu chính */}
      <nav className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {visibleMenuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isParentExpanded = expandedMenus[item.label];
          const active = isItemActive(item.path);

          const isAnyChildActive = hasChildren && item.children.some((c) => isItemActive(c.path));

          return (
            <div key={item.label} className="flex flex-col">
              {/* MENU CHA */}
              <button
                type="button"
                onClick={() => toggleParentMenu(item.label, item.path)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors duration-200 ${
                  active
                    ? 'bg-blue-50 font-bold text-[#004785]'
                    : isAnyChildActive
                      ? 'bg-slate-100 font-bold text-[#004785]'
                      : 'font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} size={22} className="shrink-0" />
                  <span className="text-[15px] leading-none">{item.label}</span>
                </div>

                {hasChildren && (
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isParentExpanded ? 'rotate-180 text-[#004785]' : 'text-slate-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* DANH SÁCH MENU CON: Lùi lề trái từ pl-9 thành pl-5 để mở rộng không gian chữ */}
              {hasChildren && isParentExpanded && (
                <div className="animate-fadeIn mt-1 flex flex-col space-y-1 pl-5 pr-1">
                  {item.children.map((child) => {
                    const childActive = isItemActive(child.path);
                    return (
                      <button
                        key={child.label}
                        type="button"
                        onClick={() => child.path && navigate(child.path)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 ${
                          childActive
                            ? 'bg-blue-50 font-bold text-[#004785]'
                            : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            childActive ? 'bg-[#004785]' : 'bg-slate-300'
                          }`}
                        />
                        {/* Loại bỏ truncate, dùng whitespace-normal để hiển thị hết chữ */}
                        <span className="whitespace-normal break-words leading-snug">
                          {child.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default InventorySidebar;
