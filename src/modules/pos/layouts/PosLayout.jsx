/**
 * Bộ khung Layout dùng chung cho toàn phân hệ bán hàng POS.
 * Thiết kế dạng bảng: sidebar | content (cart | products) | footer
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
};

const DRAFTS_STORAGE_KEY = 'pos_drafts';

const PosLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [quickAddCust, setQuickAddCust] = useState(0);
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [footerInfo, setFooterInfo] = useState({
    orderCode: '---',
    customer: '---',
    points: '0 pts',
  });
  const noticeTimer = useRef(null);

  // Lưu đơn nháp xuống localStorage để không bị mất khi F5
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch {}
  }, [drafts]);

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = ROUTE_TO_MENU[currentPath] || 'Máy bán hàng';

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2200);
  }, []);

  const handleMenuSelect = (label) => {};

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f9fc] font-sans text-slate-900 antialiased dark:bg-[#0a0a0a] dark:text-[#e5e5e5]">
      {/* Toast */}
      {notice && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl dark:bg-[#272727]">
          {notice}
        </div>
      )}

      {/* Header */}
      <PosHeader
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

      {/* Body: sidebar + content */}
      <div className="flex flex-1 gap-3 overflow-hidden p-3">
        <PosSidebar
          activeMenu={activeMenu}
          onMenuSelect={handleMenuSelect}
          onNavigateWarehouse={() => navigate('/inventory')}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
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
      </div>

      {/* Footer */}
      <PosFooter
        orderCode={footerInfo.orderCode}
        staffName="Nguyễn Văn A"
        customer={footerInfo.customer}
        points={footerInfo.points}
        synced
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
};

export default PosLayout;
