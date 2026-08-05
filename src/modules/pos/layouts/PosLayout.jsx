/**
 * Bộ khung Layout dùng chung cho toàn phân hệ bán hàng POS.
 * Thiết kế dạng bảng: sidebar | content (cart | products) | footer
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import PosSidebar from '../components/layout/PosSidebar';
import PosHeader from '../components/layout/PosHeader';
import PosFooter from '../components/layout/PosFooter';
import Icon from '../../../shared/components/Icon';
import { useAuth } from '../../../shared/hooks/useAuth';

const API_BASE = process.env.REACT_APP_API_URL;
const MEP_HUB_URL = `${API_BASE}/r/mepHub`;
const POS_HUB_URL = `${API_BASE}/r/posHub`;

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
  const { user } = useAuth();

  // Lấy branchId: ưu tiên user object, fallback decode JWT
  const getBranchId = () => {
    if (user?.branchId) return String(user.branchId);
    if (user?.BranchId) return String(user.BranchId);
    if (user?.defaultBranchId) return String(user.defaultBranchId);
    // Decode JWT để lấy branchId claim
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.branchId) return String(payload.branchId);
        if (payload.BranchId) return String(payload.BranchId);
      }
    } catch {}
    return '';
  };
  const branchId = getBranchId();

  const [toasts, setToasts] = useState([]);
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

  // ---- Toast helpers ----
  const addToast = useCallback((message, type = 'info', description = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'warning' || type === 'error' ? 8000 : 5000);
  }, []);

  const mepHubRef = useRef(null);
  const posHubRef = useRef(null);

  // ---- mepHub: SystemNotification ----
  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(MEP_HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    mepHubRef.current = connection;

    connection.on('SystemNotification', (data) => {
      addToast(
        `${data.title || 'Thông báo hệ thống mới'}`,
        data.isUrgent ? 'warning' : 'info',
        data.content
      );
    });

    connection.start().catch((err) => {
      console.warn('mepHub không thể kết nối:', err.message);
    });

    return () => {
      connection.stop().catch(() => {});
    };
  }, [addToast]);

  // ---- posHub: Shift events (cần join branch group) ----
  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token || !branchId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(POS_HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    posHubRef.current = connection;

    connection.on('ShiftOpened', (data) => {
      console.log('[posHub] ShiftOpened:', data);
      addToast(
        `Ca bán ${data.shiftCode || ''} đã được mở`,
        'info'
      );
      window.dispatchEvent(new CustomEvent('shift-state-changed', { detail: { type: 'opened', ...data } }));
    });

    connection.on('ShiftClosed', (data) => {
      console.log('[posHub] ShiftClosed:', data);
      localStorage.removeItem('pos_active_shift');
      const summary = data.summary || data;
      const forceMsg = summary.forceClosed ? ' (chốt hộ)' : '';
      const closedBy = summary.closedBy || '';
      addToast(
        `Ca bán đã được chốt${forceMsg}${closedBy ? ' bởi ' + closedBy : ''}. Tổng doanh thu: ${(summary.totalRevenue || 0).toLocaleString('vi-VN')} VNĐ`,
        'warning'
      );
      window.dispatchEvent(new CustomEvent('shift-state-changed', { detail: { type: 'closed', ...data } }));
    });

    connection.start().then(() => {
      console.log('[posHub] Đã kết nối, joining branch group:', branchId);
      connection.invoke('JoinBranchGroup', String(branchId)).then(() => {
        console.log('[posHub] Đã join branch group:', branchId);
      }).catch((err) => {
        console.warn('[posHub] JoinBranchGroup thất bại:', err.message);
      });
    }).catch((err) => {
      console.warn('[posHub] Không thể kết nối:', err.message);
    });

    return () => {
      connection.stop().catch(() => {});
    };
  }, [addToast, branchId]);

  const TOAST_STYLES = {
    info: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200',
    warning: 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-200',
    error: 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-200',
    success: 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-200',
  };
  const TOAST_ICONS = {
    info: 'info',
    warning: 'warning',
    error: 'dangerous',
    success: 'check_circle',
  };

  const handleMenuSelect = (label) => {};

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f9fc] font-sans text-slate-900 antialiased dark:bg-[#0a0a0a] dark:text-[#e5e5e5]">
      {/* Toast notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-full max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-4 rounded-xl border p-5 shadow-2xl transition-all ${TOAST_STYLES[t.type]} w-full`}
          >
            <Icon name={TOAST_ICONS[t.type]} size={24} className="mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-base font-black uppercase tracking-wide">{t.message}</span>
              {t.description && (
                <span className="mt-1.5 text-sm font-medium opacity-90">{t.description}</span>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
      {/* Toast */}
      {notice && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl dark:bg-[#272727]">
          {notice}
        </div>
      )}

      {/* Header */}
      <PosHeader
        onHistory={() => navigate('/pos/orders')}
        onQuickAdd={() => {
          navigate('/pos');
          setTimeout(() => setQuickAddCust((c) => c + 1), 300);
        }}
      />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 gap-3 p-3 min-h-0">
        <PosSidebar
          activeMenu={activeMenu}
          onMenuSelect={handleMenuSelect}
          onNavigateWarehouse={() => navigate('/inventory')}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex flex-1 flex-col overflow-auto min-h-0">
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
