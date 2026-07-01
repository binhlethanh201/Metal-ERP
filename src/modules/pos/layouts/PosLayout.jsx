/**
 * Bộ khung Layout dùng chung cho toàn phân hệ bán hàng POS.
 * Tự động đồng bộ Header, Sidebar, cơ chế thông báo và tối ưu không gian hiển thị.
 */
import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PosSidebar from '../components/layout/PosSidebar';
import PosHeader from '../components/layout/PosHeader';
import PosFooter from '../components/layout/PosFooter';

const ROUTE_TO_MENU = {
  '/pos': 'Máy bán hàng',
  '/pos/orders': 'Đơn hàng',
  '/pos/customers': 'Khách',
  '/pos/shift': 'Quản lý ca bán',
  '/pos/returns': 'Đổi trả',
  '/pos/settings': 'Cài đặt',
};

const PosLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [quickAddCust, setQuickAddCust] = useState(0);
  const [drafts, setDrafts] = useState([]);
  const [footerInfo, setFooterInfo] = useState({
    orderCode: '---',
    customer: '---',
    points: '0 pts',
  });
  const noticeTimer = useRef(null);

  // Derive active menu from current route
  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = ROUTE_TO_MENU[currentPath] || 'Máy bán hàng';

  // Cart panel chỉ hiển thị ở màn hình POS chính + checkout
  const isMainPosScreen = currentPath === '/pos' || currentPath === '/pos/checkout';

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2200);
  }, []);

  const handleMenuSelect = (label) => {
    // activeMenu được derive từ route, không cần setState ở đây
  };

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
        onBarcodeScan={() => {
          navigate('/pos');
          setTimeout(() => showNotice('Đang mở chế độ quét mã'), 300);
        }}
        onHistory={() => navigate('/pos/orders')}
        onQuickAdd={() => {
          navigate('/pos');
          setTimeout(() => setQuickAddCust((c) => c + 1), 300);
        }}
      />

      {/* Container nội dung thay đổi động */}
      {/* Nếu là màn hình chính thì bóp lề phải pr-[400px] nhường chỗ cho Giỏ hàng, trang phụ thì full width */}
      <main
        className={`fixed bottom-12 left-[260px] top-16 flex flex-col overflow-hidden bg-[#f7f9fc] p-6 transition-all duration-200 ${
          isMainPosScreen ? 'right-[400px]' : 'right-0 overflow-y-auto'
        }`}
      >
        <Outlet
          context={{
            search,
            setSearch,
            showNotice,
            quickAddCust,
            drafts,
            setDrafts,
            setFooterInfo,
          }}
        />
      </main>

      {/* Footer dung chung toan POS */}
      <PosFooter
        orderCode={footerInfo.orderCode}
        staffName="Nguyễn Văn A"
        customer={footerInfo.customer}
        points={footerInfo.points}
        synced
      />
    </div>
  );
};

export default PosLayout;
