/**
 * InventorySummaryReport - Trang Báo cáo Tổng hợp Tồn kho.
 * Gồm: Topbar (filter chips + action buttons) + Bảng multi-header + Sticky total row.
 */
import { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import ReportFilterSidebar from '../components/report/ReportFilterSidebar';
import ReportParamsModal from '../components/report/ReportParamsModal';
import SummaryReportTable from '../components/report/SummaryReportTable';
import { useInventoryReport } from '../hooks/useInventoryReport';
import { reportPeriods } from '../data/reportMockData';

const periodLabel = (val) => reportPeriods.find((p) => p.value === val)?.label || val;

const InventorySummaryReport = () => {
  const rpt = useInventoryReport();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const showWarehouseCol = !rpt.appliedParams.mergeWarehouses;

  const filterProps = {
    period: rpt.period,
    setPeriod: rpt.setPeriod,
    dateFrom: rpt.dateFrom,
    setDateFrom: rpt.setDateFrom,
    dateTo: rpt.dateTo,
    setDateTo: rpt.setDateTo,
    selectedWarehouses: rpt.selectedWarehouses,
    onToggleWarehouse: rpt.handleWarehouseToggle,
    mergeWarehouses: rpt.mergeWarehouses,
    setMergeWarehouses: rpt.setMergeWarehouses,
    onlyWithMovement: rpt.onlyWithMovement,
    setOnlyWithMovement: rpt.setOnlyWithMovement,
    onApply: rpt.handleApply,
  };

  return (
    <div className="mt-12 w-full space-y-4">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng hợp tồn kho</h1>
        <p className="mt-1 text-gray-600">
          Báo cáo số lượng và giá trị tồn kho theo thời gian thực
        </p>
      </div>

      {/* Main: Sidebar + Content */}
      <div className="relative flex w-full min-w-0 items-start gap-6 pb-6 pt-2">
        <ReportFilterSidebar
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={setIsFilterCollapsed}
          filters={filterProps}
        />

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {/* Filter Chips + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Kỳ: {periodLabel(rpt.appliedParams.period)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Kho: {rpt.appliedParams.warehouses.join(', ')}
              </span>
              {rpt.appliedParams.mergeWarehouses && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  Đã cộng gộp kho
                </span>
              )}
              {rpt.appliedParams.onlyWithMovement && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Chỉ có phát sinh
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                <strong className="text-slate-700">{rpt.filteredRows.length}</strong> dòng
              </span>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => rpt.handleApply()}
              >
                <Icon name="cached" className="text-sm" />
                Tải lại
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Icon name="download" className="text-sm" />
                Xuất khẩu
              </button>
            </div>
          </div>

          {/* Bảng báo cáo + Footer liền khối */}
          <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <SummaryReportTable
                rows={rpt.pagedRows}
                totals={rpt.totals}
                showWarehouseCol={showWarehouseCol}
              />
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={rpt.pageSize}
                    onChange={(e) => {
                      rpt.setPageSize(Number(e.target.value));
                      rpt.setCurrentPage(1);
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary focus:ring-primary"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {rpt.totalCount === 0 ? '0' : (rpt.currentPage - 1) * rpt.pageSize + 1} -{' '}
                  {Math.min(rpt.currentPage * rpt.pageSize, rpt.totalCount)} trong {rpt.totalCount}{' '}
                  dòng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => rpt.setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={rpt.currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700">
                  Trang {rpt.totalPages === 0 ? 1 : rpt.currentPage} /{' '}
                  {Math.max(1, Math.ceil(rpt.totalCount / rpt.pageSize))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    rpt.setCurrentPage((p) =>
                      Math.min(Math.ceil(rpt.totalCount / rpt.pageSize), p + 1)
                    )
                  }
                  disabled={rpt.currentPage >= Math.ceil(rpt.totalCount / rpt.pageSize)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Tham số báo cáo */}
      <ReportParamsModal
        isOpen={rpt.showParams}
        onClose={() => rpt.setShowParams(false)}
        period={rpt.period}
        setPeriod={rpt.setPeriod}
        dateFrom={rpt.dateFrom}
        setDateFrom={rpt.setDateFrom}
        dateTo={rpt.dateTo}
        setDateTo={rpt.setDateTo}
        selectedWarehouses={rpt.selectedWarehouses}
        onToggleWarehouse={rpt.handleWarehouseToggle}
        mergeWarehouses={rpt.mergeWarehouses}
        setMergeWarehouses={rpt.setMergeWarehouses}
        onlyWithMovement={rpt.onlyWithMovement}
        setOnlyWithMovement={rpt.setOnlyWithMovement}
        onApply={rpt.handleApply}
      />
    </div>
  );
};

export default InventorySummaryReport;
