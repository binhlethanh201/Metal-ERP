/**
 * Header POS - Thanh ngang top, nằm trong flex layout.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
import ShiftBadge from '../../../../shared/components/ShiftBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useTheme } from '../../../../shared/contexts/ThemeContext';

const PosHeader = ({ onBarcodeScan, onHistory, onQuickAdd }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToAccountSettings = () => {
    setIsProfileOpen(false);
    navigate('/account-settings');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 dark:border-[#333333] dark:bg-[#0f0f0f]">
      <Logo moduleName="Máy bán hàng" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBarcodeScan}
          className="flex items-center gap-2 rounded-lg border border-[#004785] bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#003566] active:scale-95"
        >
          <Icon name="qr_code_scanner" className="text-base" />
          <span>Quét mã</span>
        </button>
        <button
          type="button"
          onClick={onHistory}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-95 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:border-[#555555] dark:hover:bg-[#333333]"
        >
          <Icon name="history" className="text-base" />
          <span>Lịch sử</span>
        </button>

        <ShiftBadge />

        {/* Avatar / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white transition-transform active:scale-95"
          >
            {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
          </button>

          {isProfileOpen && (
            <div className="animate-fadeIn absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
              {/* User info */}
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <p className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">
                  {user?.fullName || user?.name || 'Người dùng'}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                  {userRoles.join(', ')}
                </p>
              </div>

              {/* Menu items */}
              <div className="p-1">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
                >
                  <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={16} className="text-slate-500 dark:text-[#999999]" />
                  {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                </button>

                {/* Cài đặt tài khoản */}
                <button
                  onClick={handleGoToAccountSettings}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
                >
                  <Icon name="settings" size={16} className="text-slate-500 dark:text-[#999999]" />
                  Cài đặt tài khoản
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-[#333333]" />

                {/* Đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Icon name="logout" size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PosHeader;
