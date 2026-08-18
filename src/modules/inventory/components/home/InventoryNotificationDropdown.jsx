import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../../shared/components/Icon';
import {
  getInventoryNotifications,
  markNotificationsAsRead,
} from '../../services/inventoryCheckService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { hasPermission } from '../../../../shared/utils/permissions';

const STORAGE_KEY = 'inventory_notif_read_ids';

const getReadIds = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const addReadIds = (ids) => {
  try {
    const current = getReadIds();
    const merged = [...new Set([...current, ...ids])];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch { return ids; }
};

const InventoryNotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const [serverUnreadCount, setServerUnreadCount] = useState(0);

  // Fallback to local calculation if serverUnreadCount is 0 but we have unread local items,
  // though typically we'll rely on serverUnreadCount.
  const localUnreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadCount = Math.max(serverUnreadCount, localUnreadCount);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const invRes = await getInventoryNotifications({ pageNumber: 1, pageSize: 20 }).catch(() => null);

      if (invRes?.success && invRes.data) {
        if (typeof invRes.data.unreadCount === 'number') {
          setServerUnreadCount(invRes.data.unreadCount);
        }
        const invItems = invRes.data.items || [];
        const readIds = getReadIds();
        // Merge voi localStorage de giu isRead qua cac lan F5
        setNotifications((prev) => {
          const prevMap = new Map(prev.map((n) => [n.notificationId, n]));
          return invItems.map((n) => {
            const existing = prevMap.get(n.notificationId);
            if (existing?.isRead) return { ...n, isRead: true };
            if (readIds.includes(n.notificationId)) return { ...n, isRead: true };
            return n;
          });
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Listen to real-time events from Layout
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('RefreshNotifications', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('RefreshNotifications', handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current && !panelRef.current.contains(event.target) &&
        btnRef.current && !btnRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 9999,
    });
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
      setTimeout(updatePosition, 0);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    const allIds = notifications.filter((n) => !n.isRead).map((n) => n.notificationId);
    // Cap nhat localStorage truoc de ton tai qua F5
    addReadIds(allIds);
    try {
      const res = await markNotificationsAsRead(allIds, true);
      if (res?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setServerUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {

    // For inventory notifications
    if (!notif.isRead) {
      addReadIds([notif.notificationId]);
      try {
        await markNotificationsAsRead([notif.notificationId], false);
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
        setServerUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    setIsOpen(false);
    // Điều hướng tới trang tương ứng dựa trên loại thông báo
    const refType = notif.referenceType || (notif.inventoryCheckId ? 'InventoryCheck' : null);
    const refId = notif.referenceId || notif.inventoryCheckId;

    if (refType === 'Shift' && refId) {
      // Ca bán bất thường (chênh lệch tiền) → mở trang lịch sử ca bán + mở chi tiết ca đó
      navigate(`/inventory/shift-history?shiftId=${refId}`);
    } else if (refType === 'InwardInventory' && refId) {
      navigate(`/inventory/transactions?ticketId=${refId}&type=INWARD`);
    } else if (refType === 'OutwardInventory' && refId) {
      navigate(`/inventory/transactions?ticketId=${refId}&type=OUTWARD`);
    } else if (refType === 'InventoryCheck' && refId) {
      navigate(`/inventory/inventory-check?ticketId=${refId}`);
    } else if (notif.inventoryCheckId) {
      navigate(`/inventory/inventory-check?ticketId=${notif.inventoryCheckId}`);
    } else {
      // Fallback: parse message để đoán loại và mã phiếu
      const msg = (notif.message || '').toLowerCase();
      const ticketCodeMatch = (notif.message || '').match(/(PUR|CRN|OUT|BAL|RET|WRF|TRF)-[A-Za-z0-9]+/);
      const ticketCode = ticketCodeMatch ? ticketCodeMatch[0] : '';
      if (msg.includes('nhập kho')) {
        navigate(`/inventory/transactions?type=INWARD${ticketCode ? `&search=${ticketCode}` : ''}`);
      } else if (msg.includes('xuất kho')) {
        navigate(`/inventory/transactions?type=OUTWARD${ticketCode ? `&search=${ticketCode}` : ''}`);
      } else if (msg.includes('kiểm kê')) {
        navigate('/inventory/inventory-check');
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';

    // Đảm bảo parse chuỗi thời gian từ C# dưới dạng UTC (nếu thiếu hậu tố Z)
    const normalizedString =
      dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;

    const date = new Date(normalizedString);
    const now = new Date();

    // Đôi khi server time và local time có sai lệch vài giây, nếu < 0 thì đưa về 0
    const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));

    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getIconForType = (type, message) => {
    if (type === 'Announcement') {
      return (message || '').includes('[KHẨN')
        ? { name: 'warning', color: 'text-red-500', bg: 'bg-red-100' }
        : { name: 'campaign', color: 'text-indigo-500', bg: 'bg-indigo-100' };
    }
    
    switch (type) {
      case 'Assigned':
        return { name: 'assignment_ind', color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'Submitted':
        return { name: 'send', color: 'text-amber-500', bg: 'bg-amber-100' };
      case 'Approved':
        return { name: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-100' };
      case 'RecountRequested':
        return { name: 'replay', color: 'text-orange-500', bg: 'bg-orange-100' };
      case 'Created':
        return { name: 'add_circle', color: 'text-purple-500', bg: 'bg-purple-100' };
      default:
        return { name: 'notifications', color: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  return (
    <div className="relative pl-1">
        <button
          ref={btnRef}
          type="button"
          onClick={handleToggle}
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95 dark:text-[#999999] dark:hover:bg-[#272727]"
        >
          <Icon name="notifications" size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

      {isOpen && createPortal(
        <div ref={panelRef} style={panelStyle} className="w-80 sm:w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-[#333333] dark:bg-[#0f0f0f]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-b-[#333333] dark:bg-[#1a1a1a]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">Thông báo</h3>
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-[#808080]">
                <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                <p className="text-xs font-semibold">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-[#808080]">
                <Icon name="notifications_off" size={40} className="mb-2 opacity-50" />
                <p className="text-xs font-semibold">Bạn không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#333333]">
                {notifications.map((notif) => {
                  const iconInfo = getIconForType(notif.type, notif.message);
                  return (
                    <div
                      key={notif.notificationId}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#272727] ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/30' : ''}`}
                    >
                      <div
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconInfo.bg}`}
                      >
                        <Icon name={iconInfo.name} size={20} className={iconInfo.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        {notif.title && (
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900 dark:text-[#e5e5e5]' : 'font-semibold text-slate-700 dark:text-[#b3b3b3]'}`}>
                            {notif.title}
                          </p>
                        )}
                        <p
                          className={`${notif.title ? 'text-xs mt-0.5' : 'text-sm'} ${!notif.isRead ? (notif.title ? 'text-slate-700 dark:text-[#e5e5e5]' : 'font-bold text-slate-900 dark:text-[#e5e5e5]') : 'text-slate-600 dark:text-[#b3b3b3]'}`}
                        >
                          {notif.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-[#808080]">
                          <span className="truncate">{notif.typeDisplay}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                      {!notif.isRead && (
                        <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 shadow-sm"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 p-2 text-center dark:border-t-[#333333] dark:bg-[#1a1a1a]">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`text-xs font-bold ${unreadCount === 0 ? 'cursor-not-allowed text-slate-400 dark:text-[#666666]' : 'text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'}`}
              >
                Đánh dấu đọc tất cả
              </button>
            </div>
          )}
        </div>
        , document.body)}
    </div>
  );
};

export default InventoryNotificationDropdown;
