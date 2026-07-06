import { useState } from 'react';
import { Filter, RotateCcw, Calendar, Tag, Layers } from 'lucide-react';

export const InventoryFilterBar = ({
  type = 'INWARD', // 'INWARD' hoặc 'OUTWARD'
  filters,
  onChangeFilter,
  onResetFilter,
  branches = [], // Danh sách chi nhánh (Nếu là Owner)
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Danh sách phân loại theo từng nghiệp vụ
  const ticketTypes =
    type === 'INWARD'
      ? [
          { value: '', label: 'Tất cả loại nhập' },
          { value: 'PURCHASE', label: 'Nhập hàng từ NCC' },
          { value: 'CUSTOMER_RETURN', label: 'Khách hàng trả lại' },
          { value: 'BALANCE_ADJUST', label: 'Cân bằng kiểm kho' },
        ]
      : [
          { value: '', label: 'Tất cả loại xuất' },
          { value: 'RETURN_SUPPLIER', label: 'Trả hàng cho NCC' },
          { value: 'WRITE_OFF', label: 'Xuất hủy / Hao hụt' },
          { value: 'TRANSFER', label: 'Xuất điều chuyển nội bộ' },
        ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all">
      {/* Hàng 1: Bộ lọc nhanh (Trạng thái) & Nút mở rộng */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter size={14} /> Lọc trạng thái:
          </span>
          {[
            { value: '', label: 'Mặc định' },
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'COMPLETED', label: 'Hoàn tất' },
            { value: 'CANCELLED', label: 'Đã hủy' },
            { value: 'ALL', label: 'Hiển thị tất cả' },
          ].map((item) => {
            const isActive = (filters.status || '') === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChangeFilter('status', item.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Layers size={14} className="text-sky-600" />
            {isExpanded ? 'Thu gọn bộ lọc' : 'Lọc nâng cao'}
          </button>

          {/* Nút Đặt lại chỉ hiện khi có ít nhất 1 filter đang kích hoạt */}
          {(filters.status ||
            filters.ticketType ||
            filters.fromDate ||
            filters.toDate ||
            filters.branchId) && (
            <button
              type="button"
              onClick={onResetFilter}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
              title="Xóa toàn bộ bộ lọc"
            >
              <RotateCcw size={13} /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Hàng 2: Bộ lọc nâng cao (Mở rộng) */}
      {isExpanded && (
        <div className="animate-in fade-in grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-3 duration-200 sm:grid-cols-2 lg:grid-cols-4">
          {/* Lọc theo loại phiếu */}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <Tag size={13} /> Phân loại phiếu:
            </label>
            <select
              value={filters.ticketType || ''}
              onChange={(e) => onChangeFilter('ticketType', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-sky-500"
            >
              {ticketTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc từ ngày */}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <Calendar size={13} /> Từ ngày:
            </label>
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => onChangeFilter('fromDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-sky-500"
            ></input>
          </div>

          {/* Lọc đến ngày */}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <Calendar size={13} /> Đến ngày:
            </label>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => onChangeFilter('toDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-sky-500"
            ></input>
          </div>

          {/* Lọc theo Chi nhánh (Chỉ hiển thị nếu truyền vào danh sách branches) */}
          {/* {branches && branches.length > 0 && (
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
                <Building2 size={13} /> Chi nhánh (Owner):
              </label>
              <select
                value={filters.branchId || ''}
                onChange={(e) => onChangeFilter('branchId', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-sky-500"
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};
