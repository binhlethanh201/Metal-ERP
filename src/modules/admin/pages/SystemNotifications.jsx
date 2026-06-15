import React, { useState } from 'react';
import { MOCK_BROADCASTS } from '../data/mockData';
import BroadcastForm from '../components/notification/BroadcastForm';
import BroadcastHistory from '../components/notification/BroadcastHistory';

const SystemNotifications = () => {
  // Quản lý state danh sách lịch sử tại trang cha
  const [broadcasts, setBroadcasts] = useState(MOCK_BROADCASTS);

  const handleBroadcastExecute = (payload) => {
    console.log('Sending Payload:', payload);

    // Giả lập lưu vào danh sách lịch sử nội bộ
    const newBroadcast = {
      id: `BC-${Math.floor(Math.random() * 1000)}`,
      title: payload.title,
      target:
        payload.targetScope === 'all'
          ? 'Tất cả hệ thống'
          : payload.targetScope === 'owners'
            ? 'Partner Owners'
            : 'System Staff',
      time: new Date().toLocaleString('vi-VN', { hour12: false }),
      status: 'sent',
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    alert('Đã đẩy thông báo tới Server WebSocket (Mô phỏng).');
  };

  return (
    <div className="space-y-6 text-on-surface">
      {/* HEADER */}
      <div className="border-b border-outline-variant pb-3">
        <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
          Trung Tâm Thông Báo (Broadcast)
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
          Điều phối luồng tin tức và cảnh báo khẩn cấp toàn nền tảng
        </p>
      </div>

      {/* GRID LAYOUT  */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* FORM */}
        <div className="lg:col-span-3">
          <BroadcastForm onBroadcast={handleBroadcastExecute} />
        </div>

        {/* HISTORY */}
        <div className="lg:col-span-2">
          <BroadcastHistory historyData={broadcasts} />
        </div>
      </div>
    </div>
  );
};

export default SystemNotifications;
