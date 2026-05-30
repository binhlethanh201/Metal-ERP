/**
 * InventoryCountList - Trang Danh sách Kiểm kê kho.
 */
import Icon from '../../../shared/components/Icon';
import InventoryCountTable from '../components/count/InventoryCountTable';
import { useInventoryCount } from '../hooks/useInventoryCount';

const InventoryCountList = () => {
  const ct = useInventoryCount();

  return (
    <div className="mt-12 w-full space-y-4">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kiểm kê kho</h1>
        <p className="mt-1 text-gray-600">Quản lý danh sách phiếu kiểm kê hàng tồn kho</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Icon name="search" className="mr-2 text-slate-400" />
            <input
              className="w-48 border-none bg-transparent text-sm outline-none"
              placeholder="Số phiếu, kho, người KK..."
              value={ct.searchTerm}
              onChange={(e) => ct.setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={ct.timeFilter}
            onChange={(e) => ct.setTimeFilter(e.target.value)}
          >
            <option value="all">Tất cả thời gian</option>
            <option value="thisMonth">Tháng này</option>
            <option value="lastMonth">Tháng trước</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Icon name="more_horiz" className="text-sm" /> Tiện ích
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={() => {
              ct.setSearchTerm('');
              ct.setTimeFilter('all');
            }}
          >
            <Icon name="cached" className="text-sm" /> Nạp
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Icon name="download" className="text-sm" /> Xuất khẩu
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Icon name="tune" className="text-sm" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-black"
          >
            <Icon name="add" className="text-sm" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <InventoryCountTable
            rows={ct.rows}
            selectedIds={ct.selectedIds}
            onSelectAll={(checked) => ct.setSelectedIds(checked ? ct.rows.map((r) => r.id) : [])}
            onSelectOne={(id, checked) =>
              ct.setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
            }
            onRowClick={(row) => alert(`Chi tiết phiếu ${row.countNumber} (demo)`)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              Tổng số: <strong>{ct.totalCount}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={ct.pageSize}
                onChange={(e) => {
                  ct.setPageSize(Number(e.target.value));
                  ct.setCurrentPage(1);
                }}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => ct.setCurrentPage(1)}
              disabled={ct.currentPage <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_left" size={14} />
              <Icon name="chevron_left" size={14} className="-ml-2" />
            </button>
            <button
              type="button"
              onClick={() => ct.setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={ct.currentPage <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_left" size={14} />
            </button>
            <span className="px-3 text-sm text-slate-700">
              Trang {ct.currentPage}/{ct.totalPages}
            </span>
            <button
              type="button"
              onClick={() => ct.setCurrentPage((p) => Math.min(ct.totalPages, p + 1))}
              disabled={ct.currentPage >= ct.totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_right" size={14} />
            </button>
            <button
              type="button"
              onClick={() => ct.setCurrentPage(ct.totalPages)}
              disabled={ct.currentPage >= ct.totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_right" size={14} />
              <Icon name="chevron_right" size={14} className="-ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCountList;
