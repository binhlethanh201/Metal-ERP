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
      const ext = format === 'excel' ? 'xlsx' : format;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.${ext}`;
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
    <div className="space-y-6 text-slate-900 dark:text-[#e5e5e5]">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Nhật Ký Hệ Thống
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            Theo dõi sự kiện hoạt động, cảnh báo bảo mật
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportData('excel')}
            className="flex items-center gap-2 rounded-md border border-[#004785] bg-[#004785] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            <Icon name="download" size={16} /> XUẤT EXCEL
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
        <div className="rounded-md bg-white dark:bg-[#0f0f0f] p-8 text-center text-xs text-slate-500 dark:text-[#999999]">
          Đang tải...
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-xs font-semibold text-red-600 dark:text-red-500">
          {error}
        </div>
      )}
      {!loading && !error && <LogTable logs={filteredLogs} onRowClick={handleRowClick} />}

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default SystemLog;

