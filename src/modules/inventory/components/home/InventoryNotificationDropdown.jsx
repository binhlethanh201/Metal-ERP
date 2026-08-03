import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../../shared/components/Icon';
import {
  getInventoryNotifications,
  getSystemNotifications,
  markNotificationsAsRead,
} from '../../services/inventoryCheckService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';

const InventoryNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const invRes = await getInventoryNotifications({ pageNumber: 1, pageSize: 20 }).catch(() => null);
      
      let invItems = [];
      let newUnreadCount = 0;

      if (invRes?.success && invRes.data) {
        invItems = invRes.data.items || [];
        newUnreadCount = invRes.data.unreadCount || 0;
      }

      setNotifications(invItems);
      setUnreadCount(newUnreadCount);
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
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const res = await markNotificationsAsRead(null, true);
      if (res?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {

    // For inventory notifications
    if (!notif.isRead) {
      try {
        await markNotificationsAsRead([notif.notificationId], false);
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    setIsOpen(false);
    // Điều hướng tới trang tương ứng dựa trên loại thông báo
    const refType = notif.referenceType || (notif.inventoryCheckId ? 'InventoryCheck' : null);
    const refId = notif.referenceId || notif.inventoryCheckId;

    if (refType === 'InwardInventory' && refId) {
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
    <div className="relative pl-1" ref={dropdownRef}>
      <button
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

      {isOpen && (
        <div className="animate-fadeIn absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f] sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-b-[#333333] dark:bg-[#1a1a1a]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">Thông báo</h3>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
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
      )}
    </div>
  );
};

export default InventoryNotificationDropdown;
