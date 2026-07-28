/**
 * GoodsIssueToolbar - Thanh công cụ cho màn hình danh sách phiếu xuất.
 * Gồm: Search đa năng, Filter thời gian, Refresh, Export, Cài đặt cột, + Thêm mới.
 */
import Icon from '../../../../shared/components/Icon';

const GoodsIssueToolbar = ({
  searchTerm,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  onRefresh,
  onExport,
  onColumnSettings,
  onCreateNew,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
      {/* Left: Search + Time Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[280px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <Icon name="search" className="mr-2 text-slate-400 dark:text-[#808080]" />
          <input
            className="w-full border-none bg-transparent text-sm outline-none focus:ring-0 dark:text-[#e5e5e5]"
            placeholder="Nhập Số phiếu, Đối tượng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value)}
        >
          <option value="all">Tất cả Thời gian</option>
          <option value="thisMonth">Tháng này</option>
          <option value="lastMonth">Tháng trước</option>
        </select>
      </div>

      {/* Right: Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
          onClick={onRefresh}
          title="Tải lại"
        >
          <Icon name="cached" className="text-base" />
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
          onClick={onExport}
        >
          <Icon name="download" className="text-base" />
          <span>Xuất file</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
          onClick={onColumnSettings}
          title="Cài đặt cột"
        >
          <Icon name="tune" className="text-base" />
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#004785] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003566] active:scale-95"
          onClick={onCreateNew}
        >
          <Icon name="add" className="text-base" />
          <span>+ Thêm mới</span>
        </button>
      </div>
    </div>
  );
};

export default GoodsIssueToolbar;
