import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { useAuth } from '../../../../shared/hooks/useAuth';
import InventoryNotificationDropdown from './InventoryNotificationDropdown';

const InventoryTopbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isSwitching, setIsSwitching] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userRoles = Array.isArray(user?.roles) ? user?.roles : user?.role ? [user?.role] : [];
  const isOwner = userRoles.some((r) => r.toLowerCase() === 'owner');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchToPos = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      navigate('/pos');
    }, 1800);
  };

  return (
    <>
      {isSwitching && (
        <div className="animate-fadeIn fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-primary" />
              <Icon name="point_of_sale" className="animate-pulse text-primary" size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Khởi tạo thiết bị bán hàng</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Đang đồng bộ dữ liệu và kết nối máy quét mã vạch...
            </p>
          </div>
        </div>
      )}

      {/* TOPBAR CHỈ CÒN 1 TẦNG (H-16) GỌN GÀNG - ĐÃ XÓA SEARCH */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-slate-200 bg-white px-6 lg:left-[260px]">
        {/* HÀNH ĐỘNG & USER */}
        <div className="flex items-center gap-4">
          {isOwner && (
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <button
                type="button"
                onClick={handleSwitchToPos}
                className="flex items-center gap-1.5 rounded-lg border border-[#004785] px-3.5 py-1.5 text-sm font-bold text-[#004785] transition-all hover:bg-blue-50 active:scale-95"
              >
                <Icon name="point_of_sale" size={18} />
                <span>Máy bán hàng</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* THÔNG BÁO DROPDOWN */}
            <InventoryNotificationDropdown />

            {/* USER PROFILE DROPDOWN */}
            <div className="relative pl-1" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 transition-transform focus:outline-none active:scale-95"
              >
                <img
                  alt="User Avatar"
                  className="h-9 w-9 rounded-lg border border-slate-200 object-cover shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFo3D0VhkjDp6wYi7A3G3rtT-HeBeV9_Irw1MncCf1By9FiWAzrrW0Y1o_eR0BIqouI4JLwKyzpxHiyhHrOxhP1gc2OrbrKeKagYERgHPSLqIeqXh7iopYQYZFpQ3HRo32q_gQG4t9lU6JywKA9r6XbGmBU0YhjbyNzuCTVz8W4Q6FKwogP_fwDpM6p_EySDffHLbP5e-WRjoesCtXL6OJytbDZySk5VBmPYWb9eQM2XahiNm9R3AHtYeKbU3QQiT82T6wAgP0MXo"
                />
              </button>

              {isProfileOpen && (
                <div className="animate-fadeIn absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">
                      {user?.fullName || 'Người dùng'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold uppercase text-slate-500">
                      {userRoles.join(', ')}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Icon name="log_out" size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default InventoryTopbar;
