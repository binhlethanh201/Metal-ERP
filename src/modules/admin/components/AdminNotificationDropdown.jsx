import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getRecentEvents } from '../services/adminService';

const AdminNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getRecentEvents(10);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch admin events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Optional polling every 60s
    const interval = setInterval(fetchEvents, 60000);
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
      fetchEvents();
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const normalizedString =
      dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
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

  const getIconForLevel = (level) => {
    switch (level?.toLowerCase()) {
      case 'info':
        return { name: 'info', color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'warning':
        return { name: 'warning', color: 'text-amber-500', bg: 'bg-amber-100' };
      case 'error':
      case 'critical':
        return { name: 'error', color: 'text-red-500', bg: 'bg-red-100' };
      case 'success':
        return { name: 'check_circle', color: 'text-green-500', bg: 'bg-green-100' };
      default:
        return { name: 'notifications', color: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
      >
        <Icon name="notifications" size={16} />
        {/* Simple red dot to indicate activity tracker is alive */}
        {events.length > 0 && (
           <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-surface-container-high bg-surface-container-low px-4 py-3">
            <h3 className="text-sm font-bold text-on-surface">Hoạt động hệ thống</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
                <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                <p className="text-xs font-semibold">Đang tải...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
                <Icon name="notifications_off" size={40} className="mb-2 opacity-50" />
                <p className="text-xs font-semibold">Không có hoạt động mới nào</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-container-high">
                {events.map((evt) => {
                  const iconInfo = getIconForLevel(evt.level);
                  return (
                    <div
                      key={evt.logId}
                      className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-container-low"
                    >
                      <div
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconInfo.bg}`}
                      >
                        <Icon name={iconInfo.name} size={20} className={iconInfo.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                          {evt.action}
                        </p>
                        <p className="text-xs font-semibold text-on-surface-variant">
                          {evt.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-outline">
                          <span>{evt.userName || evt.source || 'System'}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(evt.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="border-t border-surface-container-high bg-surface-container-low p-2 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/logs');
                }}
                className="text-xs font-bold text-primary hover:text-primary/80"
              >
                Xem chi tiết Nhật ký (Logs)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;
