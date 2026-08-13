import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useShiftHistory } from '../hooks/useShiftHistory';
import ShiftTable from '../components/shift/ShiftTable';
import ShiftSummaryModal from '../components/shift/ShiftSummaryModal';

// Import Shared Components & Icons mới để chuẩn hoá UI/UX
import Button from '../../../shared/components/Button';
import Drawer from '../../../shared/components/Drawer';
import { AlertCircle, Layers, RotateCcw, Search } from 'lucide-react';

const ShiftHistory = () => {
  const {
    shifts,
    pagination,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    setDateRange,
    resetFilters,
    shiftSummary,
    summaryLoading,
    shiftOrders,
    ordersLoading,
    loadShiftSummary,
    clearShiftSummary,
    setSearchKeyword,
  } = useShiftHistory();

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Draft filters — chỉ apply khi bấm "Áp dụng"
  const [draftFilters, setDraftFilters] = useState({ from: '', to: '' });

  const openFilterDrawer = () => {
    setDraftFilters({ from: filters.from || '', to: filters.to || '' });
    setIsFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    setDateRange(draftFilters.from || '', draftFilters.to || '');
    setIsFilterDrawerOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftFilters({ from: '', to: '' });
  };

  const handleViewSummary = async (shiftId) => {
    setSummaryOpen(true);
    await loadShiftSummary(shiftId);
  };

  const closeSummary = () => {
    setSummaryOpen(false);
    clearShiftSummary();
  };

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.totalCount || 0) / (pagination.pageSize || 20))
  );

  // Đếm số lượng bộ lọc đang áp dụng để hiển thị Badge
  let activeFilterCount = 0;
  if (filters.from) activeFilterCount++;
  if (filters.to) activeFilterCount++;

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* ==================== PAGE HEADER ==================== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
          Lịch sử Ca bán hàng
        </h1>
      </div>

      {/* ==================== GLOBAL ERROR BANNER ==================== */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ==================== FILTERS (Tích hợp Shared Button & Drawer) ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
              Danh sách các ca đã lưu
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm mã ca bán..."
                className="h-9 w-64 rounded-lg border border-slate-300 pl-9 pr-4 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchKeyword(e.target.value.trim());
                  }
                }}
              />
            </div>
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

            {(filters.from || filters.to) && (
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

        {/* ==================== DRAWER LỌC NÂNG CAO ==================== */}
        <Drawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          title="Bộ lọc ca bán hàng"
          widthClass="max-w-sm"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={resetDraftFilters}>
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
                value={draftFilters.from ? draftFilters.from.slice(0, 10) : ''}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    from: e.target.value ? new Date(`${e.target.value}T00:00:00`).toISOString() : '',
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
                value={draftFilters.to ? draftFilters.to.slice(0, 10) : ''}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    to: e.target.value ? new Date(`${e.target.value}T23:59:59.999`).toISOString() : '',
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              />
            </div>
          </div>
        </Drawer>
      </div>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <ShiftTable
        shifts={shifts}
        loading={loading}
        onViewSummary={handleViewSummary}
        onClickRow={(row) => handleViewSummary(row.shiftId)}
      />

      {/* ==================== PHÂN TRANG ==================== */}
      {!loading && totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={filters.pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>
              {pagination.totalCount === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1} -{' '}
              {Math.min(filters.page * filters.pageSize, pagination.totalCount || 0)} trong tổng số{' '}
              {pagination.totalCount || 0} ca bán
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(filters.page - 1)}
              disabled={filters.page <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
              Trang {filters.page} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      <ShiftSummaryModal
        open={summaryOpen}
        onClose={closeSummary}
        summary={shiftSummary}
        loading={summaryLoading}
        orders={shiftOrders}
        ordersLoading={ordersLoading}
      />
    </div>
  );
};

export default ShiftHistory;
