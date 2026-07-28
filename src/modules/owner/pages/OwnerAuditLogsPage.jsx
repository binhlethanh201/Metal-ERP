import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../../../services/apiClient';
import { useAuth } from '../../../shared/hooks/useAuth';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Table from '../../../shared/components/Table';
import Badge from '../../../shared/components/Badge';
import Drawer from '../../../shared/components/Drawer';
import { formatDateTime } from '../../../shared/utils/formatDate';

const LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'INFO', label: 'Thông tin' },
  { value: 'WARN', label: 'Cảnh báo' },
  { value: 'ERROR', label: 'Lỗi' },
];

const LEVEL_LABELS = { INFO: 'Thông tin', WARN: 'Cảnh báo', ERROR: 'Lỗi' };

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

const levelLabel = (val) => LEVEL_LABELS[val] || val || 'Thông tin';

const OwnerAuditLogsPage = () => {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    action: '',
    level: '',
    userName: '',
    fromDate: '',
    toDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      if (appliedFilters.action) params.set('action', toEnglishAction(appliedFilters.action));
      if (appliedFilters.level) params.set('level', appliedFilters.level);
      if (appliedFilters.fromDate) params.set('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) params.set('toDate', appliedFilters.toDate);
      params.set('page', String(page));
      params.set('pageSize', String(9999)); // Lấy toàn bộ về lọc client-side

      const data = await apiGet(`/api/owner/audit-logs?${params.toString()}`);
      let allItems = data?.items || [];
      const total = data?.totalCount || 0;

      // Lọc theo tên người dùng ở client
      if (appliedFilters.userName) {
        const keyword = appliedFilters.userName.toLowerCase();
        allItems = allItems.filter(
          (row) =>
            (row.userName || '').toLowerCase().includes(keyword) ||
            (row.userEmail || '').toLowerCase().includes(keyword)
        );
      }

      // Phân trang thủ công sau khi lọc
      const start = (page - 1) * pageSize;
      setItems(allItems.slice(start, start + pageSize));
      setTotalCount(appliedFilters.userName ? allItems.length : total);
    } catch (err) {
      setError(err?.message || 'Không thể tải nhật ký hoạt động.');
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtersRef = useRef(filters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      filtersRef.current = next;
      return next;
    });
  };

  const handleSearch = () => {
    const current = filtersRef.current;
    setAppliedFilters({ ...current });
    setPage(1);
  };

  const handleReset = () => {
    const reset = { action: '', level: '', userName: '', fromDate: '', toDate: '' };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  const activeFilterCount = [filters.action, filters.level, filters.userName, filters.fromDate, filters.toDate].filter(Boolean).length;

  const ACTION_WORDS = {
  CREATE: 'Tạo',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  VIEW: 'Xem',
  APPROVE: 'Phê duyệt',
  ACTIVATE: 'Kích hoạt',
  DEACTIVATE: 'Vô hiệu',
  SUSPENDED: 'Đình chỉ',
  ACTIVE: 'Hoạt động',
  REJECT: 'Từ chối',
  RESTORE: 'Khôi phục',
  TOGGLE: 'Chuyển',
  ASSIGN: 'Gán',
  UNASSIGN: 'Hủy',
  EXPORT: 'Xuất',
  IMPORT: 'Nhập',
  RESET: 'Đặt lại',
  LOCK: 'Khóa',
  UNLOCK: 'Mở',
  SUBMIT: 'Gửi',
  CANCEL: 'Hủy',
  CONFIRM: 'Xác nhận',
  STATUS: 'Trạng thái',
  EXPENSE: 'Chi',
  VOUCHER: 'Phiếu',
  PAYMENT: 'Thanh toán',
  PRODUCT: 'Sản phẩm',
  SUPPLIER: 'Nhà cung cấp',
  CUSTOMER: 'Khách hàng',
  ORDER: 'Đơn hàng',
  INVOICE: 'Hóa đơn',
  STAFF: 'Nhân viên',
  BRANCH: 'Chi nhánh',
  STOCK: 'Kho',
  SHIFT: 'Ca',
  RETURN: 'Trả',
  CHECK: 'Kiểm',
  CATEGORY: 'Danh mục',
  DISCOUNT: 'Giảm giá',
  SETTINGS: 'Cài đặt',
  REPORT: 'Báo cáo',
  PERMISSION: 'Quyền',
  PERMISSIONS: 'Quyền',
  ROLE: 'Vai trò',
  BULK: 'Hàng loạt',
  SOFT: 'Mềm',
  HARD: 'Cứng',
  PERMANENT: 'Vĩnh viễn',
};

const stripDiacritics = (str) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const VN_TO_EN = {};
Object.entries(ACTION_WORDS).forEach(([en, vn]) => {
  VN_TO_EN[stripDiacritics(vn)] = en;
});

const toEnglishAction = (input) => {
  if (!input) return '';
  const words = input.trim().split(/\s+/);
  const translated = words.map((w) => VN_TO_EN[stripDiacritics(w)] || w.toUpperCase());
  return translated.join('_');
};

const actionLabel = (val) => {
  if (!val) return '—';
  const key = val.toUpperCase();
  if (ACTION_WORDS[key]) return ACTION_WORDS[key];
  // Xử lý dạng compound: CREATE_EXPENSE_VOUCHER → Tạo Phiếu Chi
  const translated = key.split('_').map((w) => ACTION_WORDS[w] || w).join(' ');
  return translated !== key.replace(/_/g, ' ') ? translated : val;
};

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const columns = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      width: '180px',
      render: (val) => (val ? formatDateTime(val) : '—'),
    },
    {
      key: 'userName',
      header: 'Người dùng',
      width: '250px',
      render: (_, row) => row.userName || row.userEmail || row.userId || '—',
    },
    { key: 'action', header: 'Hành động', width: '200px', render: (val) => actionLabel(val) },
    {
      key: 'level',
      header: 'Mức độ',
      width: '110px',
      render: (val) => (
        <Badge variant={levelBadgeVariant(val)} size="sm">
          {levelLabel(val)}
        </Badge>
      ),
    },
    { key: 'description', header: 'Mô tả' },
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
            Danh sách nhật ký hoạt động
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Icon name="filter_list" size={14} />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleReset} className="flex items-center gap-1">
                <Icon name="cached" size={13} /> Đặt lại
              </Button>
            )}
          </div>
        </div>

        <Drawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Bộ lọc nhật ký"
          widthClass="max-w-sm"
          footer={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleReset();
                  setIsFilterOpen(false);
                }}
              >
                Đặt lại
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleSearch();
                  setIsFilterOpen(false);
                }}
              >
                Áp dụng
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Hành động"
              placeholder="VD: Tạo, Cập nhật"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            />
            <Input
              label="Tên người dùng"
              placeholder="Nhập tên người dùng"
              value={filters.userName}
              onChange={(e) => handleFilterChange('userName', e.target.value)}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                Mức độ
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
        </Drawer>
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
