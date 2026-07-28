/**
 * GoodsIssueList - Container Page: Danh sách phiếu xuất kho.
 * Layout bám sát InventoryProduct: Sidebar lọc bên trái, Search + Actions + Table bên phải.
 */
import { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import GoodsIssueFilterSidebar from '../components/goodsissue/GoodsIssueFilterSidebar';
import GoodsIssueTable from '../components/goodsissue/GoodsIssueTable';
import GoodsIssuePopup from '../components/goodsissue/GoodsIssuePopup';
import { useGoodsIssueList } from '../hooks/useGoodsIssueList';

const GoodsIssueList = () => {
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const {
    issues,
    apiStatus,
    searchTerm,
    setSearchTerm,
    timePreset,
    setTimePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    timePresets,
    issueTypeFilter,
    setIssueTypeFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    syncStatusFilter,
    setSyncStatusFilter,
    customerFilter,
    setCustomerFilter,
    creatorFilter,
    setCreatorFilter,
    amountFrom,
    setAmountFrom,
    amountTo,
    setAmountTo,
    timeSelectedLabel,
    setTimeSelectedLabel,
    timeQuickOpen,
    setTimeQuickOpen,
    timeCustomOpen,
    setTimeCustomOpen,
    timeRef,
    distinctCustomers,
    distinctCreators,
    distinctIssueTypes,
    resetFilters,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    handleDeleteIssue,
    totalsByField,
    totalCount,
  } = useGoodsIssueList();

  const safeTotalCount = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(safeTotalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagedIssues = issues.slice(startIdx, startIdx + pageSize);

  const filters = {
    searchTerm,
    setSearchTerm,
    timePreset,
    setTimePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    timePresets,
    issueTypeFilter,
    setIssueTypeFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    syncStatusFilter,
    setSyncStatusFilter,
    customerFilter,
    setCustomerFilter,
    creatorFilter,
    setCreatorFilter,
    amountFrom,
    setAmountFrom,
    amountTo,
    setAmountTo,
    timeSelectedLabel,
    setTimeSelectedLabel,
    timeQuickOpen,
    setTimeQuickOpen,
    timeCustomOpen,
    setTimeCustomOpen,
    timeRef,
    distinctCustomers,
    distinctCreators,
    distinctIssueTypes,
    resetFilters,
    totalCount,
  };

  const handleExport = () => {
    alert('Đang Xuất file Excel...');
  };

  return (
    <div className="mt-12 w-full space-y-4">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Xuất kho</h1>
        <p className="mt-1 text-gray-600 dark:text-[#999999]">Quản lý phiếu xuất kho và theo dõi hàng hóa xuất</p>
      </div>

      {/* API Status Banner */}
      <div className="flex w-full">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
            apiStatus.error
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {apiStatus.loading
            ? 'Đang đồng bộ dữ liệu API...'
            : apiStatus.error || 'Đã đồng bộ dữ liệu phiếu xuất từ API'}
        </div>
      </div>

      {/* Main: Sidebar + Content */}
      <div className="relative flex w-full min-w-0 items-start gap-6 pb-6 pt-2">
        {/* Sidebar Filter bên trái */}
        <GoodsIssueFilterSidebar
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={setIsFilterCollapsed}
          filters={filters}
        />

        {/* Khối bên phải: Search + Actions + Table + Pagination */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {/* Thanh Search + Nút Thao tác nhanh */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] p-4 shadow-sm">
            <div className="flex min-w-[240px] max-w-lg flex-1 items-center rounded-lg border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-3 py-1.5">
              <Icon name="search" className="mr-2 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
                placeholder="Nhập Số phiếu, Đối tượng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon name="tune" className="ml-2 cursor-pointer text-slate-400" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black"
                onClick={() => {
                  setEditingRow(null);
                  setShowPopup(true);
                }}
              >
                <Icon name="add" className="text-sm" />
                <span>Tạo phiếu xuất</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#333333] px-4 py-2 text-sm font-bold text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333]"
                onClick={handleExport}
              >
                <Icon name="download" className="text-sm" />
                <span>Xuất file</span>
              </button>
            </div>
          </div>

          {/* Thanh thông tin: kết quả + filter đang active */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-[#999999]">
              <span>
                <strong className="text-slate-700 dark:text-[#b3b3b3]">{totalCount}</strong> phiếu xuất
              </span>
              {timePreset !== 'all' && timeSelectedLabel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {timeSelectedLabel}
                  <button
                    type="button"
                    className="ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={() => {
                      setTimePreset('all');
                      setTimeSelectedLabel('Toàn thời gian');
                    }}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              )}
              {issueTypeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {issueTypeFilter}
                  <button
                    type="button"
                    className="ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={() => setIssueTypeFilter('all')}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              )}
              {paymentMethodFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {paymentMethodFilter}
                  <button
                    type="button"
                    className="ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={() => setPaymentMethodFilter('all')}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              )}
              {syncStatusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {syncStatusFilter === 'synced' ? 'Đã đồng bộ' : 'Chưa đồng bộ'}
                  <button
                    type="button"
                    className="ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={() => setSyncStatusFilter('all')}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              )}
              {customerFilter && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {customerFilter}
                  <button
                    type="button"
                    className="ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={() => setCustomerFilter('')}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              )}
            </div>
            {totalCount > 0 && (
              <span className="text-xs text-slate-400">
                Hiển thị {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, totalCount)}
              </span>
            )}
          </div>

          {/* Bảng dữ liệu + Footer phân trang */}
          <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] shadow-sm">
            <div className="w-full overflow-x-auto">
              <GoodsIssueTable
                issues={pagedIssues}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onEdit={(row) => {
                  setEditingRow(row);
                  setShowPopup(true);
                }}
                onDelete={handleDeleteIssue}
                totalsByField={totalsByField}
              />
            </div>

            {/* Pagination Footer */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-slate-300 dark:border-[#404040] px-2 py-1 text-xs outline-none focus:border-primary focus:ring-primary"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {totalCount === 0 ? '0' : (safePage - 1) * pageSize + 1} -{' '}
                  {Math.min(safePage * pageSize, totalCount)} trong {totalCount} phiếu xuất
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-300 dark:border-[#404040] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                  Trang {totalPages === 0 ? 1 : safePage} / {totalPages === 0 ? 1 : totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 dark:border-[#404040] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Thêm mới / Sửa Phiếu Xuất Kho */}
      <GoodsIssuePopup
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setEditingRow(null);
        }}
        editData={editingRow}
      />
    </div>
  );
};

export default GoodsIssueList;
