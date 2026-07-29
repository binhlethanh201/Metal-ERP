import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getNotificationList } from '../services/adminService';

const AdminNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationList({ page: 1, pageSize: 10 });
      // Assuming res is either PageResultDto directly or { data: PageResultDto }
      const items = res?.items || res?.data?.items || [];
      setNotifications(items);
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
      case 'ALL':
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:hover:bg-[#272727]"
      >
        <Icon name="notifications" size={16} />
        {notifications.length > 0 && (
           <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">Thông báo hệ thống</h3>
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
                  const iconInfo = getIconForTarget(notif.target);
                  return (
                    <div
                      key={notif.notificationId}
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/admin/notifications');
                      }}
                      className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
                    >
                      <div className={"mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full " + iconInfo.bg}>
                        <Icon name={iconInfo.name} size={20} className={iconInfo.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5] mb-1">
                          {notif.title}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-[#999999] line-clamp-2">
                          {notif.content}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-[#666666]">
                          <span className={notif.isUrgent ? 'text-red-500' : ''}>{notif.isUrgent ? 'Khẩn cấp' : notif.target}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
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
                  navigate('/admin/notifications');
                }}
                className="text-xs font-bold text-[#004785] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;

