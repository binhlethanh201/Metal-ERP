/**
 * Bộ khung Layout dùng chung cho toàn phân hệ bán hàng POS.
 * Tự động đồng bộ Header, Sidebar, cơ chế thông báo và tối ưu không gian hiển thị.
 */
import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PosSidebar from '../components/PosSidebar';
import PosHeader from '../components/PosHeader';

const PosLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState('Bán hàng');
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(null);

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2200);
  }, []);

  const handleMenuSelect = (label) => {
    setActiveMenu(label);
    if (label === 'Bán hàng') navigate('/pos');
    else if (label === 'Đơn hàng') navigate('/pos/orders');
    else if (label === 'Báo cáo') navigate('/pos/shift');
    else showNotice(`${label} đang ở giao diện demo`);
  };

  // Kiểm tra xem có phải màn hình bán hàng chính thức không
  const isMainPosScreen = location.pathname === '/pos' || location.pathname === '/pos/';

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fc] font-sans text-slate-900 antialiased">
      {/* Toast thông báo toàn hệ thống POS */}
      {notice && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {notice}
        </div>
      )}

      {/* Sidebar cố định lề trái */}
      <PosSidebar
        activeMenu={activeMenu}
        onMenuSelect={handleMenuSelect}
        onNavigateWarehouse={() => navigate('/inventory/dashboard')}
      />

      {/* Header dùng chung nhận state tìm kiếm từ Layout */}
      <PosHeader
        search={search}
        onSearchChange={setSearch}
        onBarcodeScan={() => showNotice('Đang mở chế độ quét mã')}
        onHistory={() => navigate('/pos/orders')}
        onQuickAdd={() => showNotice('Đang mở thêm sản phẩm nhanh')}
      />

      {/* Container nội dung thay đổi động */}
      {/* Nếu là màn hình chính thì bóp lề phải pr-[400px] nhường chỗ cho Giỏ hàng, trang phụ thì full width */}
      <main
        className={`fixed bottom-0 left-[260px] top-16 flex flex-col overflow-hidden bg-[#f7f9fc] p-6 transition-all duration-200 ${
          isMainPosScreen ? 'right-[400px]' : 'right-0 overflow-y-auto'
        }`}
      >
        <Outlet context={{ search, setSearch, showNotice }} />
      </main>
    </div>
  );
};

export default PosLayout;
