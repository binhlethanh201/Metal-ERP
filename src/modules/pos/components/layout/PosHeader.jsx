/** * Header POS nâng cấp - Search bar + Dropdown Đăng xuất
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { useAuth } from '../../../../shared/hooks/useAuth';

const PosHeader = ({ search, onSearchChange, onBarcodeScan, onHistory, onQuickAdd }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Xử lý click ra ngoài để đóng dropdown avatar
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

  const userRoles = Array.isArray(user?.roles) ? user?.roles : user?.role ? [user?.role] : [];

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 lg:left-[260px]">
      {/* KHỐI SEARCH BAR */}
      <div className="flex max-w-xl flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
        <Icon name="search" className="mr-2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
          placeholder="Tìm sản phẩm (Tên, mã SKU, barcode...)"
          type="text"
        />
      </div>

      {/* KHỐI ACTION BUTTONS & USER PROFILE */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <button
            type="button"
            onClick={onBarcodeScan}
            className="flex items-center gap-x-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
          >
            <Icon name="barcode" className="text-sm" />
            <span>Quét mã</span>
          </button>
          <button
            type="button"
            onClick={onHistory}
            className="flex items-center gap-x-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
          >
            <Icon name="history" className="text-sm" />
            <span>Lịch sử</span>
          </button>
          <button
            type="button"
            onClick={onQuickAdd}
            className="flex items-center gap-x-2 rounded-xl bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
          >
            <Icon name="add" className="text-sm" />
            <span>Thêm nhanh</span>
          </button>
        </div>

        {/* KHỐI TIỆN ÍCH CHÂN DUNG USER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <Icon name="notifications" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
          </button>

          {/* DROPDOWN AVATAR */}
          <div className="relative pl-2" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 transition-transform focus:outline-none active:scale-95"
            >
              <img
                alt="User Profile Avatar"
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFo3D0VhkjDp6wYi7A3G3rtT-HeBeV9_Irw1MncCf1By9FiWAzrrW0Y1o_eR0BIqouI4JLwKyzpxHiyhHrOxhP1gc2OrbrKeKagYERgHPSLqIeqXh7iopYQYZFpQ3HRo32q_gQG4t9lU6JywKA9r6XbGmBU0YhjbyNzuCTVz8W4Q6FKwogP_fwDpM6p_EySDffHLbP5e-WRjoesCtXL6OJytbDZySk5VBmPYWb9eQM2XahiNm9R3AHtYeKbU3QQiT82T6wAgP0MXo"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-800">
                    {user?.fullName || 'Nhân viên POS'}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold uppercase text-slate-500">
                    {userRoles.join(', ')}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
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
  );
};

export default PosHeader;
