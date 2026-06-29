import React, { useState, useCallback } from 'react';
import { getNotificationList, createNotification } from '../services/adminService';
import BroadcastForm from '../components/notification/BroadcastForm';
import BroadcastHistory from '../components/notification/BroadcastHistory';

const SystemNotifications = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    getNotificationList()
      .then((data) => {
        const all = Array.isArray(data) ? data : data?.items || [];
        setBroadcasts(all);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Notifications API error:', err);
        setLoading(false);
      });
  }, []);

  // Chỉ hiển thị lịch sử phát sóng: chỉ các thông báo đã gửi hoặc đã hủy
  const sentHistory = broadcasts.filter(
    (n) => ['SENT', 'CANCELLED'].includes((n.status || '').toUpperCase())
  );

  const handleBroadcastExecute = async (payload) => {
    try {
      await createNotification(payload);
      alert('Đã tạo thông báo thành công.');
      fetchNotifications();
    } catch (err) {
      console.error('Create notification error:', err);
      alert(err.message || 'Tạo thông báo thất bại');
    }
  };

  return (
    <div className="space-y-6 text-on-surface">
      <div className="border-b border-outline-variant pb-3">
        <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
          Trung Tâm Thông Báo (Broadcast)
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
          Điều phối luồng tin tức và cảnh báo khẩn cấp toàn nền tảng
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BroadcastForm onBroadcast={handleBroadcastExecute} />
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-center text-xs text-on-surface-variant">
              Đang tải...
            </div>
          ) : (
            <BroadcastHistory historyData={sentHistory} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemNotifications;
