import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getNotificationList } from '../services/adminService';

const STORAGE_KEY = 'admin_notif_last_seen';

const getLastSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

const setLastSeen = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const AdminNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationList({ page: 1, pageSize: 20 });
      const items = res?.items || res?.data?.items || [];
      setNotifications(items);

      const lastSeen = getLastSeen();
      if (lastSeen) {
        const count = items.filter((n) => {
          const createdAt = n.createdAt ? new Date(n.createdAt.endsWith('Z') || n.createdAt.includes('+') ? n.createdAt : n.createdAt + 'Z') : null;
          return createdAt && createdAt > new Date(lastSeen);
        }).length;
        setUnreadCount(count);
      } else {
        setUnreadCount(items.length);
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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

  const handleMarkAllAsRead = () => {
    setLastSeen(new Date().toISOString());
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif) => {
    setIsOpen(false);
    navigate('/admin/notifications');
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const normalizedString = dateString.endsWith('Z') || dateString.includes('+') ? dateString : dateString + 'Z';
    const date = new Date(normalizedString);
    const now = new Date();
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

  const getIconForTarget = (target) => {
    switch ((target || '').toUpperCase()) {
      case 'ALL':
      case 'ALL_USERS':
        return { name: 'public', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'OWNER':
        return { name: 'storefront', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'STAFF':
        return { name: 'badge', color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' };
      case 'COMMUNITY':
        return { name: 'groups', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
      default:
        return { name: 'notifications', color: 'text-slate-500 dark:text-[#999999]', bg: 'bg-slate-100 dark:bg-[#272727]' };
    }
  };

  const lastSeen = getLastSeen();
  const isUnread = (notif) => {
    if (!lastSeen) return true;
    const createdAt = notif.createdAt
      ? new Date(notif.createdAt.endsWith('Z') || notif.createdAt.includes('+') ? notif.createdAt : notif.createdAt + 'Z')
      : null;
    return createdAt && createdAt > new Date(lastSeen);
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
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-b-[#333333] dark:bg-[#1a1a1a]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">Thông báo</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-[#808080]">
                <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                <p className="text-xs font-semibold">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-[#808080]">
                <Icon name="notifications_off" size={40} className="mb-2 opacity-50" />
                <p className="text-xs font-semibold">Không có thông báo mới nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#333333]">
                {notifications.map((notif) => {
                  const iconInfo = getIconForTarget(notif.target);
                  const unread = isUnread(notif);
                  return (
                    <div
                      key={notif.notificationId}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#272727] ${unread ? 'bg-blue-50/30 dark:bg-blue-900/30' : ''}`}
                    >
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconInfo.bg}`}>
                        <Icon name={iconInfo.name} size={20} className={iconInfo.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${unread ? 'font-bold text-slate-900 dark:text-[#e5e5e5]' : 'font-semibold text-slate-700 dark:text-[#b3b3b3]'}`}>
                          {notif.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${unread ? 'text-slate-700 dark:text-[#e5e5e5]' : 'text-slate-600 dark:text-[#b3b3b3]'}`}>
                          {notif.content}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-[#808080]">
                          <span className={notif.isUrgent ? 'text-red-500' : ''}>{notif.isUrgent ? 'Khẩn cấp' : notif.target}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                      {unread && (
                        <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 shadow-sm" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

export default AdminNotificationDropdown;