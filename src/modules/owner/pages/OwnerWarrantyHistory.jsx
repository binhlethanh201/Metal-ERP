import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Drawer from '../../../shared/components/Drawer';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { formatDate } from '../../../shared/utils/formatDate';
import { useOwnerWarrantyHistory } from '../hooks/useOwnerWarrantyHistory';
import { Layers, RotateCcw } from 'lucide-react';

const OwnerWarrantyHistory = () => {
  const {
    items,
    totalCount,
    loading,
    filters,
    fetchItems,
    setPage,
    setPageSize,
    setSearch,
    setDateRange,
    resetFilters,
  } = useOwnerWarrantyHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.pageSize, filters.search, filters.fromDate, filters.toDate]);

  const openFilterDrawer = () => {
    setDraftFilters({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
    setIsFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    setDateRange(draftFilters.fromDate, draftFilters.toDate);
    setIsFilterDrawerOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftFilters({ fromDate: '', toDate: '' });
  };

  let activeFilterCount = 0;
  if (filters.fromDate) activeFilterCount++;
  if (filters.toDate) activeFilterCount++;

  const columns = [
    {
      header: 'Ngày đổi',
      key: 'exchangeDate',
      render: (val) => (
        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-[#cccccc]">
          {formatDate(val)}
        </span>
      ),
    },
    {
      header: 'Mã phiếu đổi',
      key: 'returnCode',
      render: (val) => (
        <span className="font-bold text-[#004785] dark:text-blue-400">{val}</span>
      ),
    },
    {
      header: 'Khách hàng',
      key: 'customerName',
      render: (val) => (
        <span className="text-sm font-medium text-slate-800 dark:text-[#e5e5e5]">
          {val || 'Khách lẻ'}
        </span>
      ),
    },
    {
      header: 'Sản phẩm lỗi',
      key: 'productName',
      render: (val, row) => (
        <div className="max-w-[250px]">
          <p className="truncate font-semibold text-slate-800 dark:text-[#e5e5e5]" title={val}>
            {val}
          </p>
          <p className="text-xs text-slate-500 dark:text-[#999999]">{row.skuCode}</p>
        </div>
      ),
    },
    {
      header: 'SL',
      key: 'quantity',
      render: (val) => (
        <span className="font-bold text-red-600 dark:text-red-400">{val}</span>
      ),
    },
    {
      header: 'Lý do',
      key: 'reason',
      render: (val) => {
        let displayReason = val || 'Sản phẩm lỗi';
        if (val && val.toUpperCase() === 'DEFECTIVE') displayReason = 'Sản phẩm lỗi';
        
        return (
          <Badge variant="warning" className="text-xs">
            {displayReason}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col gap-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* ==================== PAGE HEADER ==================== */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">
          Lịch sử hàng bảo hành
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
          Danh sách các sản phẩm thu hồi từ khách hàng do hỏng/lỗi (từ các phiếu Đổi hàng)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card padding="p-4" className="border-l-4 border-l-blue-600 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Icon name="handyman" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-[#999999]">TỔNG SẢN PHẨM LỖI</p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
                {totalCount}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* ==================== TOOLBAR ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm theo mã SP, tên KH, mã phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openFilterDrawer}
            className="flex items-center gap-1.5"
          >
            <Layers size={14} className="text-[#004785]" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1"
              title="Xóa toàn bộ bộ lọc"
            >
              <RotateCcw size={13} /> Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <Card padding="p-0" className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            emptyMessage="Không có sản phẩm lỗi nào được ghi nhận."
          />
        </div>
        
        {totalCount > 0 && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={filters.pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                >
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>
                {(filters.page - 1) * filters.pageSize + 1} -{' '}
                {Math.min(filters.page * filters.pageSize, totalCount)} trong tổng số{' '}
                {totalCount} sản phẩm
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#272727]"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {filters.page} / {Math.ceil(totalCount / filters.pageSize) || 1}
              </div>
              <button
                type="button"
                onClick={() => setPage(Math.min(Math.ceil(totalCount / filters.pageSize) || 1, filters.page + 1))}
                disabled={filters.page >= Math.ceil(totalCount / filters.pageSize)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#272727]"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ==================== DRAWER LỌC NÂNG CAO ==================== */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Bộ lọc hàng bảo hành"
        widthClass="max-w-sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetDraftFilters}
            >
              Đặt lại
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters}>
              Áp dụng
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
              Từ ngày
            </label>
            <input
              type="date"
              value={draftFilters.fromDate ? draftFilters.fromDate.slice(0, 10) : ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  fromDate: e.target.value ? `${e.target.value}T00:00:00Z` : '',
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
              Đến ngày
            </label>
            <input
              type="date"
              value={draftFilters.toDate ? draftFilters.toDate.slice(0, 10) : ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  toDate: e.target.value ? `${e.target.value}T23:59:59Z` : '',
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default OwnerWarrantyHistory;
