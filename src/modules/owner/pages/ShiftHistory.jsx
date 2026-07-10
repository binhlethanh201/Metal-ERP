import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useShiftHistory } from '../hooks/useShiftHistory';
import ShiftTable from '../components/shift/ShiftTable';
import ShiftSummaryModal from '../components/shift/ShiftSummaryModal';

// Import Shared Components & Icons mới để chuẩn hoá UI/UX
import Button from '../../../shared/components/Button';
import Drawer from '../../../shared/components/Drawer';
import { AlertCircle, Layers, RotateCcw } from 'lucide-react';

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
    loadShiftSummary,
    clearShiftSummary,
  } = useShiftHistory();

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false); // State mở Drawer bộ lọc

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
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      {/* ==================== PAGE HEADER ==================== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử Ca bán hàng</h1>
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
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-600">Danh sách các ca đã lưu</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(true)}
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetFilters();
                  setIsFilterDrawerOpen(false);
                }}
              >
                Đặt lại
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsFilterDrawerOpen(false)}>
                Đóng
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Từ ngày</label>
              <input
                type="date"
                value={filters.from ? filters.from.slice(0, 10) : ''}
                onChange={(e) =>
                  setDateRange(e.target.value ? `${e.target.value}T00:00:00Z` : '', filters.to)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Đến ngày</label>
              <input
                type="date"
                value={filters.to ? filters.to.slice(0, 10) : ''}
                onChange={(e) =>
                  setDateRange(filters.from, e.target.value ? `${e.target.value}T23:59:59Z` : '')
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none"
              />
            </div>
          </div>
        </Drawer>
      </div>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <ShiftTable shifts={shifts} loading={loading} onViewSummary={handleViewSummary} />

      {/* ==================== PHÂN TRANG ==================== */}
      {!loading && totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={filters.pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>Tổng {pagination.totalCount || 0} ca bán</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(filters.page - 1)}
              disabled={filters.page <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700">
              Trang {filters.page} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
      />
    </div>
  );
};

export default ShiftHistory;
