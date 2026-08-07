// src/modules/report/components/ReportFilters.jsx
import { useMemo } from 'react';
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
import { REPORT_TYPES } from '../constraints/reportConstants';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]';
const selectClass = inputClass;

export const ReportFilters = ({
  selectedReport, onSelectReport,
  reportDate, onReportDateChange,
  fromDate, onFromDateChange,
  toDate, onToDateChange,
  categoryId, onCategoryChange, categories,
  productId, onProductChange, products,
  timeGrouping, onTimeGroupingChange,
  includeZeroStock, onIncludeZeroStockChange,
  sortBy, onSortByChange,
  supplierId, onSupplierChange, suppliers,
  purchaseFromDate, onPurchaseFromDateChange,
  purchaseToDate, onPurchaseToDateChange,
  paymentFromDate, onPaymentFromDateChange,
  paymentToDate, onPaymentToDateChange,
  onFilter, onDownload,
  isLoading, hasDataToExport,
}) => {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryId) count++;
    if (productId) count++;
    if (supplierId) count++;
    return count;
  }, [categoryId, productId, supplierId]);

  const isDaily = selectedReport === 'daily-end';
  const isStock = selectedReport === 'stock-movement';
  const isRevenue = selectedReport === 'revenue-by-time';
  const isLowStock = selectedReport === 'low-stock';
  const isProductProfit = selectedReport === 'product-profit';
  const isSupplier = selectedReport === 'supplier-detail';

  const showDateRange = isStock || isRevenue || isProductProfit;
  const showSingleDate = isDaily;
  const dateError = showDateRange && fromDate && toDate && fromDate > toDate;

  return (
    <Card padding="p-5">
      <div className="space-y-5">
        {/* Tab chọn loại báo cáo */}
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((rt) => {
            const active = selectedReport === rt.key;
            return (
              <button
                key={rt.key}
                type="button"
                onClick={() => onSelectReport(rt.key)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#004785] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#272727] dark:text-[#b3b3b3] dark:hover:bg-[#333333]'
                }`}
              >
                {rt.label}
              </button>
            );
          })}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Date filters */}
          {showSingleDate && (
            <div className="w-44">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Ngày</label>
              <input type="date" className={inputClass} value={reportDate} onChange={e => onReportDateChange(e.target.value)} />
            </div>
          )}
          {showDateRange && (
            <>
              <div className="w-44">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Từ ngày</label>
                <input type="date" className={`${inputClass} ${dateError ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : ''}`} value={fromDate} onChange={e => onFromDateChange(e.target.value)} />
              </div>
              <div className="w-44">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Đến ngày</label>
                <input type="date" className={`${inputClass} ${dateError ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : ''}`} value={toDate} onChange={e => onToDateChange(e.target.value)} />
              </div>
            </>
          )}
          {dateError && <span className="text-xs font-semibold text-red-500 pb-2">Từ ngày không được lớn hơn đến ngày</span>}

          {/* Category filter */}
          {(isStock || isProductProfit) && (
            <div className="w-48">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Nhóm SP</label>
              <select className={selectClass} value={categoryId} onChange={e => onCategoryChange(e.target.value)}>
                <option value="">Tất cả</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Product filter */}
          {isStock && (
            <div className="w-48">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Sản phẩm</label>
              <select className={selectClass} value={productId} onChange={e => onProductChange(e.target.value)}>
                <option value="">Tất cả</option>
                {products.map(p => <option key={p.id || p.productId} value={p.id || p.productId}>{p.productCode || p.code} - {p.productName || p.name}</option>)}
              </select>
            </div>
          )}

          {/* Time grouping */}
          {isRevenue && (
            <div className="w-36">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Nhóm theo</label>
              <select className={selectClass} value={timeGrouping} onChange={e => onTimeGroupingChange(e.target.value)}>
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </select>
            </div>
          )}

          {/* Low stock options */}
          {isLowStock && (
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#b3b3b3] cursor-pointer pt-1">
              <input type="checkbox" checked={includeZeroStock} onChange={e => onIncludeZeroStockChange(e.target.checked)} className="rounded" />
              Bao gồm SP hết hàng
            </label>
          )}

          {/* Product profit sort */}
          {isProductProfit && (
            <div className="w-36">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Sắp xếp</label>
              <select className={selectClass} value={sortBy} onChange={e => onSortByChange(e.target.value)}>
                <option value="revenue">Doanh thu</option>
                <option value="profit">Lợi nhuận</option>
                <option value="quantity">SL bán</option>
              </select>
            </div>
          )}

          {/* Supplier filter */}
          {isSupplier && (
            <>
              <div className="w-56">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Nhà cung cấp</label>
                <select className={selectClass} value={supplierId} onChange={e => onSupplierChange(e.target.value)}>
                  <option value="">-- Chọn NCC --</option>
                  {suppliers.map(s => <option key={s.id || s.supplierId} value={s.id || s.supplierId}>{s.supplierName || s.name}</option>)}
                </select>
              </div>
              <div className="w-44">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Mua từ ngày</label>
                <input type="date" className={inputClass} value={purchaseFromDate} onChange={e => onPurchaseFromDateChange(e.target.value)} />
              </div>
              <div className="w-44">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">Mua đến ngày</label>
                <input type="date" className={inputClass} value={purchaseToDate} onChange={e => onPurchaseToDateChange(e.target.value)} />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-end gap-2 ml-auto">
            <button
              type="button" onClick={onFilter} disabled={isLoading || dateError}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004785] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003566] disabled:opacity-60"
              title={dateError ? 'Từ ngày không thể lớn hơn đến ngày' : ''}
            >
              <Icon name="search" size={16} />
              {isLoading ? 'Đang tải...' : 'Xem báo cáo'}
            </button>
            {hasDataToExport && (
              <button
                type="button" onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              >
                <Icon name="download" size={16} /> Excel
              </button>
            )}
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                {activeFilterCount} bộ lọc
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;
