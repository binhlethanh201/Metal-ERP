/**
 * Topbar Tổng kho nâng cấp - Cấu trúc 2 tầng thông minh tự động điều chỉnh theo trang.
 * Đã thêm hiệu ứng giả lập đồng bộ khi chuyển sang phân hệ POS.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { horizontalNav } from '../../data/inventoryPageData';

const InventoryTopbar = ({ activeHubKey, setActiveHubKey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitching, setIsSwitching] = useState(false);

  // Hiển thị Tầng 2 ở trang Dashboard và Products
  const shouldShowSecondaryNav =
    location.pathname === '/inventory/dashboard' ||
    location.pathname === '/inventory/products' ||
    location.pathname.startsWith('/inventory/goods-issue') ||
    location.pathname.startsWith('/inventory/inventory-summary') ||
    location.pathname.startsWith('/inventory/import') ||
    location.pathname.startsWith('/inventory/inventory-count');

  // Hàm xử lý hiệu ứng chuyển vùng sang POS
  const handleSwitchToPos = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      navigate('/pos');
    }, 1800); // Tạo độ trễ 1.8 giây chuẩn trải nghiệm
  };

  return (
    <>
      {/* MÀN HÌNH CHUYỂN VÙNG CAO CẤP */}
      {isSwitching && (
        <div className="animate-fadeIn fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-primary" />
              <Icon name="point_of_sale" className="animate-pulse text-primary" size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Khởi tạo thiết bị bán hàng</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Đang đồng bộ cổng dữ liệu SKU và kết nối máy quét vạch...
            </p>
          </div>
        </div>
      )}

      <header className="fixed left-0 right-0 top-0 z-30 flex flex-col border-b border-slate-200 bg-white lg:left-[260px]">
        {/* TẦNG 1: SEARCH & ACTIONS */}
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex max-w-xl flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
            <Icon name="search" className="mr-2 text-slate-400" />
            <input
              className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
              placeholder="Tìm kiếm sản phẩm, đơn hàng..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <button
                type="button"
                onClick={handleSwitchToPos}
                className="flex items-center gap-1 rounded-lg border border-[#004785] px-4 py-2 text-sm font-bold text-[#004785] transition-all hover:bg-blue-50 active:scale-95"
              >
                <Icon name="point_of_sale" className="text-sm" />
                <span>Máy bán hàng</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <Icon name="notifications" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
              </button>
              <div className="flex items-center gap-3 pl-2">
                <img
                  alt="User Profile Avatar"
                  className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFo3D0VhkjDp6wYi7A3G3rtT-HeBeV9_Irw1MncCf1By9FiWAzrrW0Y1o_eR0BIqouI4JLwKyzpxHiyhHrOxhP1gc2OrbrKeKagYERgHPSLqIeqXh7iopYQYZFpQ3HRo32q_gQG4t9lU6JywKA9r6XbGmBU0YhjbyNzuCTVz8W4Q6FKwogP_fwDpM6p_EySDffHLbP5e-WRjoesCtXL6OJytbDZySk5VBmPYWb9eQM2XahiNm9R3AHtYeKbU3QQiT82T6wAgP0MXo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 2: NAVIGATION NGANG */}
        {shouldShowSecondaryNav && (
          <div className="animate-fadeIn flex h-12 items-center border-t border-slate-100 bg-[#faf9fc] px-6">
            <nav className="no-scrollbar flex h-10 w-full items-center gap-8 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
              {horizontalNav.map((item) => {
                const isTabActive =
                  activeHubKey === item.key || (item.path && location.pathname === item.path);

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (item.key) setActiveHubKey(item.key);
                      if (item.path) navigate(item.path);
                    }}
                    className={`group relative flex h-full items-center gap-2 px-2 transition-colors ${
                      isTabActive
                        ? 'font-semibold text-primary'
                        : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[20px]" />
                    <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
                    <span
                      className={`absolute bottom-0 left-2 right-2 h-0.5 bg-primary transition-transform duration-200 ${
                        isTabActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default InventoryTopbar;
