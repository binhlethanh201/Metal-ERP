// src/modules/report/components/ReportFilters.jsx
import { useMemo, useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import Drawer from '../../../shared/components/Drawer';
import Icon from '../../../shared/components/Icon';
import { REPORT_TYPES } from '../constraints/reportConstants';

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:disabled:bg-[#1a1a1a]';

const FilterField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">{label}</label>
    {children}
  </div>
);

const formatVN = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return d && m && y ? `${d}/${m}/${y}` : isoDate;
};

export const ReportFilters = ({
  selectedReport,
  onSelectReport,
  reportDate,
  onReportDateChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  categoryId,
  onCategoryChange,
  categories,
  productId,
  onProductChange,
  products,
  timeGrouping,
  onTimeGroupingChange,
  includeZeroStock,
  onIncludeZeroStockChange,
  sortBy,
  onSortByChange,
  supplierId,
  onSupplierChange,
  suppliers,
  purchaseFromDate,
  onPurchaseFromDateChange,
  purchaseToDate,
  onPurchaseToDateChange,
  paymentFromDate,
  onPaymentFromDateChange,
  paymentToDate,
  onPaymentToDateChange,
  onFilter,
  onDownload,
  isLoading,
  hasDataToExport,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showDateRange =
    selectedReport === 'stock-movement' ||
    selectedReport === 'revenue-by-time' ||
    selectedReport === 'product-profit';

  const showCategory = selectedReport === 'stock-movement' || selectedReport === 'product-profit';

  // Tóm tắt ngày hiển thị cạnh nút Bộ lọc, để không mất ngữ cảnh khi đã gom vào Drawer
  const dateSummary = useMemo(() => {
    if (selectedReport === 'daily-end') return formatVN(reportDate);
    if (showDateRange) return `${formatVN(fromDate)} → ${formatVN(toDate)}`;
    return '';
  }, [selectedReport, reportDate, fromDate, toDate, showDateRange]);

  // Đếm filter đang áp dụng để hiện badge — tính cả khoảng ngày vì giờ nó nằm trong Drawer
  const activeDrawerFilterCount = useMemo(() => {
    let count = 0;
    if (selectedReport === 'daily-end') {
      if (reportDate) count += 1;
    }
    if (showDateRange) {
      if (fromDate) count += 1;
      if (toDate) count += 1;
    }
    if (selectedReport === 'stock-movement') {
      if (categoryId) count += 1;
      if (productId) count += 1;
    }
    if (selectedReport === 'revenue-by-time') {
      if (timeGrouping && timeGrouping !== 'day') count += 1;
    }
    if (selectedReport === 'low-stock') {
      if (includeZeroStock) count += 1;
    }
    if (selectedReport === 'product-profit') {
      if (categoryId) count += 1;
      if (sortBy && sortBy !== 'revenue') count += 1;
    }
    if (selectedReport === 'supplier-detail') {
      if (purchaseFromDate) count += 1;
      if (purchaseToDate) count += 1;
      if (paymentFromDate) count += 1;
      if (paymentToDate) count += 1;
    }
    return count;
  }, [
    selectedReport,
    reportDate,
    showDateRange,
    fromDate,
    toDate,
    categoryId,
    productId,
    timeGrouping,
    includeZeroStock,
    sortBy,
    purchaseFromDate,
    purchaseToDate,
    paymentFromDate,
    paymentToDate,
  ]);

  const handleDrawerReset = () => {
    if (selectedReport === 'stock-movement') {
      onCategoryChange('');
      onProductChange('');
    }
    if (selectedReport === 'revenue-by-time') {
      onTimeGroupingChange('day');
    }
    if (selectedReport === 'low-stock') {
      onIncludeZeroStockChange(false);
    }
    if (selectedReport === 'product-profit') {
      onCategoryChange('');
      onSortByChange('revenue');
    }
    if (selectedReport === 'supplier-detail') {
      onPurchaseFromDateChange('');
      onPurchaseToDateChange('');
      onPaymentFromDateChange('');
      onPaymentToDateChange('');
    }
    // Không reset reportDate/fromDate/toDate về rỗng vì API bắt buộc phải có ngày hợp lệ
    // (daily-end mặc định "hôm nay" nếu thiếu, còn stock-movement/revenue/product-profit
    // đều yêu cầu fromDate/toDate). Reset về rỗng sẽ gây lỗi 400 "Từ ngày không thể...".
  };

  const handleDrawerApply = () => {
    setDrawerOpen(false);
    onFilter();
  };

  return (
    <>
      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-[#333333]">
        <div className="no-scrollbar flex space-x-1 overflow-x-auto">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.key}
              onClick={() => onSelectReport(report.key)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                selectedReport === report.key
                  ? 'border-[#004785] bg-blue-50/50 text-[#004785] dark:bg-blue-900/20 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-[#999999] dark:hover:border-[#404040] dark:hover:text-[#b3b3b3]'
              }`}
            >
              {report.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]" padding="p-5">
        <div className="flex flex-wrap items-end gap-4">
          {selectedReport === 'supplier-detail' && (
            <div className="min-w-[220px] flex-1 lg:flex-none">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Nhà cung cấp
              </label>
              <select
                value={supplierId}
                onChange={(e) => onSupplierChange(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id || supplier.supplierId}
                    value={supplier.id || supplier.supplierId}
                  >
                    {supplier.name ||
                      supplier.fullName ||
                      supplier.companyName ||
                      supplier.supplierName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative flex h-[38px] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:flex-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="Layers" className="h-4 w-4 text-slate-500 dark:text-[#999999]" />
              <span>Bộ lọc</span>
              {dateSummary && (
                <span className="hidden items-center gap-1 border-l border-slate-200 pl-2 text-xs font-medium text-slate-500 sm:flex dark:border-[#333333] dark:text-[#999999]">
                  <Icon name="CalendarDays" className="h-4 w-4 text-slate-500 dark:text-[#999999]" />
                  {dateSummary}
                </span>
              )}
              {activeDrawerFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                  {activeDrawerFilterCount}
                </span>
              )}
            </button>

            {selectedReport !== 'daily-end' && (
              <Button
                variant="secondary"
                className="flex h-[38px] flex-1 items-center justify-center border border-slate-300 bg-white sm:flex-none dark:border-[#404040] dark:bg-[#1a1a1a]"
                onClick={onDownload}
                disabled={!hasDataToExport || isLoading}
              >
                <Icon name="Download" className="h-4 w-4 text-slate-500 dark:text-[#999999]" />
                <span>Tải về</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Drawer: TẤT CẢ filter chi tiết, bao gồm cả ngày tháng */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Bộ lọc"
        widthClass="max-w-sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={handleDrawerReset}>
              Đặt lại
            </Button>
            <Button variant="primary" size="sm" onClick={handleDrawerApply}>
              Áp dụng
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {selectedReport === 'daily-end' && (
            <FilterField label="Ngày chốt ca">
              <Input
                type="date"
                value={reportDate}
                onChange={(e) => onReportDateChange(e.target.value)}
              />
            </FilterField>
          )}

          {showDateRange && (
            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Từ ngày">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => onFromDateChange(e.target.value)}
                />
              </FilterField>
              <FilterField label="Đến ngày">
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => onToDateChange(e.target.value)}
                />
              </FilterField>
            </div>
          )}

          {showCategory && (
            <FilterField label="Nhóm sản phẩm">
              <select
                value={categoryId}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Tất cả nhóm --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FilterField>
          )}

          {selectedReport === 'stock-movement' && (
            <FilterField label="Sản phẩm cụ thể">
              <select
                value={productId}
                onChange={(e) => onProductChange(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Tất cả sản phẩm --</option>
                {products.map((product) => (
                  <option
                    key={product.productId || product.id}
                    value={product.productId || product.id}
                  >
                    {product.productCode || product.code} - {product.productName || product.name}
                  </option>
                ))}
              </select>
            </FilterField>
          )}

          {selectedReport === 'revenue-by-time' && (
            <FilterField label="Gom nhóm theo">
              <select
                value={timeGrouping}
                onChange={(e) => onTimeGroupingChange(e.target.value)}
                className={selectClass}
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
            </FilterField>
          )}

          {selectedReport === 'low-stock' && (
            <FilterField label="Tuỳ chọn hiển thị">
              <div className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 dark:border-[#404040] dark:bg-[#1a1a1a]">
                <input
                  id="includeZeroStock"
                  type="checkbox"
                  checked={includeZeroStock}
                  onChange={(e) => onIncludeZeroStockChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#404040]"
                />
                <label
                  htmlFor="includeZeroStock"
                  className="cursor-pointer text-sm font-medium text-slate-700 dark:text-[#b3b3b3]"
                >
                  Bao gồm cả sản phẩm tồn = 0
                </label>
              </div>
            </FilterField>
          )}

          {selectedReport === 'product-profit' && (
            <FilterField label="Sắp xếp theo">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className={selectClass}
              >
                <option value="revenue">Doanh thu cao nhất</option>
                <option value="profit">Lợi nhuận cao nhất</option>
                <option value="quantity">Bán chạy nhất</option>
              </select>
            </FilterField>
          )}

          {selectedReport === 'supplier-detail' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FilterField label="Mua từ ngày">
                  <Input
                    type="date"
                    value={purchaseFromDate}
                    onChange={(e) => onPurchaseFromDateChange(e.target.value)}
                  />
                </FilterField>
                <FilterField label="Mua đến ngày">
                  <Input
                    type="date"
                    value={purchaseToDate}
                    onChange={(e) => onPurchaseToDateChange(e.target.value)}
                  />
                </FilterField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FilterField label="TT từ ngày">
                  <Input
                    type="date"
                    value={paymentFromDate}
                    onChange={(e) => onPaymentFromDateChange(e.target.value)}
                  />
                </FilterField>
                <FilterField label="TT đến ngày">
                  <Input
                    type="date"
                    value={paymentToDate}
                    onChange={(e) => onPaymentToDateChange(e.target.value)}
                  />
                </FilterField>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default ReportFilters;
