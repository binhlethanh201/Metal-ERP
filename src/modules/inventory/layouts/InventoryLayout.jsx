import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import InventorySidebar from '../components/home/InventorySidebar';
import InventoryHeader from '../components/home/InventoryHeader';
import AiChatWidget from '../../../shared/components/AiChatWidget';
import Icon from '../../../shared/components/Icon';
import { getInventoryNotifications } from '../services/inventoryCheckService';
import { useAuth } from '../../../shared/hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5100';
const HUB_URL = `${API_BASE}/r/mepHub`;

const InventoryLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState([]);
  const hubRef = useRef(null);

  // ---- Toast helpers ----
  const addToast = useCallback((message, type = 'info', description = null, notifId = null) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, description, notifId }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'warning' || type === 'error' ? 8000 : 5000);
  }, []);

  const handleDismissToast = (t) => {
    setToasts((prev) => prev.filter((item) => item.id !== t.id));
    if (t.notifId) {
      const key = `dismissed_toasts_${user?.userId || 'guest'}`;
      const dismissed = JSON.parse(localStorage.getItem(key) || '[]');
      if (!dismissed.includes(t.notifId)) {
        dismissed.push(t.notifId);
        localStorage.setItem(key, JSON.stringify(dismissed));
      }
    }
  };

  useEffect(() => {
    window.testToast = () => addToast('Đây là thông báo test', 'info', 'Chi tiết test');
    return () => { delete window.testToast; };
  }, [addToast]);

  // Load missed recent system notifications on mount (within 1 hour)
  useEffect(() => {
    const fetchRecentSysNotifs = async () => {
      try {
        const res = await getInventoryNotifications({ pageNumber: 1, pageSize: 20 });
        if (res?.success && res.data?.items) {
          const items = res.data.items;
          const now = new Date();
          const key = `dismissed_toasts_${user?.userId || 'guest'}`;
          const dismissed = JSON.parse(localStorage.getItem(key) || '[]');
          
          const recent = items.filter(n => {
            if (n.type !== 'Announcement' || n.isRead || dismissed.includes(n.notificationId)) return false;
            const createdAt = new Date(n.createdAt.endsWith('Z') || n.createdAt.includes('+') ? n.createdAt : n.createdAt + 'Z');
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
            return hoursDiff <= 1; // within 1 hour
          });
          
          // Show toasts sequentially or together
          recent.forEach((n, idx) => {
            setTimeout(() => {
              const isUrgent = (n.message || '').includes('[KHẨN');
              addToast(
                isUrgent ? 'Thông báo Khẩn cấp' : 'Thông báo hệ thống mới',
                isUrgent ? 'warning' : 'info',
                n.message,
                n.notificationId
              );
            }, idx * 1000); // Stagger toasts by 1 second
          });
        }
      } catch (err) {
        console.error('Failed to fetch recent system notifs on mount:', err);
      }
    };
    
    fetchRecentSysNotifs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- SignalR real-time connection ----
  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hubRef.current = connection;

    // Lắng nghe Thông báo hệ thống từ Admin
    connection.on('SystemNotification', (data) => {
      console.log('SIGNALR: Received SystemNotification', data);
      addToast(
        `${data.title || 'Thông báo hệ thống mới'}`,
        data.isUrgent ? 'warning' : 'info',
        data.content
      );
      // Phát sự kiện để báo cho các component khác (như Notification Dropdown) cập nhật
      window.dispatchEvent(new CustomEvent('RefreshNotifications'));
    });

    connection.start().catch((err) => {
      console.warn('SignalR không thể kết nối từ Inventory:', err.message);
    });

    return () => {
      connection.stop().catch(() => {});
    };
  }, [addToast]);

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
              onClick={() => handleDismissToast(t)}
              className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
      <InventoryHeader />
      <div className="flex flex-1 gap-3 overflow-hidden p-3">
        <InventorySidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#004785]" />
              </div>
            }
          >
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <Outlet />
            </div>
          </Suspense>
          <AiChatWidget />
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;
