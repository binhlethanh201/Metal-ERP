import React, { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import LogFilterBar from '../components/log/LogFilterBar';
import LogTable from '../components/log/LogTable';

const MOCK_LOGS = [
  {
    id: 'LOG-9942',
    time: '19:45:12 15/06/2026',
    level: 'ERROR',
    source: 'AuthService',
    message: 'Failed to validate JWT token for Tenant T-7721. Signature expired.',
  },
  {
    id: 'LOG-9941',
    time: '19:42:05 15/06/2026',
    level: 'WARN',
    source: 'Database',
    message: 'Slow query detected on community_posts table (850ms).',
  },
  {
    id: 'LOG-9940',
    time: '19:30:00 15/06/2026',
    level: 'INFO',
    source: 'NotificationWorker',
    message: 'Successfully broadcasted URGENT notice to 1,402 active nodes.',
  },
  {
    id: 'LOG-9939',
    time: '19:15:22 15/06/2026',
    level: 'INFO',
    source: 'PaymentGateway',
    message: 'Webhook received for transaction TRX-998. Status: SUCCESS.',
  },
  {
    id: 'LOG-9938',
    time: '18:50:11 15/06/2026',
    level: 'ERROR',
    source: 'InventorySync',
    message: 'Connection timeout while pulling stock data from Branch B-02.',
  },
];

const SystemLog = () => {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Tối ưu hóa việc lọc dữ liệu
  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [filterLevel, searchTerm]);

  const handleExportData = () => {
    alert('Đang xuất dữ liệu log toàn hệ thống ra file .TXT');
  };

  return (
    <div className="space-y-6 text-on-surface">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Nhật Ký Hệ Thống (System Logs)
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            Theo dõi sự kiện máy chủ, cảnh báo bảo mật và truy vết lỗi API
          </p>
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="download" size={16} /> XUẤT LOG (TXT)
        </button>
      </div>

      {/* FILTER BAR */}
      <LogFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLevel={filterLevel}
        onFilterChange={setFilterLevel}
      />

      {/* LOG TABLE */}
      <LogTable logs={filteredLogs} />
    </div>
  );
};

export default SystemLog;
