import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useReturnHistory } from '../hooks/useReturnHistory';
import ReturnTable from '../components/return/ReturnTable';
import ReturnDetailModal from '../components/return/ReturnDetailModal';

// Shared Components & Icons theo phong cách ShiftHistory
import Button from '../../../shared/components/Button';
import Drawer from '../../../shared/components/Drawer';
import { AlertCircle, Layers, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Đang chờ (Pending)' },
  { value: 'Completed', label: 'Hoàn tất (Completed)' },
  { value: 'Cancelled', label: 'Đã hủy (Cancelled)' },
];

const ReturnHistory = () => {
  const {
    returns,
    pagination,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    setStatus,
    setDateRange,
    resetFilters,
    returnDetail,
    detailLoading,
    loadReturnDetail,
    clearReturnDetail,
    handleCancelReturn,
  } = useReturnHistory();

  const [detailOpen, setDetailOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Draft filters — chỉ apply khi bấm "Áp dụng"
  const [draftFilters, setDraftFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const openFilterDrawer = () => {
    setDraftFilters({
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
    setIsFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    setStatus(draftFilters.status);
    setDateRange(draftFilters.dateFrom, draftFilters.dateTo);
    setIsFilterDrawerOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftFilters({ status: '', dateFrom: '', dateTo: '' });
  };

  const handleViewDetail = async (returnOrderId) => {
    setDetailOpen(true);
    await loadReturnDetail(returnOrderId);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    clearReturnDetail();
  };

  const handleCancel = async (returnOrderId) => {
    const ok = await handleCancelReturn(returnOrderId);
    if (ok) closeDetail();
  };

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.totalCount || 0) / (pagination.pageSize || 20))
  );

  // Đếm số lượng bộ lọc đang áp dụng để hiển thị Badge
  let activeFilterCount = 0;
  if (filters.status) activeFilterCount++;
  if (filters.dateFrom) activeFilterCount++;
  if (filters.dateTo) activeFilterCount++;

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* ==================== PAGE HEADER ==================== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
          Lịch sử Đổi/Trả hàng
        </h1>
      </div>

      {/* ==================== POLICY SETTINGS ==================== */}
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

      {/* ==================== FILTERS (Tích hợp Drawer) ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
              Danh sách phiếu đổi/trả
            </span>
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

        {/* ==================== DRAWER LỌC NÂNG CAO ==================== */}
        <Drawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          title="Bộ lọc phiếu đổi/trả"
          widthClass="max-w-sm"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetDraftFilters();
                }}
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
                Trạng thái
              </label>
              <select
                value={draftFilters.status}
                onChange={(e) => setDraftFilters((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                Từ ngày
              </label>
              <input
                type="date"
                value={draftFilters.dateFrom ? draftFilters.dateFrom.slice(0, 10) : ''}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    dateFrom: e.target.value ? `${e.target.value}T00:00:00Z` : '',
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
                value={draftFilters.dateTo ? draftFilters.dateTo.slice(0, 10) : ''}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    dateTo: e.target.value ? `${e.target.value}T23:59:59Z` : '',
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              />
            </div>
          </div>
        </Drawer>
      </div>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <ReturnTable returns={returns} loading={loading} onViewDetail={handleViewDetail} />

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
            <span>Tổng {pagination.totalCount || 0} phiếu</span>
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
      <ReturnDetailModal
        open={detailOpen}
        onClose={closeDetail}
        detail={returnDetail}
        loading={detailLoading}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ReturnHistory;
