/** * Sidebar POS - Menu chức năng (Bán hàng, Đơn hàng, Khách, Báo cáo, Cài đặt) + nút Kho hàng.
 * Đã tinh chỉnh cỡ chữ và thêm hiệu ứng giả lập đồng bộ khi chuyển sang phân hệ Tổng kho.
 */
import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Logo from '../../../shared/components/Logo';

const PosSidebar = ({ activeMenu, onMenuSelect, onNavigateWarehouse }) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const menuItems = [
    ['shopping_cart', 'Bán hàng'],
    ['assignment', 'Đơn hàng'],
    ['groups', 'Khách'],
    ['assessment', 'Báo cáo'],
    ['settings', 'Cài đặt'],
  ];

  // Hàm xử lý hiệu ứng chuyển vùng về Tổng kho
  const handleSwitchToWarehouse = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      onNavigateWarehouse(); // Thực thi hàm điều hướng gốc truyền từ Layout
    }, 1800);
  };

  return (
    <>
      {/* MÀN HÌNH CHUYỂN VÙNG VỀ TỔNG KHO */}
      {isSwitching && (
        <div className="animate-fadeIn fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-primary" />
              <Icon name="factory" className="animate-pulse text-primary" size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Đang đồng bộ dữ liệu kho</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Đang thống kê lại nhật ký bán hàng và cập nhật biểu đồ tồn kho real-time...
            </p>
          </div>
        </div>
      )}

      <aside className="custom-scrollbar fixed left-0 top-0 z-50 flex h-[calc(100vh-3rem)] w-[260px] flex-col overflow-y-auto border-r border-slate-200 bg-white p-4">
        {/* Khối Logo đồng bộ hệ thống */}
        <div className="mb-8 px-2">
          <Logo moduleName="Bán Hàng" />
        </div>

        {/* Điều hướng Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map(([icon, label]) => {
            const active = activeMenu === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onMenuSelect(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                  active
                    ? 'bg-blue-50 font-semibold text-blue-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon name={icon} />
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Khối chân trang giữ nguyên nút Kho hàng */}
        <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleSwitchToWarehouse}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004785] py-3 font-bold text-white transition-all active:scale-95"
          >
            <Icon name="inventory" className="text-sm" />
            <span>Kho hàng</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default PosSidebar;
