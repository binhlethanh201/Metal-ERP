import React, { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../../../services/apiClient';
import { useAuth } from '../../../shared/hooks/useAuth';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Table from '../../../shared/components/Table';
import Badge from '../../../shared/components/Badge';
import { formatDateTime } from '../../../shared/utils/formatDate';

const LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'INFO', label: 'INFO' },
  { value: 'WARN', label: 'WARN' },
  { value: 'ERROR', label: 'ERROR' },
];

const levelBadgeVariant = (level) => {
  switch ((level || '').toUpperCase()) {
    case 'ERROR':
      return 'danger';
    case 'WARN':
      return 'warning';
    case 'INFO':
    default:
      return 'info';
  }
};

const OwnerAuditLogsPage = () => {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    level: '',
    entityType: '',
    fromDate: '',
    toDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (appliedFilters.action) params.set('action', appliedFilters.action);
      if (appliedFilters.userId) params.set('userId', appliedFilters.userId);
      if (appliedFilters.level) params.set('level', appliedFilters.level);
      if (appliedFilters.entityType) params.set('entityType', appliedFilters.entityType);
      if (appliedFilters.fromDate) params.set('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) params.set('toDate', appliedFilters.toDate);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const data = await apiGet(`/api/owner/audit-logs?${params.toString()}`);
      setItems(data?.items || []);
      setTotalCount(data?.totalCount || 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải nhật ký hoạt động.');
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleReset = () => {
    const reset = { action: '', userId: '', level: '', entityType: '', fromDate: '', toDate: '' };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const columns = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      width: '160px',
      render: (val) => (val ? formatDateTime(val) : '—'),
    },
    {
      key: 'userName',
      header: 'User',
      width: '220px',
      render: (_, row) => row.userName || row.userEmail || row.userId || '—',
    },
    { key: 'action', header: 'Action', width: '160px' },
    { key: 'tableName', header: 'Table', width: '140px' },
    {
      key: 'entity',
      header: 'Entity',
      width: '200px',
      render: (_, row) =>
        row.entityType
          ? `${row.entityType}${row.entityId ? ` #${row.entityId}` : ''}`
          : '—',
    },
    {
      key: 'level',
      header: 'Level',
      width: '100px',
      render: (val) => (
        <Badge variant={levelBadgeVariant(val)} size="sm">
          {val || 'INFO'}
        </Badge>
      ),
    },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
            Nhật ký hoạt động
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">
            Theo dõi lịch sử thao tác của người dùng
            {user?.email ? ` — ${user.email}` : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <Icon name="error" className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input
            label="Action"
            placeholder="VD: CREATE, UPDATE"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          />
          <Input
            label="User ID"
            placeholder="UUID"
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Entity Type"
            placeholder="VD: Product, Order"
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
          />
          <Input
            label="Từ ngày"
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
          />
          <Input
            label="Đến ngày"
            type="date"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSearch}
            className="flex items-center gap-1.5"
          >
            <Icon name="search" size={14} />
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="Chưa có nhật ký hoạt động nào"
        />
      </div>

      {!loading && totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>Tổng {totalCount} bản ghi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
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
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAuditLogsPage;
