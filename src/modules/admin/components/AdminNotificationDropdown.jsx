import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getRecentEvents } from '../services/adminService';

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
      const res = await getRecentEvents(10);
      const items = Array.isArray(res) ? res : res?.data || [];
      setNotifications(items);

      const lastViewed = localStorage.getItem('admin_notif_last_viewed');
      if (!lastViewed) {
        setUnreadCount(items.length);
      } else {
        const lastViewedDate = new Date(lastViewed);
        const count = items.filter(n => new Date(n.timestamp || n.Timestamp) > lastViewedDate).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
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
    localStorage.setItem('admin_notif_last_viewed', new Date().toISOString());
    setUnreadCount(0);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const normalizedString = dateString.endsWith('Z') || dateString.includes('+') ? dateString : dateString + 'Z';
    const date = new Date(normalizedString);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));
    
    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return diffInMinutes + ' phút trước';
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return diffInHours + ' giờ trước';
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return diffInDays + ' ngày trước';
    return date.toLocaleDateString('vi-VN');
  };

  const getIconForTarget = (target) => {
    switch (target?.toUpperCase()) {
      case 'ERROR':
      case 'DELETE':
      case 'DELETE_ACCOUNT':
        return { name: 'error', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'WARNING':
      case 'UPDATE':
      case 'UPDATE_ACCOUNT':
        return { name: 'warning', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'INFO':
      case 'CREATE':
      case 'CREATE_OWNER':
        return { name: 'add_circle', color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' };
      default:
        return { name: 'notifications', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:hover:bg-[#272727]"
      >
        <Icon name="notifications" size={16} />
        {unreadCount > 0 && (
           <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-red-500">
             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
           </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">Thông báo hệ thống</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-[#999999]">
                <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                <p className="text-xs font-semibold">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-[#999999]">
                <Icon name="notifications_off" size={40} className="mb-2 opacity-50" />
                <p className="text-xs font-semibold">Không có thông báo mới nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-[#333333]">
                {notifications.map((notif) => {
                  const iconInfo = getIconForTarget(notif.level || notif.action);
                  const isUnread = localStorage.getItem('admin_notif_last_viewed') ? new Date(notif.timestamp || notif.Timestamp) > new Date(localStorage.getItem('admin_notif_last_viewed')) : true;
                  return (
                    <div
                      key={notif.logId || notif.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/admin/logs');
                      }}
                      className={"flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a]" + (isUnread ? " bg-blue-50/50 dark:bg-blue-900/10" : "")}
                    >
                      <div className={"mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full " + iconInfo.bg}>
                        <Icon name={iconInfo.name} size={20} className={iconInfo.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5] mb-1">
                          {notif.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-[#666666]">
                          <span className={notif.level === 'ERROR' ? 'text-red-500' : ''}>{notif.action || 'Hoạt động'}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(notif.timestamp || notif.Timestamp)}</span>
                        </div>
                      </div>
                      {isUnread && (
                        <div className="mt-2 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-2 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/logs');
                }}
                className="text-xs font-bold text-[#004785] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Tới trang Lịch sử hệ thống
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;

