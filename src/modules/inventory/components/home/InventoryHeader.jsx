import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
import { useAuth } from '../../../../shared/hooks/useAuth';
import InventoryNotificationDropdown from './InventoryNotificationDropdown';

const InventoryHeader = () => {
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

  const handleGoToAccountSettings = () => {
    setIsProfileOpen(false);
    navigate('/account-settings');
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

      {/* TOPBAR */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
        {/* LOGO */}
        <Logo moduleName="Tổng Kho" />

        {/* HÀNH ĐỘNG & USER */}
        <div className="flex items-center gap-3">
          {/* NÚT MÁY BÁN HÀNG: Đã đổi style giống nút Quét Mã của PosHeader */}
          {isOwner && (
            <button
              type="button"
              onClick={handleSwitchToPos}
              className="flex items-center gap-2 rounded-lg border border-[#004785] bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#003566] active:scale-95"
            >
              <Icon name="point_of_sale" className="text-base" />
              <span>Máy bán hàng</span>
            </button>
          )}

          {/* THÔNG BÁO DROPDOWN */}
          <InventoryNotificationDropdown />

          {/* USER PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white transition-transform active:scale-95"
            >
              {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
            </button>

            {isProfileOpen && (
              <div className="animate-fadeIn absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-800">{user?.fullName || user?.name}</p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold uppercase text-slate-500">
                    {userRoles.join(', ')}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleGoToAccountSettings}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <Icon name="settings" size={16} className="text-slate-500" />
                    Cài đặt tài khoản
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Icon name="logout" className="text-base" /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default InventoryHeader;
