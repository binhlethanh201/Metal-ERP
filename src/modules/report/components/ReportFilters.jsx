// src/modules/report/components/ReportFilters.jsx
import { useMemo, useState, useRef, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
import { REPORT_TYPES } from '../constraints/reportConstants';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]';
const selectClass = inputClass;

// Searchable dropdown component
const SearchableSelect = ({ value, onChange, options, placeholder, label }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const getId = (o) => o?.id ?? o?.productId ?? o;
  const getName = (o) => {
    if (!o) return '';
    if (typeof o === 'string') return o;
    return o.name ?? o.productName ?? o.supplierName ?? o.label ?? 'Không tên';
  };

  const selected = options.find(o => getId(o) === value);
  const displayText = getName(selected);

  const filtered = options.filter(o => {
    const nameStr = getName(o).toString().toLowerCase();
    return nameStr.includes(search.toLowerCase());
  });

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999]">{label}</label>
      <div className="relative">
        <input
          type="text"
          className={inputClass + ' pr-8'}
          placeholder={placeholder || 'Tìm kiếm...'}
          value={open ? search : displayText}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => { setSearch(''); setOpen(true); }}
        />
        <Icon name={open ? 'expand_less' : 'expand_more'} size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-[#404040] dark:bg-[#1a1a1a]">
          <div
            className="cursor-pointer px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-[#333333]"
            onClick={() => { onChange(''); setSearch(''); setOpen(false); }}
          >
            -- Tất cả --
          </div>
          {filtered.map((o, i) => {
            const id = getId(o);
            const name = getName(o);
            const code = o?.productCode ?? o?.code ?? '';
            return (
              <div
                key={id || i}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 ${value === id ? 'bg-blue-50 font-semibold text-[#004785] dark:bg-blue-950/30 dark:text-blue-400' : 'text-slate-700 dark:text-[#b3b3b3]'}`}
                onClick={() => { onChange(id); setSearch(''); setOpen(false); }}
              >
                {code ? `${code} - ${name}` : name}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-400">Không tìm thấy</div>
          )}
        </div>
      )}
    </div>
  );
};

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
              <SearchableSelect
                label="Nhóm SP"
                value={categoryId}
                onChange={onCategoryChange}
                options={categories}
                placeholder="Gõ tên nhóm..."
              />
            </div>
          )}

          {/* Product filter */}
          {isStock && (
            <div className="w-56">
              <SearchableSelect
                label="Sản phẩm"
                value={productId}
                onChange={onProductChange}
                options={products}
                placeholder="Gõ mã hoặc tên SP..."
              />
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
