import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import { getLogList, getLogDetail, exportLogs } from '../services/adminService';
import LogFilterBar from '../components/log/LogFilterBar';
import LogTable from '../components/log/LogTable';
import LogDetailModal from '../components/log/LogDetailModal';

const SystemLog = () => {
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = filterLevel !== 'ALL' ? { level: filterLevel } : {};
    getLogList(params)
      .then((data) => {
        setLogs(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('System logs API error:', err);
        setError(err.message || 'Không tải được nhật ký hệ thống');
        setLoading(false);
      });
  }, [filterLevel]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filter by Search Term
      const matchesSearch =
        (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.source || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filter by Level (Client-side fallback)
      const logLvl = log.level ? log.level.toUpperCase() : 'INFO'; // Default empty level to INFO
      const matchesLevel = filterLevel === 'ALL' || logLvl === filterLevel;

      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, filterLevel]);

  const handleExportData = async (format) => {
    try {
      const blob = await exportLogs(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleRowClick = async (logItem) => {
    try {
      const detail = await getLogDetail(logItem.logId);
      setSelectedLog(detail || logItem);
    } catch (err) {
      console.error('Fetch detail error:', err);
      setSelectedLog(logItem); // fallback
    }
  };

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Nhật Ký Hệ Thống (System Logs)
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            Theo dõi sự kiện máy chủ, cảnh báo bảo mật và truy vết lỗi API
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportData('csv')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <Icon name="download" size={16} /> XUẤT CSV
          </button>
          <button
            onClick={() => handleExportData('txt')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <Icon name="download" size={16} /> XUẤT TXT
          </button>
        </div>
      </div>

      <LogFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLevel={filterLevel}
        onFilterChange={setFilterLevel}
      />

      {loading && (
        <div className="rounded-md bg-surface-container-lowest p-8 text-center text-xs text-on-surface-variant">
          Đang tải...
        </div>
      )}
      {error && (
        <div className="rounded-md bg-error-container p-3 text-xs font-semibold text-error">
          {error}
        </div>
      )}
      {!loading && !error && <LogTable logs={filteredLogs} onRowClick={handleRowClick} />}

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default SystemLog;
