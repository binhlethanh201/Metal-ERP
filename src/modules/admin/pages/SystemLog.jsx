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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const pagedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

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
    <div className="w-full space-y-6 text-slate-900 dark:text-[#e5e5e5]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
            Nhật Ký Hệ Thống
          </h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Theo dõi sự kiện hoạt động, cảnh báo bảo mật.
          </p>
        </div>
        <button
          onClick={() => handleExportData('excel')}
          className="flex items-center gap-2 rounded-xl bg-[#004785] px-4 py-2 text-base font-medium text-white transition-all duration-150 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Icon name="download" size={18} /> Xuất Excel
        </button>
      </div>

      <LogFilterBar
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
        filterLevel={filterLevel}
        onFilterChange={(v) => { setFilterLevel(v); setPage(1); }}
      />

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <Icon name="sync" className="mr-2 animate-spin text-xl text-slate-400 dark:text-[#808080]" />
          <span className="text-sm font-semibold text-slate-400 dark:text-[#808080]">Đang tải...</span>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-500">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="overflow-x-auto p-4">
            <LogTable logs={pagedLogs} onRowClick={handleRowClick} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 dark:border-[#333333]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                >
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>
                {filteredLogs.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredLogs.length)} trong tổng số {filteredLogs.length} bản ghi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {page} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default SystemLog;

