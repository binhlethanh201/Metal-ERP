/** * Header POS - Thanh ngang top, nằm trong flex layout. */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
import { useAuth } from '../../../../shared/hooks/useAuth';

const PosHeader = ({ onBarcodeScan, onHistory, onQuickAdd }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
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
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-95"
        >
          <Icon name="history" className="text-base" />
          <span>Lịch sử</span>
        </button>

        {/* Avatar / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white"
          >
            {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">
                  {user?.fullName || user?.name || 'Admin'}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email || ''}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Icon name="logout" className="text-base" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PosHeader;
