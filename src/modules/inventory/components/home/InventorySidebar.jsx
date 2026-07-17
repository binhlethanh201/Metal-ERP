import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { sidebarItems } from '../../data/inventoryPageData';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { hasRole } from '../../../../shared/utils/roleRedirect';

const InventorySidebar = ({ open = true, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const initial = {};
    sidebarItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => child.path && location.pathname.startsWith(child.path)
        );
        if (isChildActive) {
          initial[item.label] = true;
        }
      }
    });
    return initial;
  });

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isOwner = hasRole(userRoles, 'Owner');

  const visibleMenuItems = useMemo(() => {
    const checkPermission = (item) => {
      if (item.ownerOnly && !isOwner) return false;
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

  const toggleParentMenu = (label, path, children) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    if (path) {
      navigate(path);
    }
  };

  const isItemActive = (path) => {
    if (!path) return false;

    if (path === '/inventory/dashboard')
      return location.pathname.startsWith('/inventory/dashboard');

    if (path === '/inventory/owner-dashboard')
      return location.pathname.startsWith('/inventory/owner-dashboard');

    if (path === '/inventory/reports') return location.pathname === '/inventory/reports';
    if (path === '/inventory/owner-reports')
      return location.pathname.startsWith('/inventory/owner-reports');

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (!isAuthenticated) {
    return (
      <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white" />
    );
  }

  return (
    <>
      <aside
        className={`flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 ${
          open ? 'w-[260px]' : 'w-0'
        }`}
      >
        {open && (
          <nav className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
            {visibleMenuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isParentExpanded = expandedMenus[item.label];
              const active = isItemActive(item.path);
              const isAnyChildActive =
                hasChildren && item.children.some((c) => isItemActive(c.path));

              return (
                <div key={item.label} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleParentMenu(item.label, item.path, item.children)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors duration-150 ${
                      active
                        ? 'bg-blue-50 font-bold text-[#004785]'
                        : isAnyChildActive
                          ? 'bg-slate-100 font-bold text-[#004785]'
                          : 'font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    } ${hasChildren ? 'cursor-pointer' : ''}`}
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
        )}
      </aside>

      {/* Nút thu gọn sidebar */}
      <button
        type="button"
        onClick={onToggle}
        className={`inventory-sidebar-toggle z-50 flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:bg-slate-50 ${
          open ? '-ml-4 mr-1' : 'ml-2'
        }`}
        aria-label="Toggle sidebar"
      >
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? '' : 'rotate-180'}`}
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

export default InventorySidebar;
