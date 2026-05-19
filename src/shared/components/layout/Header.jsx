/**
 * Header Component - Header chung cho tất cả pages
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="fixed left-[260px] right-0 top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-4 px-6 py-0">
        <div className="flex max-w-xl flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <span className="material-symbols-outlined mr-2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <button
              type="button"
              onClick={() => navigate('/inventory/export')}
              className="rounded-lg border border-[#F59E0B] px-4 py-2 text-sm font-bold text-[#F59E0B] transition-all active:scale-95"
            >
              Xuất kho
            </button>
            <button
              type="button"
              onClick={() => navigate('/pos')}
              className="flex items-center gap-1 rounded-lg border border-[#004785] px-4 py-2 text-sm font-bold text-[#004785] transition-all hover:bg-blue-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">point_of_sale</span>
              <span>Máy bán hàng</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
            </button>
            <div className="flex items-center gap-3 pl-2">
              <img
                alt="User Profile Avatar"
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                src={
                  user?.avatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCFo3D0VhkjDp6wYi7A3G3rtT-HeBeV9_Irw1MncCf1By9FiWAzrrW0Y1o_eR0BIqouI4JLwKyzpxHiyhHrOxhP1gc2OrbrKeKagYERgHPSLqIeqXh7iopYQYZFpQ3HRo32q_gQG4t9lU6JywKA9r6XbGmBU0YhjbyNzuCTVz8W4Q6FKwogP_fwDpM6p_EySDffHLbP5e-WRjoesCtXL6OJytbDZySk5VBmPYWb9eQM2XahiNm9R3AHtYeKbU3QQiT82T6wAgP0MXo'
                }
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
